# Parking Slot Manager - USER Security Audit
# Run from PowerShell while backend is running at http://localhost:5000.
# This script creates temporary test users/vehicle and exits the test session at the end.
# It does not delete database records because the project currently has no delete endpoints.

$ErrorActionPreference = "Stop"
$BaseUrl = "http://localhost:5000/api"
$RunId = Get-Date -Format "yyyyMMddHHmmss"
$Password = "Test@12345"
$UserAEmail = "security-audit-a-$RunId@example.com"
$UserBEmail = "security-audit-b-$RunId@example.com"
$VehicleNumber = "AUDIT$RunId"
$Passed = 0
$Failed = 0

function Write-Result {
    param([string]$Name,[bool]$Success,[string]$Detail = "")
    if ($Success) {
        $script:Passed++
        Write-Host "[PASS] $Name" -ForegroundColor Green
    } else {
        $script:Failed++
        Write-Host "[FAIL] $Name" -ForegroundColor Red
        if ($Detail) { Write-Host "       $Detail" -ForegroundColor Yellow }
    }
}

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [string]$Token = $null,
        [int[]]$ExpectedStatus = @(200)
    )
    $headers = @{}
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    $jsonBody = $null
    if ($null -ne $Body) { $jsonBody = $Body | ConvertTo-Json -Depth 10 }

    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl$Path" -Method $Method -Headers $headers -ContentType "application/json" -Body $jsonBody
        $parsed = $null
        if ($response.Content) { try { $parsed = $response.Content | ConvertFrom-Json } catch {} }
        if ($ExpectedStatus -notcontains [int]$response.StatusCode) {
            throw "Expected HTTP $($ExpectedStatus -join ', '), got HTTP $($response.StatusCode)"
        }
        return [pscustomobject]@{ StatusCode=[int]$response.StatusCode; Body=$parsed; Raw=$response.Content }
    } catch {
        $webResponse = $_.Exception.Response
        if ($webResponse) {
            $status = [int]$webResponse.StatusCode
            $reader = New-Object System.IO.StreamReader($webResponse.GetResponseStream())
            $raw = $reader.ReadToEnd()
            $reader.Close()
            $parsed = $null
            if ($raw) { try { $parsed = $raw | ConvertFrom-Json } catch {} }
            if ($ExpectedStatus -contains $status) {
                return [pscustomobject]@{ StatusCode=$status; Body=$parsed; Raw=$raw }
            }
            throw "HTTP $status from $Method $Path : $raw"
        }
        throw
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Parking Slot Manager - USER Security Audit" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Backend: $BaseUrl"
Write-Host "Run ID : $RunId"
Write-Host ""

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get | Out-Null
    Write-Result "Backend health" $true
} catch {
    Write-Result "Backend health" $false $_.Exception.Message
    Write-Host "Start the backend and run this script again." -ForegroundColor Yellow
    exit 1
}

try {
    Invoke-Api -Method POST -Path "/auth/register" -Body @{name="Security Audit User A";email=$UserAEmail;password=$Password} -ExpectedStatus @(201,200) | Out-Null
    Write-Result "User A registration" $true
} catch { Write-Result "User A registration" $false $_.Exception.Message; exit 1 }

try {
    $aLogin = Invoke-Api -Method POST -Path "/auth/login" -Body @{email=$UserAEmail;password=$Password} -ExpectedStatus @(200)
    $TokenA = $aLogin.Body.token
    if (-not $TokenA) { throw "Login response did not contain token" }
    Write-Result "User A login" $true
} catch { Write-Result "User A login" $false $_.Exception.Message; exit 1 }

try {
    $aMe = Invoke-Api -Method GET -Path "/auth/me" -Token $TokenA -ExpectedStatus @(200)
    $aUserId = $aMe.Body.user.userId
    $aRole = $aMe.Body.user.role
    Write-Result "User A /auth/me identity" ($aRole -eq "USER" -and $aUserId)
} catch { Write-Result "User A /auth/me identity" $false $_.Exception.Message }

