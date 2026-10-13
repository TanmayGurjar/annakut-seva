@echo off
rem Puts the app on the internet with a free Cloudflare quick tunnel (https://<random>.trycloudflare.com).
rem The link changes every time this starts; the admin panel shows the current one (read from data\logs\tunnel.log).
rem Turn off with "set TUNNEL=off" in settings.local.cmd.
cd /d "%~dp0..\.."
if not exist data\logs mkdir data\logs
if exist settings.local.cmd call settings.local.cmd
if /i "%TUNNEL%"=="off" exit /b
if "%PORT%"=="" set PORT=3000
set "CF=%ProgramFiles(x86)%\cloudflared\cloudflared.exe"
if not exist "%CF%" set "CF=%ProgramFiles%\cloudflared\cloudflared.exe"
if not exist "%CF%" echo [%date% %time%] cloudflared is not installed: winget install Cloudflare.cloudflared > data\logs\tunnel.log
if not exist "%CF%" exit /b
:loop
echo [%date% %time%] starting tunnel > data\logs\tunnel.log
"%CF%" tunnel --no-autoupdate --url http://localhost:%PORT% >> data\logs\tunnel.log 2>&1
echo [%date% %time%] tunnel stopped, restarting in 10 seconds >> data\logs\tunnel.log
"%SystemRoot%\System32\PING.EXE" -n 11 127.0.0.1 >nul
goto loop
