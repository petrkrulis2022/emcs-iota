# Extract deployment information from Sui deployment output
# Usage: .\extract-deployment-info.ps1 deploy_output.json

param(
    [Parameter(Mandatory=$true)]
    [string]$DeployFile,
    [switch]$Write
)

# Check if file exists
if (-not (Test-Path $DeployFile)) {
    Write-Error "File $DeployFile not found"
    exit 1
}

# Read and parse JSON
$deployOutput = Get-Content $DeployFile | ConvertFrom-Json

# Extract Package ID
$publishedObject = $deployOutput.objectChanges | Where-Object { $_.type -eq "published" }
$packageId = $publishedObject.packageId

# Extract Operator Registry ID
$registryObject = $deployOutput.objectChanges | Where-Object { 
    $_.objectType -like "*operator_registry::OperatorRegistry*" 
}
$registryId = $registryObject.objectId

# Display results
Write-Host ""
Write-Host "========================================"
Write-Host "Deployment Information Extracted"
Write-Host "========================================"
Write-Host ""

if ($packageId) {
    Write-Host "📦 Package ID:"
    Write-Host "   $packageId"
} else {
    Write-Host "❌ Package ID not found"
}

if ($registryId) {
    Write-Host ""
    Write-Host "🗂️  Operator Registry ID:"
    Write-Host "   $registryId"
} else {
    Write-Host ""
    Write-Host "❌ Operator Registry ID not found"
}

Write-Host ""
Write-Host "🔗 Explorer Links:"
if ($packageId) {
    Write-Host "   Package: https://suiscan.xyz/testnet/object/$packageId"
}
if ($registryId) {
    Write-Host "   Registry: https://suiscan.xyz/testnet/object/$registryId"
}

# Generate .env content
Write-Host ""
Write-Host "========================================"
Write-Host "Backend .env Configuration"
Write-Host "========================================"
Write-Host ""

$envContent = @"
# Server Configuration
PORT=3000

# IOTA Configuration
IOTA_RPC_URL=https://fullnode.testnet.sui.io:443
CONTRACT_PACKAGE_ID=$($packageId ?? 'YOUR_PACKAGE_ID_HERE')
OPERATOR_REGISTRY_ID=$($registryId ?? 'YOUR_REGISTRY_ID_HERE')

# CORS Configuration
FRONTEND_URL=http://localhost:5173
"@

Write-Host $envContent

# Optionally write to backend/.env
$envPath = Join-Path $PSScriptRoot ".." "backend" ".env"

if ($Write -and $packageId -and $registryId) {
    $envContent | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host ""
    Write-Host "✅ Written to $envPath"
    Write-Host ""
} elseif ($Write) {
    Write-Host ""
    Write-Host "⚠️  Not writing to .env - missing Package ID or Registry ID"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "💡 To automatically write to backend/.env, run:"
    Write-Host "   .\extract-deployment-info.ps1 $DeployFile -Write"
    Write-Host ""
}
