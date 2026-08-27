const MENU_ID = 'bestpack-ai-analyze-selection';

async function configureExtension() {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: MENU_ID,
    title: '用 BestPack AI 分析：“%s”',
    contexts: ['selection']
  });
}

chrome.runtime.onInstalled.addListener(() => {
  configureExtension().catch(console.error);
});

chrome.runtime.onStartup.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !info.selectionText) return;

  const pendingMessage = {
    text: info.selectionText.trim().slice(0, 8000),
    pageTitle: tab?.title || '',
    pageUrl: info.pageUrl || tab?.url || '',
    receivedAt: Date.now()
  };

  const storeMessage = chrome.storage.local.set({ pendingMessage });
  const openPanel = tab?.windowId != null
    ? chrome.sidePanel.open({ windowId: tab.windowId })
    : Promise.resolve();
  await Promise.all([storeMessage, openPanel]);
});
