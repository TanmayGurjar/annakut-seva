@echo off
rem Keeps the Annakut Seva app running: if it ever stops, it starts again after 5 seconds.
rem Output goes to data\logs\server.log. Started hidden at Windows login by start-hidden.vbs.
cd /d "%~dp0..\.."
if not exist data\logs mkdir data\logs
if exist settings.local.cmd call settings.local.cmd
:loop
for %%A in (data\logs\server.log) do if %%~zA GTR 5000000 move /y data\logs\server.log data\logs\server.old.log >nul
echo [%date% %time%] starting >> data\logs\server.log
node --disable-warning=ExperimentalWarning server.js >> data\logs\server.log 2>&1
echo [%date% %time%] stopped (exit %errorlevel%), restarting in 5 seconds >> data\logs\server.log
rem (timeout does not work without a window; ping waits ~5 seconds instead)
"%SystemRoot%\System32\PING.EXE" -n 6 127.0.0.1 >nul
goto loop
