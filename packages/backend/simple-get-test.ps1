# Test without token
Write-Host "Trying without token..."
try {
    $result = Invoke-RestMethod -Uri "http://localhost:4000/api/consultations" -Method GET
    Write-Host "Success (shouldn't happen)"
} catch {
    Write-Host "Error: $($_.Exception.Response.StatusCode)"
    Write-Host "Details: $($_.ErrorDetails.Message)"
}

Write-Host "`nLogin first..."
$loginBody = '{"email":"testadmin@test.com","password":"admin123!@#"}'
$login = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody

Write-Host "Token: $($login.token.Substring(0, 50))..."

Write-Host "`nTrying with just GET (no body)..."
$headers = @{
    "Authorization" = "Bearer $($login.token)"
}

try {
    $result = Invoke-RestMethod -Uri "http://localhost:4000/api/consultations" -Method GET -Headers $headers
    Write-Host "Success! Total: $($result.total)"
} catch {
    Write-Host "Error: $($_.Exception.Response.StatusCode)"
    Write-Host "Details: $($_.ErrorDetails.Message)"
}
