$target = "d:\OE APP\admin\src\components\EditUserView.jsx"
$content = Get-Content "d:\OE APP\admin\src\components\EditUserView_src.js" -Raw
[System.IO.File]::WriteAllText($target, $content, [System.Text.Encoding]::UTF8)
Write-Host "Written successfully"