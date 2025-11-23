# Register admin and test
Write-Host "`n=== Registering admin account ===`n" -ForegroundColor Cyan

try {
    # Register admin
    Write-Host "1. Registering admin user..." -ForegroundColor Yellow
    $registerBody = @{
        email = "testadmin@test.com"
        password = "admin123!@#"
        name = "Test Admin"
        role = "admin"
    } | ConvertTo-Json
    
    try {
        $registerResp = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/register" `
            -Method POST `
            -ContentType "application/json" `
            -Body $registerBody
        Write-Host "  ✓ Admin registered" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Host "  - Admin already exists (OK)" -ForegroundColor Gray
        } else {
            throw
        }
    }
    
    # Login
    Write-Host "`n2. Logging in..." -ForegroundColor Yellow
    $loginBody = @{
        email = "testadmin@test.com"
        password = "admin123!@#"
    } | ConvertTo-Json
    
    $loginResp = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    $token = $loginResp.token
    $headers = @{ Authorization = "Bearer $token" }
    Write-Host "  ✓ Logged in successfully" -ForegroundColor Green
    Write-Host "  Token (first 40 chars): $($token.Substring(0, [Math]::Min(40, $token.Length)))..." -ForegroundColor Gray
    Write-Host "  Token length: $($token.Length)" -ForegroundColor Gray
    
    # Create consultation
    Write-Host "`n3. Creating consultation..." -ForegroundColor Yellow
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
    Write-Host "  Status: $($consult.status), Type: $($consult.type)" -ForegroundColor Gray
    
    # List all
    Write-Host "`n4. Listing consultations..." -ForegroundColor Yellow
    $list = Invoke-RestMethod -Uri "http://localhost:4000/api/consultations" `
        -Method GET `
        -Headers $headers
    
    Write-Host "  ✓ Total: $($list.total) consultations" -ForegroundColor Green
    
    # Filter by status
    Write-Host "`n5. Filter by status=proposed..." -ForegroundColor Yellow
    $filtered = Invoke-RestMethod -Uri "http://localhost:4000/api/consultations?status=proposed" `
        -Method GET `
        -Headers $headers
    
    Write-Host "  ✓ Found $($filtered.total) proposed consultations" -ForegroundColor Green
    
    # Sort by date
    Write-Host "`n6. Sort by createdAt desc..." -ForegroundColor Yellow
    $sorted = Invoke-RestMethod -Uri "http://localhost:4000/api/consultations?sort=createdAt&order=desc" `
        -Method GET `
        -Headers $headers
    
    if ($sorted.items.Count -gt 0) {
        Write-Host "  ✓ Latest: $($sorted.items[0].createdAt)" -ForegroundColor Green
    }
    
    Write-Host "`n=== ALL TESTS PASSED ===`n" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ TEST FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}
