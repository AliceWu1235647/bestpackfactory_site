# BestPackFactory 不丢站发布制度

这套制度把 GitHub 仓库作为唯一源码，把 Vercel Preview 作为上线前验收环境，把 R2 内容作为一次性、不可变的版本发布。任何身份、旧页面、图片、多语言、布局、SEO 信号或 R2 健康检查不符合要求时，发布必须失败。

## 当前身份锁

- GitHub 仓库：`AliceWu1235647/bestpackfactory_site`，仓库 ID `1275025881`
- Vercel 项目：`bestpackfactory-site-gmrk`，项目 ID `prj_xXGSQzpuzCiQrlGWUfMZ3h1ZvKf4`
- 禁止项目：旧项目 `bestpackfactory-site`（`prj_5ZusTqnQpUHSLitLydgDcdG5f652`）已于 2026-09-14 解除 Git 连接；项目和历史部署保留，但任何脚本仍不得链接、部署或回滚这个项目
- GitHub deployment 门禁只接受 Vercel 机器人创建的 `Preview`/`Production` 事件，并要求 deployment URL 以 `https://bestpackfactory-site-gmrk-` 开头且以 `.vercel.app` 结尾；其他项目不能触发验收、Promote 或回滚逻辑
- 当前 Vercel 生产分支：`restored-correct-20260904`
- Cloudflare Account ID 已通过只读 OAuth 核验并固定；Wrangler OAuth 没有独立的 R2 read scope，R2 bucket 尚未核验，所以 `guardrails/site-identity.json` 继续保持 `configured: false`
- GitHub 默认分支与 Vercel Production Branch 已于 2026-09-13 统一为 `restored-correct-20260904`；仓库 ID、项目 ID、生产提交和回滚 deployment 已读回核验。

账号密码不得写入仓库、`.env`、脚本、报告或聊天提示。GitHub 使用 OAuth/`gh auth`，Vercel 使用范围受限 token，Cloudflare 使用仅限目标 R2 bucket 的 token。

## 每次改站的固定流程

1. 从最新的 `origin/restored-correct-20260904` 建立功能分支，不直接改生产分支。
2. 先运行 `npm run guard:identity`，确认当前文件夹、GitHub remote、仓库 ID 与分支祖先完全正确。
3. 修改完成后运行 `npm run guard:ci`。现有 520 个页面、504 张图片、5 个语言目录、18 个布局/运行文件以及 460 个 sitemap URL/lastmod 都会与冻结基线核对。
4. 运行 `npm run deploy` 只创建 Vercel Preview。`npm run deploy -- --prod` 已被硬禁用。
5. Preview 的 GitHub Deployment Status 会触发 `guardrails / preview / bestpackfactory-site-gmrk`，逐页检查 canonical/hreflang/关键布局标记，逐张下载图片并核对 SHA-256，同时要求 R2 products/blog/news 三个索引全部健康。
6. 只有 required checks 全绿且人工确认 Preview 后，才允许把这个已经验证的 Preview 提升为 Production。不得从本地重新构建一个“看起来相同”的生产包。
7. Production 上线后自动再验收一次。失败时工作流调用 Vercel rollback 恢复上一版，并把检查标红。

## 新博客和新产品

- 只允许新增 slug；R2 发布器会把上一版 manifest 中的所有旧 slug 与新版本比较，少一个就失败。
- 旧页面、旧图片、布局文件和 sitemap 的既有 URL/lastmod 默认不可改。需要修改旧内容时，必须人工审查并在一个独立提交中显式重建基线。
- 新的多语言页面只有在英语原页以及 `ar/de/es/fr/ja` 五个文件全部存在时，才允许生成完整 reciprocal hreflang 集群。不完整翻译不会冒充已完成语言版本。
- 新页面必须有 canonical；英语页若进入完整多语言集群，必须同时具备所有 reciprocal hreflang。
- `custom-food-packaging.html` 和 `custom-paper-bags.html` 是已有的 canonical 汇总别名，允许分别指向 `food-packaging.html` 和 `paper-bags.html`，其他 canonical 漂移仍会阻断。

## R2 不覆盖发布

先从已经核验完整的 R2 内容快照生成 release：

```powershell
npm run guard:r2:build -- --source <完整快照目录> --previous-manifest <上一版current.json> --release-id <版本号>
```

首次迁移必须明确使用 `--initial-migration`。脚本生成：

- `releases/<release-id>/products/...`
- `releases/<release-id>/blog/...`
- `releases/<release-id>/news/...`
- 不可变的 `manifests/<release-id>.json`
- 最后才切换的 `manifests/current.json`
- 带顺序和哈希的 `upload-plan.json`

发布顺序必须是：对象 -> 各索引 -> 版本 manifest -> `current.json`。前四类 key 禁止覆盖；`current.json` 必须用上一版 ETag 做条件写入。任一上传失败时不得切换 pointer。回滚只需把 pointer 条件更新回上一版 manifest，不删除对象。

应用端启用 `R2_RELEASE_MANIFEST_PATH=manifests/current.json` 后，如果 pointer 缺失、格式错误或某一类型位置缺失，会拒绝退回可变的旧路径。这样一次坏上传不会让半套数据进入生产。

## 一次性平台启用

以下动作在代码合并前必须完成：

1. GitHub Ruleset `BestPack production guardrails` 已启用，并把以下 checks 设为 `restored-correct-20260904` 的合并必需：
   - `guardrails / immutable-site-assets`
   - `guardrails / preview / bestpackfactory-site-gmrk`
2. 在 Vercel 为 Production 启用 Deployment Checks，要求 Preview 门禁成功后才可 Promote。
3. 专用 `VERCEL_AUTOMATION_BYPASS_SECRET` 已写入 GitHub Actions；生产自动回滚还需要核验 `VERCEL_TOKEN` 仅授权正确 Vercel 项目。
4. Cloudflare Account ID 已核验；还需使用 `Workers R2 Storage Read`/R2 `Admin Read only` token 只读列出 bucket 与当前对象，再把精确 bucket 固定到 `site-identity.json`。发布器应另用仅能读写这个 bucket 的 token，不能复用盘点 token。
5. 先恢复 `/api/r2-health` 为全绿，再启用自动生产发布。当前 products/blog/news 三个 R2 index 不可用，因此门禁会按设计阻断。

## 紧急回滚

- Vercel：优先回滚到最近一个已通过完整 Preview 门禁的 deployment。
- R2：只把 `manifests/current.json` 条件切回上一版；不删除失败 release，保留审计证据。
- 任何回滚后都要重新运行生产验收，不以“页面能打开”代替完整检查。

相关入口：`guardrails/site-identity.json`、`guardrails/site-baseline.json`、`scripts/check-repository-identity.mjs`、`scripts/check-site-protection.mjs`、`scripts/check-preview.mjs`、`scripts/build-r2-release.mjs`、`scripts/release-verified-preview.mjs` 和 `.github/workflows/`。
