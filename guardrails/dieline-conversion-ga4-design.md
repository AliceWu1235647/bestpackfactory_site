# 刀模转化 GA4 事件设计（Section 5 正式设计文档）

- **状态**：设计定稿，待人工批准后进入实现（Phase 2）
- **审计基准 commit**：`8982a1ea2601728d6077e7187bb224e76e17c341`（`origin/restored-correct-20260904`）
- **生成日期**：2026-09-14
- **原则**：加法优化、布局冻结、功能冻结、发布可回滚（见 [site-identity.json](site-identity.json) 与 CI 守护流水线 `.github/workflows/site-protection.yml`）
- **不在本文档范围内**：Section 4（release:check 加固）、Section 8（关键词竞争审计）、Section 9（GEO/AEO Schema 审计）、Section 11（R2 用量确认）— 均未开始，另行交付

---

## 0. 决策记录

| 日期 | 决策 | 决策人 |
|---|---|---|
| 2026-09-14 | **全站悬浮 WhatsApp 组件（`app/WhatsAppWidget.js`）不因刀模上下文改变文案/链接**，保持完全静态。刀模相关的动态预填只保留在刀模页面内已存在的"Quote this size on WhatsApp"局部按钮上。 | 用户明确指示 |

此决策的直接效果：`app/WhatsAppWidget.js`（guard 保护文件之一）在本次工作范围内**零改动**，不需要 `npm run guard:capture` 重新签名，进一步降低发布风险，也消除了与 Section 1 第 2 条"不得改变功能"之间的张力。

---

## 1. 现状盘点（差距分析，非从零设计）

在设计新事件之前，先确认哪些已经实现，避免重复或冲突埋点。

### 1.1 已存在的基础设施

| 组件 | 位置 | 说明 |
|---|---|---|
| GA4 加载 | [app/layout.js:56-72](app/layout.js) | `gtag.js` 懒加载（`strategy="lazyOnload"`），仅当 `NEXT_PUBLIC_GA_ID` 匹配 `G-XXXX` 格式时注入 |
| 统一发送层 | [app/GeoAnalytics.js](app/GeoAnalytics.js) | `sendGaEvent(name, params)`：推入 `window.dataLayer`，自动附加首次归因（sessionStorage）与 `page_path`/`page_location` |
| 事件去重 | [app/GeoAnalytics.js](app/GeoAnalytics.js) | `markSessionEvent(key)`：sessionStorage 门控，保证同一事件同一 key 每个会话只触发一次 |
| AI 来源识别 | [app/GeoAnalytics.js](app/GeoAnalytics.js) | `AI_HOSTS` 正则（chatgpt.com / chat.openai.com / perplexity.ai / claude.ai / gemini.google.com / copilot.microsoft.com），驱动 `ai_referral_landing` |
| 全站悬浮组件 | [app/WhatsAppWidget.js](app/WhatsAppWidget.js) | 挂载于 [app/layout.js:73](app/layout.js) ，图标/位置/样式固定，静态 `WHATSAPP_LINK`/`DEFAULT_MESSAGE`（本次决策后保持不变） |

### 1.2 已经在发送的事件（无需重做）

| 事件名 | 触发位置 | 当前参数 | 去重 |
|---|---|---|---|
| `email_click` | 任意 `mailto:` 链接点击（委托监听） | 归因通用字段 | 是 |
| `whatsapp_click` | 任意 `wa.me` / `api.whatsapp.com` 链接点击（委托监听） | 归因通用字段 | 是 |
| `quote_start` | `#contactQuoteForm` 获得焦点，或点击指向 contact/direct-contact 的意向链接 | 归因通用字段 | 是 |
| `sample_request` | 相应意向点击 | 归因通用字段 | 是 |
| `dieline_to_quote` | 刀模页跳转到联系方式的点击 | `interaction_method: 'contextual_link'` | 否（当前未去重，见 2.5） |
| `dieline_download` | [app/dielines/DielineGenerator.js:77](app/dielines/DielineGenerator.js) 下载回调 | `{ dieline, format, dimensions }` | 否 |
| `ai_referral_landing` / `geo_money_page_view` | 落地页判定 | — | 是 |

