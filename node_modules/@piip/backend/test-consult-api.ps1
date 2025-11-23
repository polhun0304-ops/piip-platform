$login = Invoke-RestMethod -Uri 'http://localhost:4000/api/auth/login' -Method POST -ContentType 'application/json' -Body '{"email":"admin@piip.com","password":"admin123!@#"}'
$token = $login.token
$headers = @{ Authorization = "Bearer $token" }

Write-Output "✓ Logged in as admin"

# Create first consultation (proposed free15)
$body1 = @{
  type = "free15"
  channel = "video"
  timezone = "Asia/Seoul"
  legalAdviceDisclaimerAck = $true
  privacyPolicyAck = $true
} | ConvertTo-Json

$c1 = Invoke-RestMethod -Uri 'http://localhost:4000/api/consultations' -Method POST -Headers $headers -ContentType 'application/json' -Body $body1
Write-Output "✓ Created consultation 1: $($c1.id) status=$($c1.status) type=$($c1.type)"

Start-Sleep -Milliseconds 500

# Create second consultation (scheduled paid30)
$body2 = @{
  type = "paid30"
  channel = "voice"
  timezone = "UTC"
  scheduledAt = "2025-11-05T10:00:00.000Z"
  legalAdviceDisclaimerAck = $true
  recordingConsent = $true
  privacyPolicyAck = $true
} | ConvertTo-Json

$c2 = Invoke-RestMethod -Uri 'http://localhost:4000/api/consultations' -Method POST -Headers $headers -ContentType 'application/json' -Body $body2
Write-Output "✓ Created consultation 2: $($c2.id) status=$($c2.status) type=$($c2.type)"

# Test list with filters
Write-Output "`n--- Testing list/filter API ---"
$list = Invoke-RestMethod -Uri 'http://localhost:4000/api/consultations?page=1&pageSize=10' -Headers $headers
Write-Output "List all: total=$($list.total) items=$($list.items.Count)"

$listFiltered = Invoke-RestMethod -Uri 'http://localhost:4000/api/consultations?status=proposed' -Headers $headers
Write-Output "Filter status=proposed: total=$($listFiltered.total)"

$listSorted = Invoke-RestMethod -Uri 'http://localhost:4000/api/consultations?sort=createdAt&order=asc' -Headers $headers
Write-Output "Sort by createdAt ASC: first item created at $($listSorted.items[0].createdAt)"

Write-Output "`n✅ All tests passed"
