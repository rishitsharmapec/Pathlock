# PowerShell Script to Setup .NET 8 Project Management API
# Run this script in PowerShell from the directory where you want to create the project

Write-Host "Setting up Project Management API..." -ForegroundColor Green

# Step 1: Create the project
Write-Host "`nCreating .NET 8 Web API project..." -ForegroundColor Cyan
dotnet new webapi -n ProjectManagementApi
Set-Location ProjectManagementApi

# Step 2: Install NuGet packages
Write-Host "`nInstalling NuGet packages..." -ForegroundColor Cyan
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.InMemory
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package System.IdentityModel.Tokens.Jwt

# Step 3: Create folder structure
Write-Host "`nCreating folder structure..." -ForegroundColor Cyan
$folders = @("Controllers", "Data", "DTOs", "Models", "Services")
foreach ($folder in $folders) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    Write-Host "   Created $folder/" -ForegroundColor Gray
}

# Step 4: Create empty files with proper structure
Write-Host "`nCreating code files..." -ForegroundColor Cyan

# Controllers
$controllerFiles = @("AuthController.cs", "ProjectsController.cs", "TasksController.cs")
foreach ($file in $controllerFiles) {
    New-Item -ItemType File -Path "Controllers\$file" -Force | Out-Null
    Write-Host "   Controllers/$file" -ForegroundColor Gray
}

# Data
New-Item -ItemType File -Path "Data\AppDbContext.cs" -Force | Out-Null
Write-Host "   Data/AppDbContext.cs" -ForegroundColor Gray

# DTOs
$dtoFiles = @("AuthDTOs.cs", "ProjectDTOs.cs", "TaskDTOs.cs")
foreach ($file in $dtoFiles) {
    New-Item -ItemType File -Path "DTOs\$file" -Force | Out-Null
    Write-Host "   DTOs/$file" -ForegroundColor Gray
}

# Models
$modelFiles = @("User.cs", "Project.cs", "ProjectTask.cs")
foreach ($file in $modelFiles) {
    New-Item -ItemType File -Path "Models\$file" -Force | Out-Null
    Write-Host "   Models/$file" -ForegroundColor Gray
}

# Services
$serviceFiles = @("IAuthService.cs", "AuthService.cs", "IProjectService.cs", "ProjectService.cs", "ITaskService.cs", "TaskService.cs")
foreach ($file in $serviceFiles) {
    New-Item -ItemType File -Path "Services\$file" -Force | Out-Null
    Write-Host "   Services/$file" -ForegroundColor Gray
}

Write-Host "`nProject structure created successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "   1. Copy the backend code into the respective files" -ForegroundColor White
Write-Host "   2. Update Program.cs with the provided code" -ForegroundColor White
Write-Host "   3. Add CORS configuration" -ForegroundColor White
Write-Host "   4. Run: dotnet run" -ForegroundColor White
Write-Host "`nProject location: $PWD" -ForegroundColor Cyan

# Open in default editor (optional)
$openEditor = Read-Host "`nWould you like to open the project in VS Code? (y/n)"
if ($openEditor -eq "y") {
    code .
}