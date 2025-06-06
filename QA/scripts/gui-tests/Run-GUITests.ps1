# Run-GUITests.ps1
# GUI test suite runner using Playwright
# Location: QA/scripts/gui-tests/

param(
    [string]$Environment = "local",
    [string]$Browser = "chromium",
    [switch]$Headless,
    [switch]$UpdateSnapshots,
    [switch]$FullSuite,
    [string]$TestPattern = "*"
)

# Load configuration
$configPath = Join-Path (Split-Path -Parent $PSScriptRoot) "master\Test-Config.ps1"
. $configPath

Write-Host "`nGUI Test Suite" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Gray
Write-Host "Browser: $Browser" -ForegroundColor Gray
Write-Host "Mode: $(if ($Headless) { 'Headless' } else { 'Headed' })" -ForegroundColor Gray

# Get environment URLs
$env = Get-TestEnvironment -Environment $Environment

# Update Playwright config with correct URLs
$playwrightConfig = @"
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: '../../test-reports/$(Get-Date -Format 'yyyy-MM-dd')/gui-tests' }],
    ['json', { outputFile: '../../test-reports/$(Get-Date -Format 'yyyy-MM-dd')/gui-tests/results.json' }]
  ],
  use: {
    baseURL: '$($env.FrontendUrl)',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'echo "Servers should already be running"',
    url: '$($env.FrontendUrl)',
    reuseExistingServer: true,
  },
});
"@

$playwrightConfig | Out-File -FilePath "$PSScriptRoot\playwright.config.js" -Encoding UTF8

# Install Playwright if needed
Push-Location $PSScriptRoot
try {
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing Playwright..." -ForegroundColor Yellow
        npm init -y
        npm install -D @playwright/test axe-playwright
        npx playwright install
    }
    
    # Build test command
    $testCommand = "npx playwright test"
    
    if ($TestPattern -ne "*") {
        $testCommand += " $TestPattern"
    }
    
    if ($Browser -ne "all") {
        $testCommand += " --project=$Browser"
    }
    
    if ($Headless) {
        $env:HEADLESS = "true"
    } else {
        $testCommand += " --headed"
    }
    
    if ($UpdateSnapshots) {
        $testCommand += " --update-snapshots"
    }
    
    # Set environment variables
    $env:TEST_BASE_URL = $env.FrontendUrl
    $env:API_BASE_URL = $env.BackendUrl
    
    # Run tests
    Write-Host "Executing: $testCommand" -ForegroundColor Gray
    Invoke-Expression $testCommand
    
    # Check results
    $resultsPath = Join-Path $Global:TestPaths.Reports.Today "gui-tests\results.json"
    if (Test-Path $resultsPath) {
        $results = Get-Content $resultsPath | ConvertFrom-Json
        
        Write-Host "`nGUI Test Results:" -ForegroundColor Cyan
        Write-Host "  Total: $($results.stats.expected)" -ForegroundColor White
        Write-Host "  Passed: $($results.stats.expected - $results.stats.unexpected)" -ForegroundColor Green
        Write-Host "  Failed: $($results.stats.unexpected)" -ForegroundColor Red
        
        # Open HTML report
        npx playwright show-report "../../test-reports/$(Get-Date -Format 'yyyy-MM-dd')/gui-tests"
    }
}
finally {
    Pop-Location
}
