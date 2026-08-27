const DEFAULTS = {
  backendUrl: 'http://127.0.0.1:3000',
  accessToken: '',
  autoAnalyze: true,
  lastHandledSelection: 0
};

const intentLabels = {
  quotation: '询价',
  product_question: '产品咨询',
  sample_request: '样品申请',
  order_status: '订单进度',
  shipping: '物流运输',
  complaint: '投诉售后',
  payment: '付款问题',
  partnership: '合作咨询',
  general: '一般咨询',
  other: '其他'
};

const entityLabels = {
  customer_name: '客户姓名', company: '公司', email: '邮箱', phone: '电话',
  product: '产品', quantity: '数量', material: '材料', dimensions: '尺寸',
  printing: '印刷', finish: '表面工艺', destination: '目的地', deadline: '交期', budget: '预算'
};

const urgencyLabels = { low: '低', normal: '普通', high: '高', critical: '紧急' };

const elements = {
  serviceStatus: document.querySelector('#service-status'),
  serviceStatusText: document.querySelector('#service-status span'),
  settingsButton: document.querySelector('#settings-button'),
  messageInput: document.querySelector('#message-input'),
  sourceInfo: document.querySelector('#source-info'),
  replyLanguage: document.querySelector('#reply-language'),
  analyzeButton: document.querySelector('#analyze-button'),
  feedback: document.querySelector('#feedback'),
  loading: document.querySelector('#loading'),
  result: document.querySelector('#result'),
  languageBadge: document.querySelector('#language-badge'),
  translationText: document.querySelector('#translation-text'),
  intentValue: document.querySelector('#intent-value'),
  urgencyValue: document.querySelector('#urgency-value'),
  confidenceValue: document.querySelector('#confidence-value'),
  reviewValue: document.querySelector('#review-value'),
  summaryText: document.querySelector('#summary-text'),
  entitiesCard: document.querySelector('#entities-card'),
  entitiesList: document.querySelector('#entities-list'),
  missingCard: document.querySelector('#missing-card'),
  missingList: document.querySelector('#missing-list'),
  reviewCard: document.querySelector('#review-card'),
  reviewReasons: document.querySelector('#review-reasons'),
  replyDraft: document.querySelector('#reply-draft'),
  replyLanguageLabel: document.querySelector('#reply-language-label'),
  copyButton: document.querySelector('#copy-button'),
  openWorkbench: document.querySelector('#open-workbench'),
  modelLabel: document.querySelector('#model-label')
};

