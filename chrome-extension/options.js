const DEFAULTS = {
  backendUrl: 'http://127.0.0.1:3000',
  accessToken: '',
  autoAnalyze: true
};

const backendInput = document.querySelector('#backend-url');
const accessTokenInput = document.querySelector('#access-token');
const autoAnalyzeInput = document.querySelector('#auto-analyze');
const statusElement = document.querySelector('#status');
const saveButton = document.querySelector('#save-button');
const testButton = document.querySelector('#test-button');

function cleanUrl(value) {
  const parsed = new URL(String(value || DEFAULTS.backendUrl).trim());
  const octets = parsed.hostname.split('.').map(Number);
  const privateIPv4 = octets.length === 4 && octets.every((part) => Number.isInteger(part) && part >= 0 && part <= 255) && (
    octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168) ||
    octets[0] === 127
  );
  if (parsed.protocol !== 'http:' || (!privateIPv4 && parsed.hostname !== 'localhost')) {
    throw new Error('服务地址只允许使用 localhost 或局域网私有 IPv4 地址。');
  }
  return parsed.origin;
}

async function ensureHostPermission(origin) {
  const pattern = `${origin}/*`;
  if (await chrome.permissions.contains({ origins: [pattern] })) return true;
  return chrome.permissions.request({ origins: [pattern] });
}

function showStatus(message, type = '') {
  statusElement.textContent = message;
  statusElement.dataset.type = type;
}

async function loadSettings() {
  const saved = await chrome.storage.local.get(DEFAULTS);
  backendInput.value = saved.backendUrl;
  accessTokenInput.value = saved.accessToken;
  autoAnalyzeInput.checked = saved.autoAnalyze;
}

async function saveSettings() {
  try {
    const settings = {
      backendUrl: cleanUrl(backendInput.value),
      accessToken: accessTokenInput.value.trim(),
      autoAnalyze: autoAnalyzeInput.checked
    };
    const granted = await ensureHostPermission(settings.backendUrl);
    if (!granted) throw new Error('未授予该局域网主机的访问权限，设置没有保存。');
    await chrome.storage.local.set(settings);
    backendInput.value = settings.backendUrl;
    showStatus('设置已保存。', 'success');
    return settings;
  } catch (error) {
    showStatus(error.message, 'error');
    return null;
  }
}

async function testConnection() {
  testButton.disabled = true;
  showStatus('正在检查本地服务…');
  try {
    const backendUrl = cleanUrl(backendInput.value);
    const granted = await ensureHostPermission(backendUrl);
    if (!granted) throw new Error('需要授权访问该局域网主机。');
    const response = await fetch(`${backendUrl}/api/ai/customer-message`, { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || `HTTP ${response.status}`);
    if (result.configured) {
      showStatus(`连接成功：${result.providerLabel} · ${result.model}`, 'success');
    } else {
      showStatus(`服务已连接，但 AI 尚未就绪：${result.message}`, 'warning');
    }
  } catch (error) {
    showStatus(`连接失败：${error.message}`, 'error');
  } finally {
    testButton.disabled = false;
  }
}

saveButton.addEventListener('click', saveSettings);
testButton.addEventListener('click', testConnection);
loadSettings().catch((error) => showStatus(error.message, 'error'));
