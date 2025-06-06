
# Step 1: Create folders
$folders = @(
  "frontend\public",
  "frontend\src\assets\images",
  "frontend\src\assets\icons",
  "frontend\src\assets\fonts",
  "frontend\src\components\common",
  "frontend\src\components\layout",
  "frontend\src\components\forms",
  "frontend\src\components\booking",
  "frontend\src\components\shop",
  "frontend\src\contexts",
  "frontend\src\hooks",
  "frontend\src\layouts",
  "frontend\src\pages\services",
  "frontend\src\pages\account",
  "frontend\src\pages\legal",
  "frontend\src\services",
  "frontend\src\utils",
  "frontend\src\styles"
)

foreach ($folder in $folders) {
  if (-not (Test-Path $folder)) {
    New-Item -ItemType Directory -Path $folder | Out-Null
  }
}

# Step 2: Move shared/common components
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\Button.jsx frontend\src\components\common\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\Card.jsx frontend\src\components\common\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\Input.jsx frontend\src\components\common\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\Modal.jsx frontend\src\components\common\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\LoadingSpinner.jsx frontend\src\components\common\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\ErrorBoundary.jsx frontend\src\components\common\

# Layout Components
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\Navbar.jsx frontend\src\components\layout\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\Footer.jsx frontend\src\components\layout\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\Sidebar.jsx frontend\src\components\layout\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\MobileMenu.jsx frontend\src\components\layout\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\ScrollToTop.jsx frontend\src\components\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\ProtectedRoute.jsx frontend\src\components\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\Breadcrumbs.jsx frontend\src\components\

# Forms
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\ContactForm.jsx frontend\src\components\forms\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\LeadCaptureForm.jsx frontend\src\components\forms\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\NewsletterForm.jsx frontend\src\components\forms\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\CheckoutForm.jsx frontend\src\components\forms\

# Booking
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\Booking*.jsx frontend\src\components\booking\

# Shop
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\ProductCard.jsx frontend\src\components\shop\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\CartItem.jsx frontend\src\components\shop\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\CartDrawer.jsx frontend\src\components\shop\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\CartSummary.jsx frontend\src\components\shop\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\components\PaymentForm.jsx frontend\src\components\shop\

# Contexts
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\context\*.js frontend\src\contexts\

# Layouts
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\layouts\* frontend\src\layouts\

# Pages (Account)
Rename-Item -ErrorAction SilentlyContinue -Force frontend\src\pages\DashboardHomePage.jsx DashboardPage.jsx
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\pages\DashboardPage.jsx frontend\src\pages\account\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\pages\ProfilePage.jsx frontend\src\pages\account\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\pages\OrdersPage.jsx frontend\src\pages\account\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\pages\BookingsPage.jsx frontend\src\pages\account\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\pages\DownloadsPage.jsx frontend\src\pages\account\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\pages\CommunityPage.jsx frontend\src\pages\account\

# Legal
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\pages\PrivacyPolicyPage.jsx frontend\src\pages\legal\
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\pages\TermsOfServicePage.jsx frontend\src\pages\legal\

# Services
Move-Item -ErrorAction SilentlyContinue -Force frontend\src\services\*.js frontend\src\services\

Write-Host "`n✅ Project structure reorganization complete." -ForegroundColor Green
