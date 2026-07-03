(() => {
  const result = {
    cls: 0,
    tti_estimate: 0,
    blocking_resources: [],
    large_images_no_lazy: [],
    performance_metrics: {},
    dom_size: 0,
    lagginess_factors: []
  };

  // 1. CLS - Best effort after load
  if (window.PerformanceObserver) {
    // Note: This won't capture shifts that happened BEFORE this script ran if not buffered.
    // However, we'll check performance entries.
    const entries = performance.getEntriesByType('layout-shift');
    entries.forEach(entry => {
      if (!entry.hadRecentInput) {
        result.cls += entry.value;
      }
    });
  }

  // 2. TTI Estimate
  const nt = performance.getEntriesByType('navigation')[0];
  if (nt) {
    result.tti_estimate = nt.loadEventEnd; // Simple surrogate
    result.performance_metrics = {
      dns: nt.domainLookupEnd - nt.domainLookupStart,
      tcp: nt.connectEnd - nt.connectStart,
      ttfb: nt.responseStart - nt.requestStart,
      domInteractive: nt.domInteractive,
      domContentLoaded: nt.domContentLoadedEventEnd,
      loadEventEnd: nt.loadEventEnd
    };
  }

  // 3. Blocking Resources
  const resources = performance.getEntriesByType('resource');
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  scripts.forEach(s => {
    if (!s.async && !s.defer && !s.type === 'module') {
      const entry = resources.find(r => r.name === s.src);
      result.blocking_resources.push({
        url: s.src,
        size: entry ? entry.transferSize : 'unknown',
        duration: entry ? entry.duration : 'unknown'
      });
    }
  });
  // Sort by size
  result.blocking_resources.sort((a, b) => (b.size || 0) - (a.size || 0));

  // 4. Large Images without Lazy Loading
  const images = Array.from(document.querySelectorAll('img'));
  images.forEach(img => {
    const isLazy = img.getAttribute('loading') === 'lazy' || img.classList.contains('lazyload') || img.getAttribute('data-src');
    const rect = img.getBoundingClientRect();
    if (!isLazy && (rect.width > 200 || rect.height > 200 || img.src.length > 0)) {
       // We can't easily check file size in JS without fetch, but we can flag potential candidates
       result.large_images_no_lazy.push({
         src: img.src,
         width: img.naturalWidth,
         height: img.naturalHeight,
         alt: img.alt
       });
    }
  });

  // 5. Lagginess factors
  result.dom_size = document.getElementsByTagName('*').length;
  if (result.dom_size > 1500) result.lagginess_factors.push('Large DOM size (' + result.dom_size + ' nodes)');
  
  const longTasks = performance.getEntriesByType('longtask');
  if (longTasks.length > 0) {
    result.lagginess_factors.push(longTasks.length + ' long tasks detected (>50ms)');
  }

  return result;
})()