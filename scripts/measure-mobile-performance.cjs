const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME = process.env.BPF_CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForJson(url, attempts = 80) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(100);
  }
  throw lastError || new Error(`Unable to read ${url}`);
}

class CdpClient {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', event => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result || {});
        return;
      }
      for (const listener of this.listeners.get(message.method) || []) listener(message.params || {});
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) || [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }

  waitFor(method, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeoutMs);
      const listener = params => {
        clearTimeout(timer);
        const listeners = this.listeners.get(method) || [];
        this.listeners.set(method, listeners.filter(item => item !== listener));
        resolve(params);
      };
      this.on(method, listener);
    });
  }

  close() {
    this.ws.close();
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const urls = [];
  let runs = 1;
  let summary = false;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--url' && args[index + 1]) urls.push(args[++index]);
    else if (args[index] === '--runs' && args[index + 1]) runs = Math.max(1, Number(args[++index]) || 1);
    else if (args[index] === '--summary') summary = true;
  }
  if (!urls.length) {
    urls.push(
      'https://www.bestpackfactory.com/',
      'https://www.bestpackfactory.com/products/custom-ribbon.html',
      'https://www.bestpackfactory.com/blog.html'
    );
  }
  return { urls, runs, summary };
}

const observerScript = `
(() => {
  window.__bpfPerf = { cls: 0, lcp: null, longTaskMs: 0, longTaskCount: 0 };
  try {
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__bpfPerf.cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (_) {}
  try {
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const element = entry.element;
        window.__bpfPerf.lcp = {
          value: entry.startTime,
          size: entry.size,
          url: entry.url || '',
          element: element ? (element.tagName + (element.className ? '.' + String(element.className).trim().replace(/\\s+/g, '.') : '')) : ''
        };
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (_) {}
  try {
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        window.__bpfPerf.longTaskCount += 1;
        window.__bpfPerf.longTaskMs += Math.max(0, entry.duration - 50);
      }
    }).observe({ type: 'longtask', buffered: true });
  } catch (_) {}
})();`;

async function measure(client, url) {
  const requests = new Map();
  client.on('Network.responseReceived', event => {
    requests.set(event.requestId, {
      url: event.response.url,
      status: event.response.status,
      mimeType: event.response.mimeType,
      fromDiskCache: Boolean(event.response.fromDiskCache),
      fromServiceWorker: Boolean(event.response.fromServiceWorker),
      encodedDataLength: 0
    });
  });
  client.on('Network.loadingFinished', event => {
    const request = requests.get(event.requestId);
    if (request) request.encodedDataLength = event.encodedDataLength || 0;
  });

  await Promise.all([
    client.send('Page.enable'),
    client.send('Runtime.enable'),
    client.send('Network.enable'),
    client.send('Performance.enable')
  ]);
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
    screenWidth: 390,
    screenHeight: 844,
    scale: 1
  });
  await client.send('Emulation.setVisibleSize', { width: 390, height: 844 });
  await client.send('Emulation.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    platform: 'Android'
  });
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: 1.6 * 1024 * 1024 / 8,
    uploadThroughput: 750 * 1024 / 8,
    connectionType: 'cellular4g'
  });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await client.send('Page.addScriptToEvaluateOnNewDocument', { source: observerScript });

  const loaded = client.waitFor('Page.loadEventFired', 60000);
  const startedAt = Date.now();
  await client.send('Page.navigate', { url });
  await loaded;
  await sleep(2500);

  const evaluated = await client.send('Runtime.evaluate', {
    expression: `JSON.stringify((() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      const wanted = resources.filter(item => /main\\.js|main-bootstrap|products-search|style\\.css|_next\\/static|fonts\\.googleapis|fonts\\.gstatic|wa\\.me/.test(item.name));
      return {
        perf: window.__bpfPerf,
        navigation: nav ? {
          ttfb: nav.responseStart,
          domContentLoaded: nav.domContentLoadedEventEnd,
          load: nav.loadEventEnd,
          transferSize: nav.transferSize,
          encodedBodySize: nav.encodedBodySize
        } : null,
        resources: wanted.map(item => ({
          name: item.name,
          initiatorType: item.initiatorType,
          startTime: item.startTime,
          duration: item.duration,
          transferSize: item.transferSize,
          encodedBodySize: item.encodedBodySize
        })),
        resourceCount: resources.length,
        transferSize: resources.reduce((sum, item) => sum + (item.transferSize || 0), 0),
        mainScriptPresent: resources.some(item => /\\/js\\/main\\.js/.test(item.name)),
        bootstrapPresent: resources.some(item => /main-bootstrap/.test(item.name)),
        productSearchRequested: resources.some(item => /\\/api\\/products-search/.test(item.name)),
        h1Count: document.querySelectorAll('h1').length,
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        chatPresent: Boolean(document.querySelector('.bpf-whatsapp-chat')),
        fontLoading: {
          stylesheetRel: document.querySelector('#bpf-inter-font-stylesheet')?.rel || '',
          interAvailable: Boolean(document.fonts?.check('16px Inter')),
          bodyFontFamily: getComputedStyle(document.body).fontFamily
        },
        mobileMenu: (() => {
          const toggle = document.querySelector('.mobile-menu-toggle');
          const panel = document.querySelector('.mobile-nav-panel');
          if (!toggle || !panel) return { togglePresent: Boolean(toggle), panelPresent: Boolean(panel), opens: false, closes: false };
          const initiallyClosed = !panel.classList.contains('is-open') && panel.getAttribute('aria-hidden') === 'true';
          toggle.click();
          const opens = panel.classList.contains('is-open') && panel.getAttribute('aria-hidden') === 'false' && document.body.classList.contains('mobile-menu-open');
          document.querySelector('.mobile-menu-close')?.click();
          const closes = !panel.classList.contains('is-open') && panel.getAttribute('aria-hidden') === 'true' && !document.body.classList.contains('mobile-menu-open');
          return { togglePresent: true, panelPresent: true, initiallyClosed, opens, closes };
        })(),
        viewport: [innerWidth, innerHeight],
        viewportMeta: document.querySelector('meta[name="viewport"]')?.content || '',
        visualViewport: window.visualViewport ? [window.visualViewport.width, window.visualViewport.height, window.visualViewport.scale] : null,
        screenSize: [screen.width, screen.height],
        devicePixelRatio,
        documentClientWidth: document.documentElement.clientWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body?.scrollWidth || 0,
        overflowElements: [...document.querySelectorAll('body *')]
          .map(element => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return {
              tag: element.tagName,
              id: element.id || '',
              className: typeof element.className === 'string' ? element.className.slice(0, 160) : '',
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              minWidth: style.minWidth,
              position: style.position,
              overflowX: style.overflowX
            };
          })
          .filter(item => item.left < -1 || item.right > document.documentElement.clientWidth + 1 || item.width > document.documentElement.clientWidth + 1)
          .sort((a, b) => b.width - a.width)
          .slice(0, 20)
      };
    })())`,
    returnByValue: true,
    awaitPromise: true
  });
  const data = JSON.parse(evaluated.result.value);
  const network = [...requests.values()];
  data.url = url;
  data.wallTimeMs = Date.now() - startedAt;
  data.networkEncodedBytes = network.reduce((sum, item) => sum + (item.encodedDataLength || 0), 0);
  data.networkRequests = network.length;
  data.failedResponses = network.filter(item => item.status >= 400).map(item => ({ url: item.url, status: item.status }));
  return data;
}

