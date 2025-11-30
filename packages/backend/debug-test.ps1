# Debug test
Write-Host "Login and inspect response..."

$loginBody = '{"email":"testadmin@test.com","password":"admin123!@#"}'
$login = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody

Write-Host "Login response:"
$login | ConvertTo-Json -Depth 10

Write-Host "`n`nToken: $($login.token)"

Write-Host "`n`nTrying to create consultation..."
$headers = @{
    "Authorization" = "Bearer $($login.token)"
    "Content-Type" = "application/json"
}

$body = '{"type":"free15","channel":"video","timezone":"Asia/Seoul","hasAudioConsent":true,"hasVideoConsent":true}'

try {
    $result = Invoke-RestMethod -Uri "http://localhost:4000/api/consultations" -Method POST -Headers $headers -Body $body
    Write-Host "Success!"
    $result | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Failed: $($_.Exception.Message)"
    Write-Host "Details: $($_.ErrorDetails.Message)"
}
