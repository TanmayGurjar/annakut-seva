# Makes the Annakut Seva app start by itself (hidden) every time you log in to Windows, and starts it now.
# Undo: run uninstall-autostart.ps1
$vbs = (Resolve-Path "$PSScriptRoot\start-hidden.vbs").Path
$lnk = Join-Path ([Environment]::GetFolderPath('Startup')) 'Annakut Seva.lnk'
$sc = (New-Object -ComObject WScript.Shell).CreateShortcut($lnk)
$sc.TargetPath = "$env:WINDIR\System32\wscript.exe"
$sc.Arguments = "`"$vbs`""
$sc.WorkingDirectory = Split-Path $vbs
$sc.Description = 'Annakut Seva app (runs in the background)'
$sc.Save()
"Auto-start installed: $lnk"
& "$PSScriptRoot\stop-server.ps1"
Start-Process "$env:WINDIR\System32\wscript.exe" -ArgumentList "`"$vbs`""
"App started in the background -> http://localhost:3000 (log: data\logs\server.log)"