**结论**：`email_click`、`whatsapp_click`、`dieline_download` 与用户规格里要求的事件语义已经覆盖，只是字段命名与规格（`dieline_type`/`file_format`/`dimension_range`）不完全对齐。**方案是扩展现有 `sendGaEvent` 调用点补齐参数，而不是新建平行事件**，避免同一动作产生两条计数不一致的事件流。

### 1.3 已知但未打通的桩子

- 刀模页 `contactHref` 已生成 `?subject=Quote — {name} ({sizeSummary})`，但 [content-site/contact.html](content-site/contact.html) **不读取** `location.search`，该参数目前被静默忽略（已用 grep 核实：页面只有静态 `mailto:` 与隐藏字段 `_subject=BestPackFactory RFQ Form Submission`）。

---

## 2. 新增/扩展设计

原则：以下改动均不改变任何可见 UI（文案、按钮、布局、颜色一律不变），只新增 JS 侧的事件派发与数据持久化逻辑。**不传输 PII**（姓名/电话/邮箱/WhatsApp 号码/详细地址一律不进入 GA4 参数）。

### 2.1 `dieline_view`

- **触发**：`DielineGenerator.js` 组件挂载时（`useEffect`，仅一次）
- **参数**：`dieline_type`（= `entry.slug`）、`page_path`、`page_language`、`product_category`（= `entry.relatedProduct` 若有）
- **去重**：`markSessionEvent('dieline_view:' + slug)`

### 2.2 `dieline_generate`

- **触发**：用户修改参数后，防抖（如 600ms）成功重新生成 SVG 时
- **参数**：`dieline_type`、`dimension_range`（**分桶**，例如 `200-300mm`，不传精确毫米，避免高基数/间接暴露定制细节）、`file_format` 预留为空（此事件不涉及下载）
- **去重**：不去重（同一会话可多次生成，用于衡量"深度互动"，但需要客户端节流避免每次微调都触发——防抖已天然限流）

### 2.3 `dieline_download`（扩展现有事件，非新建）

- **现有调用**：[app/dielines/DielineGenerator.js:77](app/dielines/DielineGenerator.js)
- **改动**：补齐参数为 `{ dieline_type, file_format, dimension_range, page_path, page_language, product_category }`，保留原 `dieline`/`format`/`dimensions` 字段以免破坏既有 GA4 报表（**加法**，不删除旧字段）
- **新增副作用**：写入本地持久化上下文（见 2.6），供 `product_page_view_after_dieline` 使用

### 2.4 `product_page_view_after_dieline`

- **触发**：任意 `app/products/[slug]/page.js` 渲染的产品页挂载时，检查 2.6 的持久化上下文是否存在且未过期（建议 30 天）
- **参数**：`dieline_type`（来自持久化上下文）、`days_since_download`、`product_category`、`page_path`
- **去重**：`markSessionEvent('product_page_view_after_dieline:' + slug)`

### 2.5 `quote_form_start` / `quote_form_submit`

- **触发**：`contact.html` 表单的 `focusin`（start）/ `submit`（submit）事件，复用 [app/GeoAnalytics.js](app/GeoAnalytics.js) 现有的委托监听模式
- **参数**：`source_channel`（沿用现有归因字段）、`dieline_type`（若持久化上下文存在，一并带上，用于串联转化漏斗）
- **去重**：`markSessionEvent`，key 按表单 id + 动作区分
- **同时修复**：`dieline_to_quote`（1.2 提到的现有事件）补上去重，避免同一会话内多次点击重复计数

### 2.6 `language_switch`

- **触发**：语言切换控件点击（委托监听，匹配现有语言目录路径 `/ar/`、`/de/`、`/es/`、`/fr/`、`/ja/` 或根路径）
- **参数**：`from_language`、`to_language`、`page_path`
- **去重**：不去重（用户可能多次切换，这是真实行为）

### 2.7 刀模上下文持久化（新数据结构，非 UI 改动）

- **存储位置**：`localStorage`（跨会话保留，用于 `days_since_download`），key 建议 `bpf_last_dieline`
- **写入时机**：`dieline_download` 成功回调
- **Schema**：
  ```json
  {
    "slug": "string",
    "name": "string",
    "dimensions": "string（人类可读，如 300×200×150mm）",
    "format": "pdf|dxf|ai|svg",
    "language": "en|ar|de|es|fr|ja",
    "productCategory": "string|null",
    "ts": "ISO8601"
  }
  ```
