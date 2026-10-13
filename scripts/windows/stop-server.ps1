# Stops the background Annakut Seva app: first the restart loop, then the app (by the id in data\server.pid)
Get-CimInstance Win32_Process -Filter "Name = 'cmd.exe'" | Where-Object { $_.CommandLine -like '*annakut*run-server.cmd*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force; "stopped restart loop ($($_.ProcessId))" }
$pidFile = Join-Path $PSScriptRoot '..\..\data\server.pid'
if (Test-Path $pidFile) {
  $id = [int](Get-Content $pidFile)
  $p = Get-Process -Id $id -ErrorAction SilentlyContinue
  if ($p -and $p.ProcessName -eq 'node') { Stop-Process -Id $id -Force; "stopped app ($id)" }
  Remove-Item $pidFile -ErrorAction SilentlyContinue
}
