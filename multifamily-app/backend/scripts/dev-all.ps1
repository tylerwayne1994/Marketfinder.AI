# scripts/dev-all.ps1
param(
  [string]$HostAddr = "127.0.0.1",
  [int]$PortUpload = 8010,   # app.py (Upload/Underwrite)
  [int]$PortPFA    = 8011    # health_check_app.py (PFA)
)

$ErrorActionPreference = "Stop"

# Resolve repo root (script lives in backend\scripts)
$root   = Split-Path $PSScriptRoot -Parent
$venvPy = Join-Path $root ".venv311\Scripts\python.exe"
# PowerShell has no ?:, use if/else
if (Test-Path $venvPy) { $py = $venvPy } else { $py = "python" }

function Kill-Port {
  param([int]$Port)
  $pids = @()

  # Preferred: Get-NetTCPConnection
  try {
    $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop
    if ($conns) {
      $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    }
  } catch {
    # Fallback: parse netstat (simple, valid regex)
    $lines = netstat -ano | Select-String (":$Port\s")
    foreach ($ln in $lines) {
      $m = [regex]::Match($ln.ToString(), "\s+(\d+)\s*$")
      if ($m.Success) { $pids += [int]$m.Groups[1].Value }
    }
    $pids = $pids | Sort-Object -Unique
  }

  if ($pids.Count -gt 0) {
    Write-Host ("Killing PIDs on port {0}: {1}" -f $Port, ($pids -join ', '))
    foreach ($p in $pids) { try { Stop-Process -Id $p -Force -ErrorAction Stop } catch {} }
  } else {
    Write-Host ("No process found on port {0}" -f $Port)
  }
}

# Clean both ports first
Kill-Port $PortUpload
Kill-Port $PortPFA

# Commands
$cmd1 = "-m uvicorn app:app --host $HostAddr --port $PortUpload --reload"
$cmd2 = "-m uvicorn health_check_app:app --host $HostAddr --port $PortPFA --reload"

# Start both backends (separate processes)
Write-Host "Starting Upload/Underwrite backend: $py $cmd1"
$p1 = Start-Process -FilePath $py -ArgumentList $cmd1 -WorkingDirectory $root -PassThru

Write-Host "Starting PFA backend: $py $cmd2"
$p2 = Start-Process -FilePath $py -ArgumentList $cmd2 -WorkingDirectory $root -PassThru

Write-Host ("Upload PID: {0} | PFA PID: {1}" -f $p1.Id, $p2.Id)
Write-Host ("Ready: http://{0}:{1}/health  and  http://{0}:{2}/health" -f $HostAddr, $PortUpload, $PortPFA)
