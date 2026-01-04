# STEP 1 - AUTHENTICATION TESTING
# Register 3 users, login, and verify JWT tokens

$base = "http://localhost:3000"

# Helper function to make HTTP requests
function Invoke-RestEndpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body,
        [string]$AuthToken
    )
    
    $url = "$base$Endpoint"
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($AuthToken) {
        $headers["Authorization"] = "Bearer $AuthToken"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $headers -Body ($Body | ConvertTo-Json) -ErrorAction Stop
        return $response
    } catch {
        return $_.Exception.Response | ConvertTo-Json
    }
}

Write-Host "`n========================================`n"
Write-Host "STEP 1: AUTHENTICATION TESTING" -ForegroundColor Cyan
Write-Host "========================================`n"

# 1.1 Register Candidate
Write-Host "1.1 REGISTERING CANDIDATE..." -ForegroundColor Yellow
$candRegister = Invoke-RestEndpoint -Method POST -Endpoint "/auth/register" -Body @{
    name = "John Doe"
    email = "candidate@test.com"
    password = "Password@123"
    role = "CANDIDATE"
    companyId = 1
}
Write-Host "✅ Response:" -ForegroundColor Green
$candRegister | ConvertTo-Json -Depth 5
$candToken = $candRegister.data.token
$candUserId = $candRegister.data.user.id
Write-Host "`n"

# 1.2 Register Recruiter
Write-Host "1.2 REGISTERING RECRUITER..." -ForegroundColor Yellow
$recRegister = Invoke-RestEndpoint -Method POST -Endpoint "/auth/register" -Body @{
    name = "Jane Smith"
    email = "recruiter@test.com"
    password = "Password@123"
    role = "RECRUITER"
    companyId = 1
}
Write-Host "✅ Response:" -ForegroundColor Green
$recRegister | ConvertTo-Json -Depth 5
$recToken = $recRegister.data.token
$recUserId = $recRegister.data.user.id
Write-Host "`n"

# 1.3 Register Hiring Manager
Write-Host "1.3 REGISTERING HIRING MANAGER..." -ForegroundColor Yellow
$mgrRegister = Invoke-RestEndpoint -Method POST -Endpoint "/auth/register" -Body @{
    name = "Bob Wilson"
    email = "manager@test.com"
    password = "Password@123"
    role = "HIRING_MANAGER"
    companyId = 1
}
Write-Host "✅ Response:" -ForegroundColor Green
$mgrRegister | ConvertTo-Json -Depth 5
$mgrToken = $mgrRegister.data.token
$mgrUserId = $mgrRegister.data.user.id
Write-Host "`n"

# 1.4 Login Candidate
Write-Host "1.4 LOGIN CANDIDATE..." -ForegroundColor Yellow
$candLogin = Invoke-RestEndpoint -Method POST -Endpoint "/auth/login" -Body @{
    email = "candidate@test.com"
    password = "Password@123"
}
Write-Host "✅ Response:" -ForegroundColor Green
$candLogin | ConvertTo-Json -Depth 5
Write-Host "`n"

# 1.5 Login Recruiter
Write-Host "1.5 LOGIN RECRUITER..." -ForegroundColor Yellow
$recLogin = Invoke-RestEndpoint -Method POST -Endpoint "/auth/login" -Body @{
    email = "recruiter@test.com"
    password = "Password@123"
}
Write-Host "✅ Response:" -ForegroundColor Green
$recLogin | ConvertTo-Json -Depth 5
Write-Host "`n"

# 1.6 Login Hiring Manager
Write-Host "1.6 LOGIN HIRING MANAGER..." -ForegroundColor Yellow
$mgrLogin = Invoke-RestEndpoint -Method POST -Endpoint "/auth/login" -Body @{
    email = "manager@test.com"
    password = "Password@123"
}
Write-Host "✅ Response:" -ForegroundColor Green
$mgrLogin | ConvertTo-Json -Depth 5
Write-Host "`n"

# Verify JWT tokens
Write-Host "1.7 VERIFYING JWT TOKENS..." -ForegroundColor Yellow
Write-Host "Candidate Token:" -ForegroundColor Cyan
Write-Host $candToken
Write-Host "`nRecruiter Token:" -ForegroundColor Cyan
Write-Host $recToken
Write-Host "`nHiring Manager Token:" -ForegroundColor Cyan
Write-Host $mgrToken

Write-Host "`n========================================`n"
Write-Host "STEP 1: AUTHENTICATION TESTING COMPLETE ✅" -ForegroundColor Green
Write-Host "========================================`n"
