# Simple API test - login and create one consultation
Write-Host "`n=== PIIP Consultation API Test ===`n" -ForegroundColor Cyan

try {
    # 1. Login
    Write-Host "1. Logging in..." -ForegroundColor Yellow
    $loginBody = @{
        email = "admin@piip.com"
        password = "admin123!@#"
    } | ConvertTo-Json
    
    $loginResp = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    $token = $loginResp.token
    $headers = @{ Authorization = "Bearer $token" }
    Write-Host "  ✓ Logged in successfully" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    
    # 2. Create consultation
    Write-Host "`n2. Creating consultation..." -ForegroundColor Yellow
    $consultBody = @{
        type = "free15"
        channel = "video"
        timezone = "Asia/Seoul"
        hasAudioConsent = $true
        hasVideoConsent = $true
    } | ConvertTo-Json
    
    $consult = Invoke-RestMethod -Uri "http://localhost:4000/api/consultations" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $consultBody
    
    Write-Host "  ✓ Created consultation ID: $($consult.id)" -ForegroundColor Green
    Write-Host "  Status: $($consult.status)" -ForegroundColor Gray
    Write-Host "  Type: $($consult.type)" -ForegroundColor Gray
    
    # 3. List consultations
    Write-Host "`n3. Listing consultations..." -ForegroundColor Yellow
    $list = Invoke-RestMethod -Uri "http://localhost:4000/api/consultations" `
        -Method GET `
        -Headers $headers
    
    Write-Host "  ✓ Total consultations: $($list.total)" -ForegroundColor Green
    Write-Host "  Page size: $($list.pageSize), Current page: $($list.page)" -ForegroundColor Gray
    
    # 4. Filter by status
    Write-Host "`n4. Testing filter (status=proposed)..." -ForegroundColor Yellow
    $filtered = Invoke-RestMethod -Uri "http://localhost:4000/api/consultations?status=proposed" `
        -Method GET `
        -Headers $headers
    
    Write-Host "  ✓ Filtered results: $($filtered.total) proposed consultations" -ForegroundColor Green
    
    # 5. Test sorting
    Write-Host "`n5. Testing sort (createdAt desc)..." -ForegroundColor Yellow
    $sorted = Invoke-RestMethod -Uri "http://localhost:4000/api/consultations?sort=createdAt&order=desc" `
        -Method GET `
        -Headers $headers
    
    if ($sorted.items.Count -gt 0) {
        Write-Host "  ✓ Sorted successfully. Latest item created at: $($sorted.items[0].createdAt)" -ForegroundColor Green
    }
    
    Write-Host "`n=== All tests PASSED ===`n" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ TEST FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}
