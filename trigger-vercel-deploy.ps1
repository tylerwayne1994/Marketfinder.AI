# trigger-vercel-deploy.ps1
# PowerShell script to trigger a Vercel deployment

# Replace with your Vercel project ID
$projectId = "your-project-id"
# Replace with your Vercel team ID (if applicable)
$teamId = "your-team-id" # Remove if not using a team

# Get a Vercel token from https://vercel.com/account/tokens
$token = Read-Host "Enter your Vercel API token"

# API endpoint
$apiUrl = "https://api.vercel.com/v13/deployments"

# Request headers
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Request body
$body = @{
    "name" = "marketfinder-ai"
    "project" = $projectId
    "target" = "production"
    "gitSource" = @{
        "type" = "github"
        "repo" = "tylerwayne1994/Marketfinder.AI"
        "ref" = "main"
    }
} 

# Add teamId if provided
if ($teamId -ne "your-team-id") {
    $body["teamId"] = $teamId
}

$bodyJson = $body | ConvertTo-Json

# Send request
Write-Host "Triggering Vercel deployment..."
$response = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $bodyJson

# Output response
Write-Host "Deployment triggered!"
Write-Host "Deployment ID: $($response.id)"
Write-Host "Status: $($response.state)"
Write-Host "URL: https://$($response.url)"