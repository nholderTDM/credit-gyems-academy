# Credit Gyems Academy - QA Test Suite

## Quick Start

### Prerequisites
- Node.js 18+
- PowerShell 5+
- K6 (for stress tests): https://k6.io/docs/getting-started/installation/
- Playwright (auto-installed)

### Running Tests

From the `QA/scripts/master` directory:

```powershell
# Quick smoke test (5-10 minutes)
./Run-AllTests.ps1 -TestMode Quick

# Standard test suite (30-45 minutes)
./Run-AllTests.ps1 -TestMode Standard

# Full test suite (60+ minutes)
./Run-AllTests.ps1 -TestMode Full

# Run only API tests
./Run-AllTests.ps1 -TestMode API

# Run only GUI tests
./Run-AllTests.ps1 -TestMode GUI

# Run only edge case tests
./Run-AllTests.ps1 -TestMode Edge

# Run against staging environment
./Run-AllTests.ps1 -Environment staging

# Run specific browser for GUI tests
./Run-AllTests.ps1 -TestMode GUI -Browser firefox