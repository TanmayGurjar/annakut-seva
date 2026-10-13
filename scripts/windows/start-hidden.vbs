' Starts run-server.cmd without a window (used by the Windows Startup shortcut)
Set fso = CreateObject("Scripting.FileSystemObject")
Set sh = CreateObject("WScript.Shell")
sh.Run """" & fso.BuildPath(fso.GetParentFolderName(WScript.ScriptFullName), "run-server.cmd") & """", 0, False
