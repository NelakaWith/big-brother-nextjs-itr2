@echo off
REM === Start Backend ===
start /min cmd /k "cd /d %~dp0backend && npm run dev"

REM === Start Frontend ===
start /min cmd /k "cd /d %~dp0frontend && npm run dev"
start http://localhost:8083

echo Big Brother is watching you!

echo ...
timeout /t 5 >nul
exit
