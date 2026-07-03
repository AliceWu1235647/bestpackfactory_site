(() => {
  return new Promise((resolve) => {
    let longTasks = [];
    const observer = new PerformanceObserver((list) => {
      longTasks.push(...list.getEntries());
    });
    observer.observe({entryTypes: ['longtask']});

    // Simulate some interaction
    window.scrollTo(0, 1000);
    setTimeout(() => {
      window.scrollTo(0, 0);
      setTimeout(() => {
        observer.disconnect();
        resolve({
          long_task_count: longTasks.length,
          long_tasks: longTasks.map(t => ({duration: t.duration, startTime: t.startTime}))
        });
      }, 500);
    }, 500);
  });
})()