@echo off
title Credit Gyems Backend Server
echo Starting Credit Gyems Academy Backend...
echo.
echo If you see MongoDB connection errors, check:
echo 1. MONGODB_URI in .env
echo 2. Internet connection
echo 3. MongoDB Atlas IP whitelist
echo.
npm start
pause