try {
    $aVehiclesBefore = Invoke-Api -Method GET -Path "/vehicles" -Token $TokenA -ExpectedStatus @(200)
    $count = @($aVehiclesBefore.Body).Count
    Write-Result "User A starts with no vehicles" ($count -eq 0) "Expected 0 vehicles, got $count"
} catch { Write-Result "User A starts with no vehicles" $false $_.Exception.Message }

try {
    $aVehicleResponse = Invoke-Api -Method POST -Path "/vehicles" -Token $TokenA -Body @{vehicleNumber=$VehicleNumber;vehicleType="CAR"} -ExpectedStatus @(201)
    $vehicleAId = [int]$aVehicleResponse.Body.id
    if (-not $vehicleAId) { throw "Vehicle response did not contain id" }
    Write-Result "User A creates own vehicle" $true
} catch { Write-Result "User A creates own vehicle" $false $_.Exception.Message; exit 1 }

try {
    Invoke-Api -Method POST -Path "/auth/register" -Body @{name="Security Audit User B";email=$UserBEmail;password=$Password} -ExpectedStatus @(201,200) | Out-Null
    Write-Result "User B registration" $true
} catch { Write-Result "User B registration" $false $_.Exception.Message; exit 1 }

try {
    $bLogin = Invoke-Api -Method POST -Path "/auth/login" -Body @{email=$UserBEmail;password=$Password} -ExpectedStatus @(200)
    $TokenB = $bLogin.Body.token
    if (-not $TokenB) { throw "Login response did not contain token" }
    Write-Result "User B login" $true
} catch { Write-Result "User B login" $false $_.Exception.Message; exit 1 }

try {
    $bVehicles = Invoke-Api -Method GET -Path "/vehicles" -Token $TokenB -ExpectedStatus @(200)
    $leak = @($bVehicles.Body) | Where-Object { [int]$_.id -eq $vehicleAId }
    Write-Result "User B cannot see User A vehicle" ($null -eq $leak) "User A vehicle ID $vehicleAId appeared in User B vehicle list"
} catch { Write-Result "User B cannot see User A vehicle" $false $_.Exception.Message }

try {
    $bActive = Invoke-Api -Method GET -Path "/parking-sessions" -Token $TokenB -ExpectedStatus @(200)
    $leak = @($bActive.Body) | Where-Object { $_.vehicle_id -eq $vehicleAId -or $_.vehicleId -eq $vehicleAId }
    Write-Result "User B cannot see User A active sessions" ($null -eq $leak)
} catch { Write-Result "User B cannot see User A active sessions" $false $_.Exception.Message }

try {
    $bHistory = Invoke-Api -Method GET -Path "/parking-sessions/history" -Token $TokenB -ExpectedStatus @(200)
    $leak = @($bHistory.Body) | Where-Object { $_.vehicle_id -eq $vehicleAId -or $_.vehicleId -eq $vehicleAId }
    Write-Result "User B cannot see User A history" ($null -eq $leak)
} catch { Write-Result "User B cannot see User A history" $false $_.Exception.Message }

try {
    $aSlots = Invoke-Api -Method GET -Path "/parking-slots" -Token $TokenA -ExpectedStatus @(200)
    $slotA = @($aSlots.Body) | Where-Object {$_.status -eq "AVAILABLE" -and $_.slot_type -eq "CAR" -and $_.area_status -eq "ACTIVE" -and $_.facility_status -eq "ACTIVE"} | Select-Object -First 1
    if (-not $slotA) { throw "No available active CAR slot found" }
    $slotAId = [int]$slotA.id
    Write-Result "Find available active CAR slot" $true
} catch { Write-Result "Find available active CAR slot" $false $_.Exception.Message; exit 1 }

try {
    $parkA = Invoke-Api -Method POST -Path "/parking-sessions" -Token $TokenA -Body @{vehicleId=$vehicleAId;slotId=$slotAId} -ExpectedStatus @(201)
    $sessionAId = [int]$parkA.Body.id
    if (-not $sessionAId) { throw "Parking response did not contain session id" }
    Write-Result "User A can park own vehicle" $true
} catch { Write-Result "User A can park own vehicle" $false $_.Exception.Message; exit 1 }

