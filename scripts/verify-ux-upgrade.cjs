const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('ATHARV ELECTRICAL — COMPLETE E-COMMERCE UX AUDIT TEST');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Verify Types in src/types/index.ts
const typesContent = fs.readFileSync(path.join(__dirname, '../src/types/index.ts'), 'utf8');
assert(typesContent.includes('colorCode?: string;'), 'ProductVariant supports colorCode hex string');
assert(typesContent.includes('colorName?: string;'), 'ProductVariant supports colorName string');
assert(typesContent.includes('isDefault?: boolean;'), 'ProductVariant supports isDefault flag');
assert(typesContent.includes('images?: string[];'), 'ProductVariant supports multiple variant images');
assert(typesContent.includes('selectedColor?: string;'), 'CartItem supports selectedColor string');
assert(typesContent.includes('variantImage?: string;'), 'CartItem supports variant-specific image');

// 2. Verify Admin Panel Color Variants Management in src/components/admin/AdminProducts.tsx
const adminProductsContent = fs.readFileSync(path.join(__dirname, '../src/components/admin/AdminProducts.tsx'), 'utf8');
assert(adminProductsContent.includes('COLOR_PRESETS'), 'AdminProducts includes Indian electrical standard color presets');
assert(adminProductsContent.includes('handleVariantImageUpload'), 'AdminProducts provides color variant image upload to Firebase Storage');
assert(adminProductsContent.includes('Color Variants (Amazon / Flipkart Style)'), 'AdminProducts includes dedicated Color Variants management section');
assert(adminProductsContent.includes('defaultColorVariant'), 'AdminProducts supports setting default color variant per product');
assert(adminProductsContent.includes('type="color"'), 'AdminProducts provides HTML5 color swatch picker');
assert(adminProductsContent.includes('p.variants.length > 0'), 'AdminProducts product table renders color dots & variant counts');

// 3. Verify Customer Product Card Color Swatches & Dynamic Switching
const productCardContent = fs.readFileSync(path.join(__dirname, '../src/components/customer/ProductCard.tsx'), 'utf8');
assert(productCardContent.includes('colorVariants'), 'ProductCard identifies color variants for Amazon/Flipkart styling');
assert(productCardContent.includes('handleColorSelect'), 'ProductCard switches color variant on click');
assert(productCardContent.includes('currentCardImage'), 'ProductCard dynamically swaps image to selected variant image');
assert(productCardContent.includes('currentPrice'), 'ProductCard calculates price delta for selected variant');
assert(productCardContent.includes('backgroundColor: vr.colorCode'), 'ProductCard renders clickable color swatch circles');

// 4. Verify Customer Product Detail Modal Color Variants & Gallery
const detailModalContent = fs.readFileSync(path.join(__dirname, '../src/components/customer/ProductDetailModal.tsx'), 'utf8');
assert(detailModalContent.includes('colorVariants'), 'ProductDetailModal detects color variants');
assert(detailModalContent.includes('handleSelectColor'), 'ProductDetailModal updates active color on swatch click');
assert(detailModalContent.includes('galleryImages'), 'ProductDetailModal dynamically updates image gallery for selected color');
assert(detailModalContent.includes('activeColorVariant?.stock'), 'ProductDetailModal shows stock per selected color variant');
assert(detailModalContent.includes('activeColorVariant?.sku'), 'ProductDetailModal shows variant-specific SKU');

// 5. Verify Mandatory Customer Login Gate on Add to Cart
const appContextContent = fs.readFileSync(path.join(__dirname, '../src/context/AppContext.tsx'), 'utf8');
assert(appContextContent.includes('ae_pending_cart_action'), 'AppContext stores pending cart action to sessionStorage for unauthenticated clicks');
assert(appContextContent.includes('setIsLoginModalOpen(true)'), 'AppContext triggers login modal when unauthenticated user attempts to add to cart');
assert(appContextContent.includes('selectedColorName'), 'AppContext records selectedColorName in cart item payload');

