' Starts the app and the internet tunnel without windows (used by the Windows Startup shortcut)
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
sh.Run """" & fso.BuildPath(dir, "run-server.cmd") & """", 0, False
sh.Run """" & fso.BuildPath(dir, "run-tunnel.cmd") & """", 0, False
