@echo off
setlocal
cd /d "%~dp0"

set "OLLAMA_EXE=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"

powershell.exe -NoProfile -Command "try { Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 (
  if not exist "%OLLAMA_EXE%" (
    echo Ollama was not found. Install it from https://ollama.com/download/windows
    pause
    exit /b 1
  )
  echo Starting Ollama...
  start "" /min "%OLLAMA_EXE%" serve
  timeout /t 4 /nobreak >nul
)

if not exist ".next\BUILD_ID" (
  echo Building the website for the first run...
  call npm.cmd run build
  if errorlevel 1 (
    echo Build failed.
    pause
    exit /b 1
  )
)

echo.
echo BestPack AI is starting at http://192.168.1.6:3000/ai-inbox
echo Keep this window open while other computers use the extension.
echo Press Ctrl+C to stop the website service.
echo.
call npm.cmd run start:lan

