'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './ai-inbox.module.css';

const STORAGE_KEY = 'bpf-ai-inbox-v1';

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
  customer_name: '客户姓名',
  company: '公司',
  email: '邮箱',
  phone: '电话',
  product: '产品',
  quantity: '数量',
  material: '材料',
  dimensions: '尺寸',
  printing: '印刷',
  finish: '表面工艺',
  destination: '目的地',
  deadline: '交期',
  budget: '预算'
};

const seedConversations = [
  {
    id: 'demo-maria',
    name: 'María García',
    company: 'Café Norte',
    channel: 'WhatsApp',
    locale: 'ES',
    updatedAt: '10:32',
    unread: 1,
    messages: [
      {
        id: 'maria-1',
        role: 'customer',
        content: 'Hola, necesitamos 500 bolsas de café de 250 g con válvula. ¿Pueden enviarlas a Madrid? También quiero saber el precio.',
        time: '10:32'
      }
    ],
    draft: '¡Hola María! Gracias por contactarnos. Sí, fabricamos bolsas de café de 250 g con válvula y podemos organizar el envío a Madrid. Para preparar una cotización precisa, ¿podría indicarnos el material o acabado que prefiere y compartir su diseño o número de colores de impresión?',
    lastAnalysis: {
      source_language: '西班牙语',
      source_language_code: 'es',
      translation_zh: '您好，我们需要500个带气阀的250克咖啡袋。可以发货到马德里吗？我也想了解价格。',
      intent: 'quotation',
      secondary_intents: ['shipping', 'product_question'],
      sentiment: 'neutral',
      urgency: 'normal',
      summary_zh: '西班牙客户询价500个250克带气阀咖啡袋，并确认能否发往马德里。',
      entities: {
        customer_name: 'María García', company: 'Café Norte', email: '', phone: '',
        product: '250克带气阀咖啡袋', quantity: '500个', material: '', dimensions: '',
        printing: '', finish: '', destination: 'Madrid, Spain', deadline: '', budget: ''
      },
      missing_information: ['材料或袋型结构', '印刷颜色或设计稿', '期望交期'],
      reply_customer_language: '',
      reply_zh: '您好，感谢您的咨询。我们可以生产250克带气阀咖啡袋并安排发往马德里。为了准确报价，请提供偏好的材料/表面效果，以及设计稿或印刷颜色数量。',
      confidence: 0.96,
      requires_human_review: true,
      review_reasons: ['客户要求正式报价，需要人工确认价格与运输成本']
    }
  },
  {
    id: 'demo-james',
    name: 'James Wilson',
    company: 'North & Co.',
    channel: 'Telegram',
    locale: 'EN',
    updatedAt: '09:48',
    unread: 0,
    messages: [
      { id: 'james-1', role: 'customer', content: 'Can you make 1,000 rigid magnetic gift boxes with a gold foil logo for delivery to the UK?', time: '09:48' }
    ],
    draft: '',
    lastAnalysis: null
  },
  {
    id: 'demo-amira',
    name: 'Amira Hassan',
    company: 'Nour Beauty',
    channel: 'WhatsApp',
    locale: 'AR',
    updatedAt: '昨天',
    unread: 2,
    messages: [
      { id: 'amira-1', role: 'customer', content: 'وصلت بعض العلب تالفة ونحتاج إلى حل سريع قبل إطلاق المنتج.', time: '昨天' }
    ],
    draft: '',
    lastAnalysis: null
  }
];

function makeId(prefix = 'item') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowLabel() {
  return new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
}