try {
    $attack = Invoke-Api -Method POST -Path "/parking-sessions" -Token $TokenB -Body @{vehicleId=$vehicleAId;slotId=$slotAId} -ExpectedStatus @(400,401,403,404,409)
    $message = if ($attack.Body -and $attack.Body.message) {$attack.Body.message} else {""}
    Write-Result "User B cannot park User A vehicle" ($attack.StatusCode -ge 400 -and $attack.StatusCode -lt 500) "HTTP $($attack.StatusCode) $message"
} catch { Write-Result "User B cannot park User A vehicle" $false $_.Exception.Message }

try {
    $bActiveAfterAttack = Invoke-Api -Method GET -Path "/parking-sessions" -Token $TokenB -ExpectedStatus @(200)
    $leak = @($bActiveAfterAttack.Body) | Where-Object {$_.id -eq $sessionAId -or $_.session_id -eq $sessionAId}
    Write-Result "User B cannot see User A active session" ($null -eq $leak)
} catch { Write-Result "User B cannot see User A active session" $false $_.Exception.Message }

try {
    $bExitAttack = Invoke-Api -Method POST -Path "/parking-sessions/$sessionAId/exit" -Token $TokenB -ExpectedStatus @(400,401,403,404,409)
    $message = if ($bExitAttack.Body -and $bExitAttack.Body.message) {$bExitAttack.Body.message} else {""}
    Write-Result "User B cannot exit User A session" ($bExitAttack.StatusCode -ge 400 -and $bExitAttack.StatusCode -lt 500) "HTTP $($bExitAttack.StatusCode) $message"
} catch { Write-Result "User B cannot exit User A session" $false $_.Exception.Message }

try {
    $aActiveAfterAttack = Invoke-Api -Method GET -Path "/parking-sessions" -Token $TokenA -ExpectedStatus @(200)
    $stillActive = @($aActiveAfterAttack.Body) | Where-Object {$_.id -eq $sessionAId -or $_.session_id -eq $sessionAId}
    Write-Result "User A session remains active after User B attack" ($null -ne $stillActive)
} catch { Write-Result "User A session remains active after User B attack" $false $_.Exception.Message }

try {
    Invoke-Api -Method POST -Path "/parking-sessions/$sessionAId/exit" -Token $TokenA -ExpectedStatus @(200) | Out-Null
    Write-Result "User A can exit own session" $true
} catch { Write-Result "User A can exit own session" $false $_.Exception.Message }

try {
    $aSlotsAfterExit = Invoke-Api -Method GET -Path "/parking-slots" -Token $TokenA -ExpectedStatus @(200)
    $slotAfterExit = @($aSlotsAfterExit.Body) | Where-Object {[int]$_.id -eq $slotAId}
    Write-Result "Slot becomes available after User A exits" ($slotAfterExit.status -eq "AVAILABLE")
} catch { Write-Result "Slot becomes available after User A exits" $false $_.Exception.Message }

try {
    $bHistoryAfter = Invoke-Api -Method GET -Path "/parking-sessions/history" -Token $TokenB -ExpectedStatus @(200)
    $leak = @($bHistoryAfter.Body) | Where-Object {$_.id -eq $sessionAId -or $_.session_id -eq $sessionAId}
    Write-Result "User B cannot see User A completed history" ($null -eq $leak)
} catch { Write-Result "User B cannot see User A completed history" $false $_.Exception.Message }

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Security Audit Result" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Passed: $Passed" -ForegroundColor Green
Write-Host "Failed: $Failed" -ForegroundColor Red
Write-Host ""
Write-Host "Test data created:"
Write-Host "  User A: $UserAEmail"
Write-Host "  User B: $UserBEmail"
Write-Host "  Vehicle: $VehicleNumber"
Write-Host "  Vehicle ID: $vehicleAId"
Write-Host "  Session ID: $sessionAId"
Write-Host ""

if ($Failed -eq 0) {
    Write-Host "RESULT: ALL SECURITY TESTS PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "RESULT: SECURITY AUDIT HAS FAILURES" -ForegroundColor Red
    exit 1
}
