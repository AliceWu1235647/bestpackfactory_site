# BestPack AI Chrome Extension

The unpacked Manifest V3 extension lives in `chrome-extension/`. It can connect to the AI service on the same computer or to one shared server on a trusted private LAN.

## Features

- Select a customer message on any webpage, right-click it, and choose **用 BestPack AI 分析**.
- Detect the source language and translate the message into Simplified Chinese.
- Extract customer intent, urgency, RFQ entities, and missing information.
- Draft a reply in the customer's language and copy it to the clipboard.
- Open the complete `/ai-inbox` workbench in a normal browser tab.
- Store only extension settings and the latest selected text in `chrome.storage.local`.

The extension does not inject a content script and does not request permission to read every webpage. Localhost access is included. A LAN server address is requested as an optional Chrome host permission only after the operator enters that exact address and clicks Save or Test.

## Shared LAN architecture

Only the server computer runs Ollama, Qwen3, and Next.js. Other computers install the extension and connect to the server's private IPv4 address. They do not need Ollama or a copy of the 5.2GB model.

Current server address detected during setup:

```text
http://192.168.1.6:3000
```

The address can change after a router or computer restart. For a permanent setup, reserve the server's IPv4 address in the router's DHCP settings.

## Server computer setup

Create `.env.local` in the project directory. A long shared access token is required for LAN use:

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen3:8b
AI_WORKBENCH_ACCESS_TOKEN=replace-with-a-long-random-secret
```

Build the LAN service once:

```powershell
cd "C:\Users\Administrator\Documents\www.bestpackfactory.com\bestpackfactory-site"
npm.cmd run build
```

After that, double-click `start-ai-lan.cmd` whenever this computer should serve the extension. You can also start it manually with `npm.cmd run start:lan`. Keep the command window open while other computers use the extension.

The configured Windows Firewall rule allows TCP 3000 only from `192.168.1.0/24`. If the router changes the subnet, update that rule. Do not expose port 11434; Ollama should remain accessible only from the server computer through Next.js.

Test from another computer on the same Wi-Fi/Ethernet network:

```text
http://192.168.1.6:3000/api/ai/customer-message
```

The response should report `configured: true`.

## Install the extension on each computer

1. Copy and extract the extension package, or copy the `chrome-extension` folder.
2. Open `chrome://extensions` in Google Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked / 加载已解压的扩展程序**.
5. Select the extracted `chrome-extension` folder.
6. Pin **BestPack AI Customer Reply** from Chrome's extensions menu.
7. Open the extension settings.

On the server computer, use:

```text
http://127.0.0.1:3000
```

On every other LAN computer, use:

```text
http://192.168.1.6:3000
```

Enter the same `AI_WORKBENCH_ACCESS_TOKEN`, then click **Save**. Chrome will ask permission to access only that LAN address. Click Allow, then click **Test connection**.

## Use

1. Select a customer message on WhatsApp Web, Telegram Web, email, CRM, or another webpage.
2. Right-click the selection.
3. Click **用 BestPack AI 分析**.
4. Review the Chinese translation, intent, extracted information, and reply draft.
5. Click **复制回复**, then paste the reply into the customer chat.

## Security boundary

This LAN setup uses unencrypted HTTP. Use it only on a trusted private home or office network. Do not forward port 3000 on the router and do not use it on public Wi-Fi. For remote or internet access, place the service behind HTTPS and individual user authentication.

The current version intentionally does not click a website's Send button or scrape complete conversations. This keeps the extension site-independent and avoids fragile page-specific automation.
