# BestPack AI Inbox

`/ai-inbox` is a private multilingual customer-service workbench. Its default AI provider is the free, local combination of Ollama and `qwen3:8b`; OpenAI remains available as an optional provider.

The workbench returns:

- source-language detection and Simplified Chinese translation;
- primary and secondary customer intents;
- packaging RFQ entities and missing information;
- sentiment, urgency, confidence, and human-review routing;
- a customer-language reply plus a Chinese operator translation.

## Free Windows setup: Ollama + Qwen3

1. Download and install Ollama for Windows from `https://ollama.com/download/windows`.
2. After installation, open a new PowerShell window and download the model:

```powershell
ollama pull qwen3:8b
```

The default 8B model download is approximately 5.2GB. On a lower-memory computer, use the smaller model instead:

```powershell
ollama pull qwen3:4b
```

3. From this project directory, create the local environment file:

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

Use these settings for the default 8B model:

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:8b
AI_WORKBENCH_ACCESS_TOKEN=replace-with-a-long-random-secret
```

For the 4B model, change `OLLAMA_MODEL` to `qwen3:4b`.

4. Restart the Next.js server and open the workbench:

```powershell
npm.cmd run dev
```

Open `http://localhost:3000/ai-inbox`. Ollama normally runs in the Windows background and exposes its local API at `http://127.0.0.1:11434`.

For shared LAN use after the production build has been created, double-click `start-ai-lan.cmd` and keep its command window open.

## Optional OpenAI provider

To switch back to OpenAI, update `.env.local` and restart the server:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your-server-side-project-key
OPENAI_MODEL=gpt-5.6-sol
AI_WORKBENCH_ACCESS_TOKEN=replace-with-a-long-random-secret
```

The API key is never sent to the browser. In development, `AI_WORKBENCH_ACCESS_TOKEN` is optional. In production it is mandatory: set a long random value on the server and enter the same value in the workbench settings panel.

## API

`POST /api/ai/customer-message`

```json
{
  "message": "Can you quote 1,000 magnetic gift boxes?",
  "history": [
    { "role": "customer", "content": "Hello" },
    { "role": "agent", "content": "How can we help?" }
  ],
  "replyLanguage": "",
  "conversationId": "crm-conversation-id"
}
```

When access protection is configured, include:

```text
X-AI-Workbench-Token: your-access-token
```

`GET /api/ai/customer-message` checks whether Ollama is reachable and whether the configured local model is installed. It does not expose secrets.

## Automatic reply policy

The model always drafts a reply, but it sets `requires_human_review=true` for complaints, payments/refunds, legal or safety concerns, binding prices or commitments, critical urgency, and low-confidence messages. The workbench only automatically adds replies to the local conversation when that flag is false.

This MVP does not yet transmit messages to WhatsApp or Telegram. A channel adapter should call this API from an authenticated webhook and send `reply_customer_language` only when the review policy allows it. Persist production conversations in a database and replace the in-memory rate limit with a shared rate limiter before opening the endpoint to public channel traffic.

## Chrome extension

An unpacked Manifest V3 side-panel extension is available in `chrome-extension/`. See `README_CHROME_EXTENSION.md` for Windows installation and usage instructions.