function backendUrl(value) {
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

function setServiceStatus(configured, text, title = '') {
  elements.serviceStatus.dataset.ready = configured ? 'true' : 'false';
  elements.serviceStatusText.textContent = text;
  elements.serviceStatus.title = title || text;
}

function showFeedback(message, type = 'error') {
  elements.feedback.textContent = message;
  elements.feedback.dataset.type = type;
  elements.feedback.hidden = !message;
}

function setBusy(busy) {
  elements.loading.hidden = !busy;
  elements.analyzeButton.disabled = busy;
  elements.messageInput.disabled = busy;
}

function appendText(parent, tag, text, className = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  parent.appendChild(node);
  return node;
}

function renderEntities(entities = {}) {
  elements.entitiesList.replaceChildren();
  const entries = Object.entries(entities).filter(([, value]) => value);
  elements.entitiesCard.hidden = entries.length === 0;
  for (const [key, value] of entries) {
    const row = document.createElement('div');
    appendText(row, 'dt', entityLabels[key] || key);
    appendText(row, 'dd', String(value));
    elements.entitiesList.appendChild(row);
  }
}

function renderTags(items = []) {
  elements.missingList.replaceChildren();
  elements.missingCard.hidden = items.length === 0;
  for (const item of items) appendText(elements.missingList, 'span', item);
}

function renderReview(analysis) {
  const reasons = Array.isArray(analysis.review_reasons) ? analysis.review_reasons : [];
  elements.reviewCard.hidden = !analysis.requires_human_review;
  elements.reviewReasons.replaceChildren();
  for (const reason of reasons) appendText(elements.reviewReasons, 'p', reason);
}

function renderResult(analysis) {
  elements.languageBadge.textContent = `${analysis.source_language || '未知'} · ${String(analysis.source_language_code || '').toUpperCase()}`;
  elements.translationText.textContent = analysis.translation_zh || '';
  elements.intentValue.textContent = intentLabels[analysis.intent] || analysis.intent || '其他';
  elements.urgencyValue.textContent = urgencyLabels[analysis.urgency] || '普通';
  elements.urgencyValue.dataset.level = analysis.urgency || 'normal';
  elements.confidenceValue.textContent = Number.isFinite(Number(analysis.confidence)) ? `${Math.round(Number(analysis.confidence) * 100)}%` : '—';
  elements.reviewValue.textContent = analysis.requires_human_review ? '人工审核' : '可直接回复';
  elements.reviewValue.dataset.review = analysis.requires_human_review ? 'true' : 'false';
  elements.summaryText.textContent = analysis.summary_zh || '';
  elements.replyDraft.value = analysis.reply_customer_language || '';
  elements.replyLanguageLabel.textContent = analysis.source_language || '客户语言';
  renderEntities(analysis.entities);
  renderTags(analysis.missing_information);
  renderReview(analysis);
  elements.result.hidden = false;
}

async function getSettings() {
  const saved = await chrome.storage.local.get(DEFAULTS);
  return { ...saved, backendUrl: backendUrl(saved.backendUrl) };
}

async function checkStatus() {
  try {
    const settings = await getSettings();
    const response = await fetch(`${settings.backendUrl}/api/ai/customer-message`, { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || `HTTP ${response.status}`);
    setServiceStatus(result.configured, result.configured ? '已就绪' : '未就绪', result.message);
    elements.modelLabel.textContent = `${result.providerLabel || 'AI'} · ${result.model || '未知模型'}`;
    return result;
  } catch (error) {
    setServiceStatus(false, '未连接', error.message);
    elements.modelLabel.textContent = '请先启动本地服务';
    return null;
  }
}

async function analyze() {
  const message = elements.messageInput.value.trim();
  if (!message) {
    showFeedback('请先粘贴或选中一条客户消息。');
    elements.messageInput.focus();
    return;
  }

  showFeedback('');
  setBusy(true);
  try {
    const settings = await getSettings();
    const response = await fetch(`${settings.backendUrl}/api/ai/customer-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(settings.accessToken ? { 'X-AI-Workbench-Token': settings.accessToken } : {})
      },
      body: JSON.stringify({
        message,
        history: [],
        replyLanguage: elements.replyLanguage.value,
        conversationId: `chrome-extension-${Date.now()}`
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.message || `分析失败（HTTP ${response.status}）`);
    renderResult(result.analysis);
    setServiceStatus(true, '已就绪', `${result.providerLabel} · ${result.model}`);
    elements.modelLabel.textContent = `${result.providerLabel || 'AI'} · ${result.model || ''}`;
  } catch (error) {
    showFeedback(error.message || 'AI 服务暂时不可用。');
  } finally {
    setBusy(false);
  }
}

async function consumePendingMessage() {
  const state = await chrome.storage.local.get({ pendingMessage: null, ...DEFAULTS });
  const pending = state.pendingMessage;
  if (!pending?.text || pending.receivedAt <= state.lastHandledSelection) return;
  elements.messageInput.value = pending.text;
  elements.sourceInfo.textContent = pending.pageTitle ? `来自：${pending.pageTitle}` : '来自当前网页选中的文字';
  elements.sourceInfo.title = pending.pageUrl || '';
  elements.sourceInfo.hidden = false;
  await chrome.storage.local.set({ lastHandledSelection: pending.receivedAt });
  if (state.autoAnalyze) await analyze();
}

elements.analyzeButton.addEventListener('click', analyze);
elements.messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) analyze();
});
elements.settingsButton.addEventListener('click', () => chrome.runtime.openOptionsPage());
elements.copyButton.addEventListener('click', async () => {
  const reply = elements.replyDraft.value.trim();
  if (!reply) return;
  try {
    await navigator.clipboard.writeText(reply);
    elements.copyButton.textContent = '已复制 ✓';
    setTimeout(() => { elements.copyButton.textContent = '复制回复'; }, 1600);
  } catch {
    showFeedback('复制失败，请手动选择回复文本。');
  }
});
elements.openWorkbench.addEventListener('click', async () => {
  try {
    const settings = await getSettings();
    await chrome.tabs.create({ url: `${settings.backendUrl}/ai-inbox` });
  } catch (error) {
    showFeedback(error.message);
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.pendingMessage) consumePendingMessage().catch(console.error);
  if (areaName === 'local' && (changes.backendUrl || changes.accessToken)) checkStatus().catch(console.error);
});

Promise.all([checkStatus(), consumePendingMessage()]).catch((error) => showFeedback(error.message));
