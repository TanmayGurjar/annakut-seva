# Stops the background Annakut Seva app and its internet tunnel
Get-CimInstance Win32_Process -Filter "Name = 'cmd.exe'" |
  Where-Object { $_.CommandLine -like '*annakut*run-server.cmd*' -or $_.CommandLine -like '*annakut*run-tunnel.cmd*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force; "stopped loop ($($_.ProcessId))" }
Get-CimInstance Win32_Process -Filter "Name = 'cloudflared.exe'" | Where-Object { $_.CommandLine -like '*--url http://localhost:*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force; "stopped tunnel ($($_.ProcessId))" }
$pidFile = Join-Path $PSScriptRoot '..\..\data\server.pid'
if (Test-Path $pidFile) {
  $id = [int](Get-Content $pidFile)
  $p = Get-Process -Id $id -ErrorAction SilentlyContinue
  if ($p -and $p.ProcessName -eq 'node') { Stop-Process -Id $id -Force; "stopped app ($id)" }
  Remove-Item $pidFile -ErrorAction SilentlyContinue
}
