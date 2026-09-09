# Restart the Vite dev server on port 3001 and wait until it answers.
#
# Run it with `npm run restart` — that invocation string never changes, so the
# permission prompt can be allowed once instead of every time the inline
# one-liner is retyped slightly differently.
#
# Kills whatever is listening on 3001 (a stale `npm run dev`), starts a fresh
# hidden one from the repo root, then polls the served URL until it returns 200
# so a broken start is reported instead of silently assumed.

$ErrorActionPreference = 'SilentlyContinue'

$root = Split-Path -Parent $PSScriptRoot
$url  = 'http://localhost:3001/ccgQuest/ccgQuest-web/'

$listeners = Get-NetTCPConnection -LocalPort 3001 -State Listen
if ($listeners) {
  foreach ($conn in $listeners) {
    Stop-Process -Id $conn.OwningProcess -Force
  }
  Write-Output 'killed existing listener on 3001'
}

Start-Sleep -Milliseconds 500
Start-Process -FilePath 'npm.cmd' -ArgumentList 'run', 'dev' -WorkingDirectory $root -WindowStyle Hidden

foreach ($i in 1..25) {
  try {
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Output "dev server up: HTTP $($resp.StatusCode) $url"
    exit 0
  } catch {
    Start-Sleep -Milliseconds 800
  }
}

Write-Output 'dev server did NOT come up on 3001'
exit 1
