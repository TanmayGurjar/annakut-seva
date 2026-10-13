# Removes the Windows Startup shortcut and stops the background app
Remove-Item (Join-Path ([Environment]::GetFolderPath('Startup')) 'Annakut Seva.lnk') -ErrorAction SilentlyContinue
& "$PSScriptRoot\stop-server.ps1"
"Auto-start removed"