async function runSingle(url, runNumber) {
  if (!fs.existsSync(CHROME)) throw new Error(`Chrome not found: ${CHROME}`);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'bpf-chrome-perf-'));
  const port = 19000 + Math.floor(Math.random() * 10000);
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-features=Translate,MediaRouter',
    '--force-device-scale-factor=1',
    '--window-size=390,844',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    'about:blank'
  ], { stdio: 'ignore', windowsHide: true });
  let client;
  try {
    await waitForJson(`http://127.0.0.1:${port}/json/version`);
    const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }).then(response => response.json());
    client = new CdpClient(target.webSocketDebuggerUrl);
    await client.ready;
    const result = await measure(client, url);
    result.run = runNumber;
    if (process.env.BPF_PERF_PROGRESS_JSON === '1') {
      process.stderr.write(`BPF_PERF_RESULT=${JSON.stringify(result)}\n`);
    }
    return result;
  } finally {
    if (client) client.close();
    chrome.kill();
    await sleep(150);
    const tempRoot = path.resolve(os.tmpdir()).toLowerCase();
    const resolvedProfile = path.resolve(profile).toLowerCase();
    if (resolvedProfile.startsWith(`${tempRoot}${path.sep}`)) {
      try {
        fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      } catch (error) {
        process.stderr.write(`Warning: unable to remove temporary Chrome profile ${profile}: ${error.message}\n`);
      }
    }
  }
}

async function main() {
  const { urls, runs, summary } = parseArgs();
  const results = [];
  for (const url of urls) {
    for (let run = 1; run <= runs; run += 1) {
      process.stderr.write(`Measuring ${url} (run ${run}/${runs})...\n`);
      results.push(await runSingle(url, run));
    }
  }
  const output = {
    profile: { viewport: '390x844', network: '1.6 Mbps / 150 ms RTT', cpuThrottle: 4, cacheDisabled: true },
    results
  };
  if (summary) {
    output.results = results.map(result => ({
      url: result.url,
      run: result.run,
      lcpMs: result.perf?.lcp?.value ?? null,
      cls: result.perf?.cls ?? null,
      ttfbMs: result.navigation?.ttfb ?? null,
      resourceCount: result.resourceCount,
      transferSize: result.transferSize,
      networkRequests: result.networkRequests,
      networkEncodedBytes: result.networkEncodedBytes,
      failedResponses: result.failedResponses,
      trackedResources: result.resources.map(item => item.name),
      documentWidth: result.documentScrollWidth,
      mobileMenu: result.mobileMenu,
      fontLoading: result.fontLoading
    }));
  }
  console.log(JSON.stringify(output, null, 2));
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
