@echo off
cd /d "%~dp0"

start "SkillSwap Python Assistant" cmd /k "python python_chatbot\chatbot_server.py"
start "SkillSwap Frontend" cmd /k "cd frontend && npm.cmd run dev"

echo SkillSwap is starting.
echo.
echo Keep both terminal windows open:
echo - SkillSwap Python Assistant
echo - SkillSwap Frontend
echo.
echo Open http://127.0.0.1:5173 in your browser.
pause