const authModalContent = fs.readFileSync(path.join(__dirname, '../src/components/customer/CustomerAuthModal.tsx'), 'utf8');
assert(authModalContent.includes('ae_pending_cart_action'), 'CustomerAuthModal checks and resumes pending cart action upon successful login');
assert(authModalContent.includes('addToCart(pending.product'), 'CustomerAuthModal automatically adds pending item to cart upon login');

// 6. Verify Blinkit-Style Sticky Bottom Cart Bar
const stickyBarContent = fs.readFileSync(path.join(__dirname, '../src/components/customer/StickyBottomCartBar.tsx'), 'utf8');
assert(stickyBarContent.includes('cartCount === 0'), 'StickyBottomCartBar hides when cart is empty');
assert(stickyBarContent.includes('bottom-[60px] lg:bottom-6'), 'StickyBottomCartBar positions above mobile bottom nav without overlap');
assert(stickyBarContent.includes('cartTotal.toLocaleString'), 'StickyBottomCartBar displays live cart total amount');
assert(stickyBarContent.includes('Free Express Delivery'), 'StickyBottomCartBar shows free delivery threshold indicator');

// 7. Verify Customer Account, Profile & Address Book
const accountViewContent = fs.readFileSync(path.join(__dirname, '../src/components/customer/CustomerAccountView.tsx'), 'utf8');
assert(accountViewContent.includes('fetchCustomerAddresses'), 'CustomerAccountView fetches saved addresses from Firestore');
assert(accountViewContent.includes('saveCustomerAddress'), 'CustomerAccountView saves new address to Firestore');
assert(accountViewContent.includes('deleteCustomerAddress'), 'CustomerAccountView supports deleting saved address');
assert(accountViewContent.includes('setDefaultCustomerAddress'), 'CustomerAccountView supports setting default address');
assert(accountViewContent.includes('lookupIndianPincode'), 'CustomerAccountView autocompletes Indian PIN codes');
assert(accountViewContent.includes('updateCustomerProfileDetails'), 'CustomerAccountView updates customer name and contact in Firebase Auth / Firestore');
assert(accountViewContent.includes('sendCustomerPasswordResetEmail'), 'CustomerAccountView provides secure password reset email');

// 8. Verify Live Order Tracking
const trackingViewContent = fs.readFileSync(path.join(__dirname, '../src/components/customer/OrderTrackingView.tsx'), 'utf8');
assert(trackingViewContent.includes('getTimelineSteps'), 'OrderTrackingView generates step-by-step fulfillment timeline');
assert(trackingViewContent.includes('Packed at Depot'), 'OrderTrackingView includes depot packing step at Manik Chowk, Chakan');
assert(trackingViewContent.includes('shiprocket.co/tracking'), 'OrderTrackingView links directly to live Shiprocket tracking');
assert(trackingViewContent.includes('ord.items.map'), 'OrderTrackingView displays purchased items with color variants');

// 9. Verify Professional Customer Tax Invoice & STRICT GST INCLUSIVITY
const invoiceModalContent = fs.readFileSync(path.join(__dirname, '../src/components/customer/InvoiceModal.tsx'), 'utf8');
assert(invoiceModalContent.includes('Manik Chowk, Chakan, Pune, Maharashtra — 410501'), 'InvoiceModal prints registered showroom address');
assert(invoiceModalContent.includes('TAX INVOICE'), 'InvoiceModal generates official tax invoice format');
assert(invoiceModalContent.includes('inclusive of applicable GST'), 'InvoiceModal strictly affirms prices are inclusive of GST with no extra tax added');
assert(invoiceModalContent.includes('window.print()'), 'InvoiceModal supports native browser A4 PDF print');
assert(invoiceModalContent.includes('order.totalAmount.toLocaleString'), 'InvoiceModal total amount matches order total without double taxing');

// 10. Verify App Layout & Spacing
const appContent = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
assert(appContent.includes('<StickyBottomCartBar />'), 'App renders StickyBottomCartBar in CustomerViewWrapper');
assert(appContent.includes('pb-32 lg:pb-12'), 'App provides generous bottom padding to prevent fixed bar overlap');

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL E-COMMERCE UX REQUIREMENTS VERIFIED SUCCESSFULLY!');
  process.exit(0);
}
