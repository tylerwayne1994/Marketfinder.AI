param(
  [int]$Port = 8010,
  [string]$BindHost = "127.0.0.1",
  [string]$App  = "app:app",
  [string]$VenvPy = ".\.venv311\Scripts\python.exe"
)

function Stop-Port {
  param([int]$Port)
  try {
    $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($conns) {
      $pids = $conns.OwningProcess | Sort-Object -Unique
      Write-Host "Killing PIDs on port ${Port}: $($pids -join ', ')" -ForegroundColor Yellow
      foreach ($procId in $pids) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
      }
      Start-Sleep -Milliseconds 300
    } else {
      Write-Host "No listeners on port ${Port}." -ForegroundColor DarkGray
    }
  } catch {
    Write-Host "Could not query/kill processes on port ${Port}: $_" -ForegroundColor Red
    try {
      $lines = netstat -ano | Select-String ":$Port\s"
      $pids = @()
      foreach ($line in $lines) {
        $parts = ($line.Line -split '\s+') | Where-Object { $_ -ne '' }
        if ($parts.Length -ge 5) { $pids += $parts[-1] }
      }
      $pids = $pids | Sort-Object -Unique
      if ($pids.Count -gt 0) {
        Write-Host "Fallback kill for PIDs: $($pids -join ', ')" -ForegroundColor Yellow
        foreach ($procId in $pids) { taskkill /PID $procId /F | Out-Null }
        Start-Sleep -Milliseconds 300
      }
    } catch {}
  }
}

# 1) Free the port
Stop-Port -Port $Port

# 2) Choose Python (venv or system)
if (Test-Path $VenvPy) { $py = $VenvPy } else { $py = "python" }

# 3) Start Uvicorn
Write-Host "Starting: $py -m uvicorn $App --host $BindHost --port $Port --reload" -ForegroundColor Cyan
& $py -m uvicorn $App --host $BindHost --port $Port --reload