- **用途**：仅供 2.4（`product_page_view_after_dieline`）读取；**不再用于**全站悬浮 WhatsApp 组件（见第 0 节决策）
- **过期策略**：读取时按 `ts` 计算 `days_since_download`，超过 30 天的记录视为过期（不删除，只是不触发下游事件，避免额外的写操作复杂度）

### 2.8 `contact.html` 的 `subject` 打通

- **现状**：[app/dielines/DielineGenerator.js](app/dielines/DielineGenerator.js) 的 `contactHref` 早已生成 `?subject=Quote — {name} ({sizeSummary})`，但落地页不读取
- **设计**：在 `contact.html` 加入一段小型客户端脚本，读取 `location.search.subject`，同步写入：
  - 页面上已存在的 `mailto:` 链接的 `subject=` 参数
  - 表单隐藏字段 `_subject`（当前固定值 `BestPackFactory RFQ Form Submission`，改为存在 query 时优先使用 query 值，否则回退原有固定值）
- **不改变**：按钮文案、位置、样式一律不变，纯逻辑层加法

### 2.9 内部/测试流量过滤

- **设计**：新增一个客户端 helper（如 `isInternalTraffic()`），依据 UA 关键字或一个内部专用的 URL 标记参数（如 `?bpf_internal=1`，写入 sessionStorage 后长期生效）判定，命中时所有 `sendGaEvent` 调用短路不发送
- **GA4 侧配套**：另需在 GA4 后台建立"内部流量"数据流筛选器（属于账号配置，非代码改动，需要你或团队在 GA4 管理界面操作）

---

## 3. 事件汇总表

| 事件 | 状态 | 需改动文件 |
|---|---|---|
| `dieline_view` | 新增 | `app/dielines/DielineGenerator.js` |
| `dieline_generate` | 新增 | `app/dielines/DielineGenerator.js` |
| `dieline_download` | 扩展参数 | `app/dielines/DielineGenerator.js` |
| `product_page_view_after_dieline` | 新增 | `app/products/[slug]/page.js`（或其客户端子组件） |
| `whatsapp_click` | 已实现，不变 | — |
| `email_click` | 已实现，不变 | — |
| `quote_form_start` / `quote_form_submit` | 新增 | `app/GeoAnalytics.js`（委托监听扩展） |
| `language_switch` | 新增 | `app/GeoAnalytics.js`（委托监听扩展） |
| 刀模上下文持久化 | 新增（数据层，非事件） | `app/dielines/DielineGenerator.js`、`app/GeoAnalytics.js`（共享读取 helper） |
| `contact.html` subject 打通 | 新增 | `content-site/contact.html` |
| 内部流量过滤 | 新增 | `app/GeoAnalytics.js` |

受影响文件中 `app/dielines/DielineGenerator.js`、`app/layout.js` 引用的 `app/GeoAnalytics.js`（非 protected）需注意：**`app/dielines/DielineGenerator.js` 在 guard 的 protectedFiles 清单中**，任何改动都要走 `npm run guard:capture` 重新签名后才能通过 CI；`content-site/contact.html` 不在 protectedFiles 清单但在 `content-site/` 这个受保护的 contentRoot 下，同样需要重新签名。`app/GeoAnalytics.js` 不受保护，可直接改动。

---

## 4. 验收标准（对应 Section 12 回归测试）

- 所有新事件在 GA4 DebugView 中可见，参数不含 PII
- 同一事件在同一会话内不重复计数（`markSessionEvent` 覆盖到所有新增触发点）
- 刀模页视觉、全站悬浮 WhatsApp 组件视觉/交互与改动前逐像素一致
- `contact.html` 表单提交行为不变，仅 `subject` 值可能因 query 参数不同而不同
- 桌面+移动端截图对比无差异

---

## 5. 待人工批准事项

1. 本设计文档本身（结构/字段命名/存储 key 命名）
2. 是否在 GA4 后台建立内部流量筛选器，以及具体判定规则（UA 关键字或 URL 标记参数）
3. 进入 Phase 2 实现后，是否按此文档的"文件清单"逐一走 PR + Preview Deployment（不合并、不部署生产），供你审阅每个 diff
