@echo off
echo.
echo  =============================================
echo   QHeal -- Starting All Services
echo  =============================================
echo.

:: Check if models exist
if not exist "models\classical_model.pkl" (
    echo  [TRAIN] Models not found. Running training pipeline...
    python -X utf8 scripts\train.py
    echo.
)

:: Start backend in background
echo  [BACKEND] Starting on http://localhost:8000 ...
start "QHeal Backend" /min python -X utf8 backend\main.py

:: Wait for backend to be ready
timeout /t 2 /nobreak > nul

:: Start frontend
echo  [FRONTEND] Starting on http://localhost:5173 ...
echo.
echo  Open: http://localhost:5173
echo.
cd frontend
npm run dev
