# ==============================================================================
#  BADMINTON STARZ -- Automated APK Builder
#  Usage: powershell -ExecutionPolicy Bypass -File "C:\Learning\Projects\ShuttleStats\build-apk.ps1"
# ==============================================================================

$ErrorActionPreference = "Stop"

$ROOT        = "C:\Learning\Projects\ShuttleStats"
$FRONTEND    = "$ROOT\frontend"
$ANDROID_DIR = "$FRONTEND\android"
$GRADLEW     = "$ANDROID_DIR\gradlew.bat"
$APK_SRC     = "$ANDROID_DIR\app\build\outputs\apk\debug\app-debug.apk"
$APK_DEST    = "$ROOT\BadmintonStarz.apk"
$NODE        = "C:\Program Files\nodejs\node.exe"
$NPM_CLI     = "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js"
$CAP_CLI     = "$FRONTEND\node_modules\@capacitor\cli\bin\capacitor"

function Print-Step([string]$msg) { Write-Host ""; Write-Host "  >> $msg" -ForegroundColor Cyan }
function Print-OK([string]$msg)   { Write-Host "  OK  $msg" -ForegroundColor Green }
function Print-Fail([string]$msg) { Write-Host ""; Write-Host "  FAIL: $msg" -ForegroundColor Red; exit 1 }

Print-Step "Checking Node.js..."
if (-not (Test-Path $NODE)) { Print-Fail "Node.js not found at $NODE" }
Print-OK "Node.js found"

Print-Step "Checking Android project..."
if (-not (Test-Path $GRADLEW)) { Print-Fail "gradlew.bat not found. Run: npx cap add android" }
Print-OK "Android project found"

Print-Step "Checking Java..."
$javaFound = $false
$javaCandidates = @(
    $env:JAVA_HOME,
    "C:\Program Files\Android\Android Studio\jbr",
    "C:\Program Files\Android\Android Studio\jre",
    "C:\Program Files\Java\jdk-17",
    "C:\Program Files\Java\jdk-21"
)
foreach ($c in $javaCandidates) {
    if ($c -and (Test-Path "$c\bin\java.exe")) {
        $env:JAVA_HOME = $c
        $javaFound = $true
        Print-OK "Java found at: $c"
        break
    }
}
if (-not $javaFound) {
    $javaCmd = Get-Command java -ErrorAction SilentlyContinue
    if ($javaCmd) { Print-OK "Java on PATH: $($javaCmd.Source)"; $javaFound = $true }
}
if (-not $javaFound) {
    Print-Fail "Java not found. Install Android Studio from https://developer.android.com/studio"
}

Print-Step "Building web app (npm run build)..."
Set-Location $FRONTEND
& $NODE $NPM_CLI --prefix $FRONTEND run build
if ($LASTEXITCODE -ne 0) { Print-Fail "npm run build failed" }
Print-OK "Web assets built"

Print-Step "Syncing into Android project (cap sync)..."
& $NODE $CAP_CLI sync android
if ($LASTEXITCODE -ne 0) { Print-Fail "cap sync failed" }
Print-OK "Synced"

Print-Step "Building APK with Gradle (first run may take 5+ minutes)..."
Set-Location $ANDROID_DIR
& $GRADLEW assembleDebug --no-daemon
if ($LASTEXITCODE -ne 0) { Print-Fail "Gradle build failed" }

Print-Step "Copying APK..."
if (-not (Test-Path $APK_SRC)) { Print-Fail "APK not found at: $APK_SRC" }
Copy-Item -Path $APK_SRC -Destination $APK_DEST -Force
$sizeMB = [math]::Round((Get-Item $APK_DEST).Length / 1MB, 1)
Print-OK "APK ready: $APK_DEST ($sizeMB MB)"

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Yellow
Write-Host "  BUILD COMPLETE: BadmintonStarz.apk ($sizeMB MB)" -ForegroundColor Yellow
Write-Host "  Location: $APK_DEST" -ForegroundColor White
Write-Host ""
Write-Host "  TO INSTALL ON PHONE:" -ForegroundColor Cyan
Write-Host "  1. Copy BadmintonStarz.apk to your phone" -ForegroundColor Gray
Write-Host "  2. Open Files app on phone > tap the APK > Install" -ForegroundColor Gray
Write-Host "  3. If blocked: Settings > Apps > Install Unknown Apps > Allow" -ForegroundColor Gray
Write-Host "=======================================================" -ForegroundColor Yellow
