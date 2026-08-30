import crypto from 'crypto';
import { NextResponse } from 'next/server';
import {
  analyzeCustomerMessage,
  AI_PROVIDER,
  AI_PROVIDER_LABEL,
  DEFAULT_AI_MODEL,
  getAIProviderStatus
} from '../../../../lib/ai-customer-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const requestBuckets = new Map();

function json(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

function cleanString(value, max = 8000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function sameSecret(expected, provided) {
  const a = Buffer.from(expected || '');
  const b = Buffer.from(provided || '');
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
}

function checkAccess(request) {
  const expected = process.env.AI_WORKBENCH_ACCESS_TOKEN || '';
  if (!expected) return process.env.NODE_ENV !== 'production';
  const headerToken = request.headers.get('x-ai-workbench-token') || '';
  const authorization = request.headers.get('authorization') || '';
  const bearer = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  return sameSecret(expected, headerToken || bearer);
}

function allowRequest(request) {
  const now = Date.now();
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const ip = forwarded.split(',')[0].trim() || request.headers.get('x-real-ip') || 'local';
  const key = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 24);
  const bucket = requestBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= WINDOW_MS) {
    requestBuckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= MAX_REQUESTS_PER_WINDOW;
}

function publicError(error) {
  if (error?.code === 'OLLAMA_UNAVAILABLE') {
    return { status: 503, code: 'OLLAMA_UNAVAILABLE', message: '未检测到本机 Ollama 服务，请先启动 Ollama。' };
  }
  if (error?.code === 'OLLAMA_MODEL_NOT_FOUND') {
    return { status: 503, code: 'OLLAMA_MODEL_NOT_FOUND', message: `本机尚未安装模型 ${DEFAULT_AI_MODEL}。` };
  }
  if (error?.code === 'OPENAI_NOT_CONFIGURED') {
    return { status: 503, code: 'OPENAI_NOT_CONFIGURED', message: '服务端尚未配置 OPENAI_API_KEY。' };
  }
  if (error?.code === 'AI_INVALID_RESPONSE' || error?.code === 'AI_EMPTY_RESPONSE') {
    return { status: 502, code: error.code, message: '本地模型没有返回有效的结构化结果，请重试或使用更大的模型。' };
  }
  if (error?.code === 'AI_PROVIDER_UNSUPPORTED') {
    return { status: 500, code: error.code, message: 'AI_PROVIDER 配置不受支持。' };
  }
  if (error?.status === 401) {
    return { status: 502, code: 'OPENAI_AUTH_FAILED', message: 'OpenAI API Key 无效或已失效。' };
  }
  if (error?.status === 429) {
    return { status: 429, code: 'AI_RATE_LIMIT', message: 'AI 请求过于频繁或云端额度不足，请稍后重试。' };
  }
  if (error?.status && error.status >= 400 && error.status < 500) {
    return { status: 400, code: error?.code || 'AI_REQUEST_FAILED', message: '模型请求未被接受，请检查模型和提供商配置。' };
  }
  return { status: 502, code: error?.code || 'AI_REQUEST_FAILED', message: 'AI 服务暂时不可用，请稍后重试。' };
}

export async function GET() {
  const providerStatus = await getAIProviderStatus();
  return json({
    ok: true,
    ...providerStatus,
    accessProtected: Boolean(process.env.AI_WORKBENCH_ACCESS_TOKEN),
    productionProtectionReady: process.env.NODE_ENV !== 'production' || Boolean(process.env.AI_WORKBENCH_ACCESS_TOKEN)
  });
}

export async function POST(request) {
  if (!checkAccess(request)) {
    const missingProtection = process.env.NODE_ENV === 'production' && !process.env.AI_WORKBENCH_ACCESS_TOKEN;
    return json({
      ok: false,
      code: missingProtection ? 'ACCESS_TOKEN_NOT_CONFIGURED' : 'UNAUTHORIZED',
      message: missingProtection
        ? '生产环境必须配置 AI_WORKBENCH_ACCESS_TOKEN。'
        : '工作台访问口令不正确。'
    }, missingProtection ? 503 : 401);
  }

  if (!allowRequest(request)) {
    return json({ ok: false, code: 'RATE_LIMITED', message: '请求过于频繁，请一分钟后重试。' }, 429);
  }

  const body = await request.json().catch(() => null);
  const message = cleanString(body?.message, 8000);
  if (!message) return json({ ok: false, code: 'MESSAGE_REQUIRED', message: '请输入客户消息。' }, 400);

  const history = Array.isArray(body?.history) ? body.history.slice(-12).map((item) => ({
    role: item?.role === 'agent' ? 'agent' : 'customer',
    content: cleanString(item?.content, 4000)
  })).filter((item) => item.content) : [];

  try {
    const result = await analyzeCustomerMessage({
      message,
      history,
      replyLanguage: cleanString(body?.replyLanguage, 60),
      conversationId: cleanString(body?.conversationId, 64) || crypto.randomUUID()
    });
    return json({ ok: true, ...result });
  } catch (error) {
    console.error('[AI customer-message]', AI_PROVIDER, error?.status || '', error?.code || '', error?.message || error);
    const safe = publicError(error);
    return json({
      ok: false,
      code: safe.code,
      message: safe.message,
      provider: AI_PROVIDER,
      providerLabel: AI_PROVIDER_LABEL,
      model: DEFAULT_AI_MODEL
    }, safe.status);
  }
}
