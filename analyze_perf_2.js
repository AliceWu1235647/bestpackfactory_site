(() => {
  const result = {
    resource_sizes: [],
    cls_after_scroll: 0,
    main_thread_blocking: null,
    images_status: []
  };

  // 1. Resource sizes
  const entries = performance.getEntriesByType('resource');
  entries.forEach(entry => {
    result.resource_sizes.push({
      name: entry.name,
      type: entry.initiatorType,
      size_kb: Math.round(entry.transferSize / 1024),
      duration_ms: Math.round(entry.duration)
    });
  });
  result.resource_sizes.sort((a, b) => b.size_kb - a.size_kb);

  // 2. CLS
  const shifts = performance.getEntriesByType('layout-shift');
  shifts.forEach(entry => {
    if (!entry.hadRecentInput) {
      result.cls_after_scroll += entry.value;
    }
  });

  // 3. Largest resource blocking main thread
  // Usually this is a script or CSS that takes long to load/execute
  // We'll look for the largest transfer size among scripts/css
  const blocking = result.resource_sizes.find(r => r.type === 'script' || r.type === 'link' || r.type === 'css');
  result.main_thread_blocking = blocking || null;

  // 4. Check lazy loading again
  const images = Array.from(document.querySelectorAll('img'));
  images.forEach(img => {
    result.images_status.push({
      src: img.src,
      loading: img.getAttribute('loading'),
      visible: img.getBoundingClientRect().top < window.innerHeight
    });
  });

  return result;
})()