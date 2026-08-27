const fs = require('fs');

async function main() {
const envText = fs.readFileSync('.env.local', 'utf8');
const tokenMatch = envText.match(/^AI_WORKBENCH_ACCESS_TOKEN=(.*)$/m);
const accessToken = String(tokenMatch?.[1] || '').trim().replace(/^['"]|['"]$/g, '');
if (!accessToken) throw new Error('AI_WORKBENCH_ACCESS_TOKEN is missing from .env.local.');

const host = process.argv[2] || '127.0.0.1';
const response = await fetch(`http://${host}:3000/api/ai/customer-message`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-AI-Workbench-Token': accessToken
  },
  body: JSON.stringify({
    message: 'Hello, we need 500 custom coffee bags with valves delivered to France. Can you quote?',
    history: [],
    replyLanguage: '',
    conversationId: 'lan-smoke-test'
  })
});

const result = await response.json().catch(() => ({}));
const report = response.ok ? {
  status: response.status,
  ok: result.ok,
  provider: result.providerLabel,
  model: result.model,
  sourceLanguage: result.analysis?.source_language,
  sourceLanguageCode: result.analysis?.source_language_code,
  intent: result.analysis?.intent,
  translation: result.analysis?.translation_zh,
  reply: result.analysis?.reply_customer_language,
  requiresReview: result.analysis?.requires_human_review
} : {
  status: response.status,
  ok: false,
  code: result.code,
  message: result.message,
  provider: result.providerLabel,
  model: result.model
};

console.log(JSON.stringify(report, null, 2));
if (!response.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
