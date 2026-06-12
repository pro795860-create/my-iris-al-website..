@echo off
rem Ensure no process is using port 8000
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8000" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

rem Change to the Iris AI client directory
cd "C:\Users\NITRO\.gemini\antigravity\scratch\iris_ai_client"

rem Start the Smart Node.js server
start "IrisHTTP" node server.js

rem Small pause to allow the server to initialise
timeout /t 2 >nul

rem Start Ngrok tunnel in a new window
start "IrisNgrok" ngrok http 8000

rem Keep this batch window open so the user can see logs
pause
