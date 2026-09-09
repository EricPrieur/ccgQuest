# Package dist/ into ccgQuest-itch.zip for itch.io upload.
# Uses .NET ZipArchive with explicit forward-slash entry names so the archive
# is spec-compliant (Windows PowerShell 5.1's Compress-Archive writes backslash
# separators, which itch mis-extracts). Run AFTER `vite build --base=./` and
# `node scripts/prune-itch-assets.mjs`. index.html lands at the zip root.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$zipPath = Join-Path $root 'ccgQuest-itch.zip'
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$distFull = (Get-Item (Join-Path $root 'dist')).FullName
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  Get-ChildItem -Path $distFull -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($distFull.Length + 1).Replace([char]92, [char]47)
    [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal)
  }
} finally { $zip.Dispose() }
$a = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$count = $a.Entries.Count
$hasRootIndex = [bool]($a.Entries | Where-Object { $_.FullName -eq 'index.html' })
$a.Dispose()
$sizeMB = '{0:N1}' -f ((Get-Item $zipPath).Length / 1MB)
Write-Host "Wrote $zipPath - $count files, $sizeMB MB, index.html at root: $hasRootIndex"
if ($count -ge 1000) { Write-Warning "File count $count is at/over itch's 1000-file cap!" }
