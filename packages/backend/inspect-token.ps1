# Inspect exact header value
$loginBody = '{"email":"testadmin@test.com","password":"admin123!@#"}'
$login = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody

$token = $login.token

Write-Host "Token length: $($token.Length)"
Write-Host "Token contains newline: $($token.Contains("`n"))"
Write-Host "Token contains space: $($token.Contains(" "))"
Write-Host "Token first 50 chars: '$($token.Substring(0, 50))'"
Write-Host "Token last 50 chars: '$($token.Substring($token.Length - 50))'"

$auth = "Bearer $token"
Write-Host "`nAuth header length: $($auth.Length)"
Write-Host "Auth header: '$auth'"