function confidenceLabel(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${Math.round(number * 100)}%` : '—';
}

function urgencyLabel(value) {
  return { low: '低', normal: '普通', high: '高', critical: '紧急' }[value] || '普通';
}

export default function AiInboxClient() {
  const [conversations, setConversations] = useState(seedConversations);
  const [selectedId, setSelectedId] = useState(seedConversations[0].id);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [replyLanguage, setReplyLanguage] = useState('');
  const [autoReply, setAutoReply] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [apiStatus, setApiStatus] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed?.conversations) && parsed.conversations.length) {
          setConversations(parsed.conversations);
          setSelectedId(parsed.selectedId || parsed.conversations[0].id);
        }
      }
      setAccessToken(sessionStorage.getItem('bpf-ai-access-token') || '');
    } catch {}
    fetch('/api/ai/customer-message', { cache: 'no-store' })
      .then((response) => response.json())
      .then(setApiStatus)
      .catch(() => setApiStatus({ configured: false, provider: 'ollama', providerLabel: 'Ollama · Qwen3', model: 'qwen3:8b', message: '无法读取 AI 服务状态。' }));
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversations, selectedId })); } catch {}
  }, [conversations, selectedId]);

  const active = conversations.find((item) => item.id === selectedId) || conversations[0];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((item) => `${item.name} ${item.company} ${item.channel}`.toLowerCase().includes(query));
  }, [conversations, search]);

  function updateActive(updater) {
    setConversations((items) => items.map((item) => item.id === selectedId ? updater(item) : item));
  }

  function saveAccessToken(value) {
    setAccessToken(value);
    try { sessionStorage.setItem('bpf-ai-access-token', value); } catch {}
  }

  function createConversation() {
    const id = makeId('conversation');
    const item = {
      id,
      name: '新客户',
      company: '待识别',
      channel: 'Manual',
      locale: '—',
      updatedAt: nowLabel(),
      unread: 0,
      messages: [],
      draft: '',
      lastAnalysis: null
    };
    setConversations((items) => [item, ...items]);
    setSelectedId(id);
    setMessage('');
    setError('');
  }

  async function analyzeMessage() {
    const text = message.trim();
    if (!text || !active || busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    const incoming = { id: makeId('message'), role: 'customer', content: text, time: nowLabel() };
    const previousHistory = active.messages.map(({ role, content }) => ({ role, content }));
    updateActive((item) => ({ ...item, updatedAt: incoming.time, messages: [...item.messages, incoming], unread: 0 }));
    setMessage('');

    try {
      const response = await fetch('/api/ai/customer-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'X-AI-Workbench-Token': accessToken } : {})
        },
        body: JSON.stringify({
          message: text,
          history: previousHistory,
          replyLanguage,
          conversationId: active.id
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || 'AI 分析失败。');

      const analysis = result.analysis;
      const aiMessage = {
        id: makeId('message'),
        role: 'agent',
        content: analysis.reply_customer_language,
        time: nowLabel(),
        ai: true
      };
      updateActive((item) => ({
        ...item,
        lastAnalysis: analysis,
        draft: autoReply && !analysis.requires_human_review ? '' : analysis.reply_customer_language,
        messages: autoReply && !analysis.requires_human_review ? [...item.messages, aiMessage] : item.messages
      }));
      setNotice(autoReply && !analysis.requires_human_review
        ? '已生成并加入安全自动回复。接入消息渠道后可自动发送给客户。'
        : analysis.requires_human_review
          ? 'AI 已生成草稿；此消息需要人工审核。'
          : 'AI 已完成翻译、意图提取和回复草稿。');
      setApiStatus((status) => ({
        ...(status || {}),
        configured: true,
        provider: result.provider || status?.provider,
        providerLabel: result.providerLabel || status?.providerLabel,
        model: result.model || status?.model,
        message: '模型调用成功。'
      }));
    } catch (requestError) {
      setError(requestError.message || 'AI 服务暂时不可用。');
    } finally {
      setBusy(false);
    }
  }

  function sendDraft() {
    const draft = active?.draft?.trim();
    if (!draft) return;
    const outgoing = { id: makeId('message'), role: 'agent', content: draft, time: nowLabel(), ai: true };
    updateActive((item) => ({ ...item, draft: '', updatedAt: outgoing.time, messages: [...item.messages, outgoing] }));
    setNotice('回复已加入当前会话。接入 WhatsApp/Telegram 后可由渠道适配器发送。');
  }

  function resetWorkspace() {
    setConversations(seedConversations);
    setSelectedId(seedConversations[0].id);
    setMessage('');
    setError('');
    setNotice('本地演示数据已重置。');
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  if (!active) return null;
  const analysis = active.lastAnalysis;
  const entityEntries = analysis ? Object.entries(analysis.entities || {}).filter(([, value]) => value) : [];

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.logo}>B</span>
          <div><strong>BestPack AI Inbox</strong><small>多语言智能客服工作台</small></div>
        </div>
        <div className={styles.topActions}>
          <span
            className={`${styles.status} ${apiStatus?.configured ? styles.ready : styles.waiting}`}
            title={apiStatus?.message || ''}
          >
            <i />{apiStatus?.configured
              ? `${apiStatus?.providerLabel || 'AI'} 已就绪`
              : apiStatus?.provider === 'openai' ? '等待 API Key' : '等待本地模型'}
          </span>
          <span className={styles.model}>{apiStatus?.model || '检查中…'}</span>
          <button className={styles.iconButton} onClick={() => setShowSettings((value) => !value)} aria-label="设置">⚙</button>
        </div>
      </header>

      {showSettings && (
        <section className={styles.settings}>
          <div>
            <strong>工作台设置</strong>
            <p>{apiStatus?.message || '本地 Ollama 无需 API Key；生产环境仍需设置工作台访问口令。'}</p>
          </div>
          <label>
            访问口令
            <input type="password" value={accessToken} onChange={(event) => saveAccessToken(event.target.value)} placeholder="AI_WORKBENCH_ACCESS_TOKEN" />
          </label>
          <button onClick={resetWorkspace}>重置演示数据</button>
        </section>
      )}

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHead}>
            <div><span>收件箱</span><b>{conversations.reduce((sum, item) => sum + (item.unread || 0), 0)}</b></div>
            <button onClick={createConversation}>＋ 新会话</button>
          </div>
          <label className={styles.search}>
            <span>⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索客户或公司" />
          </label>
          <div className={styles.filters}><button className={styles.filterActive}>全部</button><button>待回复</button><button>需审核</button></div>
          <div className={styles.conversationList}>
            {filtered.map((item) => (
              <button key={item.id} className={`${styles.conversation} ${item.id === selectedId ? styles.selected : ''}`} onClick={() => { setSelectedId(item.id); setError(''); setNotice(''); }}>
                <span className={styles.avatar}>{item.name.slice(0, 1).toUpperCase()}</span>
                <span className={styles.conversationCopy}>
                  <span><strong>{item.name}</strong><time>{item.updatedAt}</time></span>
                  <small>{item.company} · {item.channel}</small>
                  <em>{item.messages.at(-1)?.content || '开始新会话'}</em>
                </span>
                {item.unread > 0 && <b className={styles.unread}>{item.unread}</b>}
              </button>
            ))}
          </div>
        </aside>

        <section className={styles.chatPanel}>
          <header className={styles.chatHead}>
            <div className={styles.customerIdentity}>
              <span className={styles.avatar}>{active.name.slice(0, 1).toUpperCase()}</span>
              <div><strong>{active.name}</strong><small>{active.company} · {active.channel} · {active.locale}</small></div>
            </div>
            <div className={styles.chatHeadActions}><button>分配给我</button><button aria-label="更多">•••</button></div>
          </header>

          <div className={styles.messages}>
            {active.messages.length === 0 && (
              <div className={styles.emptyChat}><span>✦</span><strong>开始一段 AI 辅助会话</strong><p>粘贴客户原始消息，系统会自动翻译、识别意图并生成回复。</p></div>
            )}
            {active.messages.map((item) => (
              <article key={item.id} className={`${styles.messageRow} ${item.role === 'agent' ? styles.outgoing : ''}`}>
                <div className={styles.bubble}>
                  {item.ai && <span className={styles.aiTag}>✦ AI 辅助</span>}
                  <p>{item.content}</p>
                  <time>{item.time}</time>
                </div>
              </article>
            ))}
            {busy && <div className={styles.thinking}><span /><span /><span /> {apiStatus?.providerLabel || 'AI'} 正在分析客户消息</div>}
          </div>

          {(error || notice) && <div className={`${styles.feedback} ${error ? styles.feedbackError : ''}`}>{error || notice}</div>}

          {active.draft && (
            <div className={styles.draftBox}>
              <div><strong>AI 回复草稿</strong><span>{analysis?.requires_human_review ? '需要人工审核' : '可发送'}</span></div>
              <textarea value={active.draft} onChange={(event) => updateActive((item) => ({ ...item, draft: event.target.value }))} />
              <div><small>发送前可直接编辑</small><button onClick={sendDraft}>加入会话 <span>→</span></button></div>
            </div>
          )}

          <div className={styles.composer}>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); analyzeMessage(); }
              }}
              placeholder="输入或粘贴客户消息…"
              disabled={busy}
            />
            <div className={styles.composerTools}>
              <div className={styles.languageSelect}>
                <span>回复语言</span>
                <select value={replyLanguage} onChange={(event) => setReplyLanguage(event.target.value)}>
                  <option value="">跟随客户</option>
                  <option value="English">English</option>
                  <option value="Simplified Chinese">简体中文</option>
                  <option value="Spanish">Español</option>
                  <option value="French">Français</option>
                  <option value="German">Deutsch</option>
                  <option value="Arabic">العربية</option>
                </select>
              </div>
              <label className={styles.toggleLabel}>
                <input type="checkbox" checked={autoReply} onChange={(event) => setAutoReply(event.target.checked)} />
                <span className={styles.toggle} />安全回复自动加入会话
              </label>
              <button className={styles.analyzeButton} onClick={analyzeMessage} disabled={busy || !message.trim()}>
                <span>✦</span>{busy ? '分析中…' : 'AI 分析并生成回复'}
              </button>
            </div>
          </div>
        </section>

        <aside className={styles.insightPanel}>
          <div className={styles.insightTitle}><div><span>✦</span><strong>AI 客户洞察</strong></div><small>实时结构化分析</small></div>
          {!analysis ? (
            <div className={styles.emptyInsight}><span>◎</span><strong>等待分析</strong><p>发送一条客户消息后，这里将展示翻译、意图和关键信息。</p></div>
          ) : (
            <div className={styles.insightScroll}>
              <section className={styles.translationCard}>
                <div><span>中文翻译</span><b>{analysis.source_language} · {String(analysis.source_language_code || '').toUpperCase()}</b></div>
                <p>{analysis.translation_zh}</p>
              </section>

              <section className={styles.metricGrid}>
                <div><small>主要意图</small><strong>{intentLabels[analysis.intent] || analysis.intent}</strong></div>
                <div><small>紧急程度</small><strong className={analysis.urgency === 'critical' || analysis.urgency === 'high' ? styles.high : ''}>{urgencyLabel(analysis.urgency)}</strong></div>
                <div><small>置信度</small><strong>{confidenceLabel(analysis.confidence)}</strong></div>
                <div><small>处理方式</small><strong>{analysis.requires_human_review ? '人工审核' : '可自动回复'}</strong></div>
              </section>

              <section className={styles.insightSection}>
                <h3>客户摘要</h3>
                <p>{analysis.summary_zh}</p>
              </section>

              <section className={styles.insightSection}>
                <h3>已提取信息 <span>{entityEntries.length}</span></h3>
                <dl className={styles.entities}>
                  {entityEntries.map(([key, value]) => <div key={key}><dt>{entityLabels[key] || key}</dt><dd>{value}</dd></div>)}
                </dl>
              </section>

              <section className={styles.insightSection}>
                <h3>待补充信息 <span>{analysis.missing_information?.length || 0}</span></h3>
                {analysis.missing_information?.length
                  ? <ul>{analysis.missing_information.map((item) => <li key={item}>{item}</li>)}</ul>
                  : <p className={styles.complete}>当前信息较完整</p>}
              </section>

              {analysis.review_reasons?.length > 0 && (
                <section className={styles.reviewCard}>
                  <strong>⚑ 人工审核原因</strong>
                  {analysis.review_reasons.map((reason) => <p key={reason}>{reason}</p>)}
                </section>
              )}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
