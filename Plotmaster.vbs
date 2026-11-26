' Plotmaster launcher
' Opens index.html in a standalone Chrome/Edge app window (no tabs or address bar).
Option Explicit

Dim fso, shell, baseDir, pagePath, pageUrl
Dim candidates, browser, i, chromeArgs

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

baseDir = fso.GetParentFolderName(WScript.ScriptFullName)
pagePath = fso.BuildPath(baseDir, "index.html")

If Not fso.FileExists(pagePath) Then
  MsgBox "index.html was not found next to this launcher.", vbExclamation, "Plotmaster"
  WScript.Quit 1
End If

' Build a file:// URL. Escape characters that would change the URL meaning.
pageUrl = Replace(pagePath, "\", "/")
pageUrl = Replace(pageUrl, "%", "%25")
pageUrl = Replace(pageUrl, " ", "%20")
pageUrl = Replace(pageUrl, "#", "%23")
pageUrl = Replace(pageUrl, "?", "%3F")
pageUrl = "file:///" & pageUrl

' Prefer Chrome, then fall back to Edge (both support --app).
candidates = Array( _
  shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Google\Chrome\Application\chrome.exe", _
  shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\Google\Chrome\Application\chrome.exe", _
  shell.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Google\Chrome\Application\chrome.exe", _
  shell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Microsoft\Edge\Application\msedge.exe", _
  shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\Microsoft\Edge\Application\msedge.exe", _
  shell.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Microsoft\Edge\Application\msedge.exe" _
)

browser = ""
For i = 0 To UBound(candidates)
  If fso.FileExists(candidates(i)) Then
    browser = candidates(i)
    Exit For
  End If
Next

If browser = "" Then
  MsgBox "Google Chrome or Microsoft Edge was not found." & vbCrLf & _
         "Install Chrome, or open index.html manually.", vbExclamation, "Plotmaster"
  WScript.Quit 1
End If

chromeArgs = "--app=""" & pageUrl & """ --window-size=1600,1000"
shell.Run """" & browser & """ " & chromeArgs, 1, False
