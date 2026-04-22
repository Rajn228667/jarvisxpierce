@echo off
setlocal EnableDelayedExpansion
REM =====================================================================
REM  Pierce X Hail Mery — Windows build script
REM  Outputs a single self-contained PierceX.Api.exe + bundled SPA into
REM  .\release\ . Run PierceX.Api.exe and open http://localhost:5080
REM =====================================================================

set ROOT=%~dp0
set RELEASE=%ROOT%release

echo ====================================================================
echo  Pierce X Hail Mery — build
echo  Root: %ROOT%
echo  Output: %RELEASE%
echo ====================================================================

where dotnet >nul 2>nul
if errorlevel 1 (
  echo [ERROR] dotnet SDK not found. Install .NET 8 SDK first:
  echo    winget install Microsoft.DotNet.SDK.8
  exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install Node.js 18+ first:
  echo    winget install OpenJS.NodeJS.LTS
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm not found. Reinstall Node.js.
  exit /b 1
)

echo.
echo [1/4] Cleaning previous release...
if exist "%RELEASE%" rmdir /s /q "%RELEASE%"
mkdir "%RELEASE%" || exit /b 1

echo.
echo [2/4] Publishing backend (self-contained, single-file, win-x64)...
dotnet publish "%ROOT%backend\src\PierceX.Api\PierceX.Api.csproj" ^
  -c Release -r win-x64 --self-contained true ^
  -p:PublishSingleFile=true ^
  -p:IncludeNativeLibrariesForSelfExtract=true ^
  -p:EnableCompressionInSingleFile=true ^
  -p:DebugType=None -p:DebugSymbols=false ^
  -o "%RELEASE%" || exit /b 1

if not exist "%RELEASE%\PierceX.Api.exe" (
  echo [ERROR] Backend publish did not produce PierceX.Api.exe
  exit /b 1
)

echo.
echo [3/4] Building frontend (npm ci + npm run build)...
pushd "%ROOT%frontend"
call npm ci || (popd & exit /b 1)
call npm run build || (popd & exit /b 1)
popd
if not exist "%ROOT%frontend\dist\index.html" (
  echo [ERROR] Frontend build did not produce frontend\dist\index.html
  exit /b 1
)
echo Copying frontend\dist -> release\wwwroot ...
xcopy /E /I /Y /Q "%ROOT%frontend\dist" "%RELEASE%\wwwroot\" >nul || exit /b 1

echo.
echo [4/4] Writing launcher (start.bat) and appsettings overrides...
(
  echo @echo off
  echo setlocal
  echo set ASPNETCORE_URLS=http://localhost:5080
  echo set ASPNETCORE_ENVIRONMENT=Production
  echo cd /d "%%~dp0"
  echo start "" http://localhost:5080/
  echo PierceX.Api.exe
  echo endlocal
) > "%RELEASE%\start.bat"

echo.
echo ====================================================================
echo  Build complete.
echo    EXE:     %RELEASE%\PierceX.Api.exe
echo    Frontend: %RELEASE%\wwwroot\index.html
echo    Launcher: %RELEASE%\start.bat
echo.
echo  Quick run:  %RELEASE%\start.bat
echo  URL:        http://localhost:5080/
echo  Login:      admin@piercex.kz / Admin123!
echo.
echo  Optional installer:
echo    1) Install Inno Setup: winget install JRSoftware.InnoSetup
echo    2) Compile: iscc installer\PierceX.iss
echo    3) Output:  installer\Output\PierceX-Setup.exe
echo ====================================================================
endlocal
exit /b 0
