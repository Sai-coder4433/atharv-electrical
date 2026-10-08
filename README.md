# ATHARV ELECTRICAL ⚡
### Official E-Commerce Web Application & Admin Management Suite

Official e-commerce platform for **ATHARV ELECTRICAL**, located at **Manik Chowk, Chakan, India**. Built with modern React, TypeScript, Tailwind CSS, Firebase (Firestore, Auth, Storage, Cloud Functions), and Razorpay payments.

---

## 🌟 Key Features

### 🛍️ Customer Storefront
* **12-Section Approved Homepage:**
  * Clean navigation with categories drawer & search
  * Compact 3-slide hero promotional carousel
  * Shop by Category (Fans, Lights, Switches & Sockets, Wires & Cables)
  * Dedicated collections: Best Sellers, Fans, Lights, Switches, Wires & Cables
  * Featured Brands (ORIENT, Goldmedal)
  * Interactive promotional offer banners
  * Why Choose Atharv Electrical value propositions
  * Store Location & Directions (**Manik Chowk, Chakan, India**)
  * Informational Footer with quick links & policies
* **Shopping Experience:**
  * Dynamic product filters & instant search
  * Variant selectors (Color, Size/Spec, Pack)
  * Real-time Cart Drawer with instant calculation & free delivery progress
  * 4-step Checkout with Razorpay payment gateway integration
  * Customer Order Status tracking (`Pending`, `Confirmed`, `Processing`, `Completed`, `Cancelled`)

### 🛠️ Comprehensive Admin Suite (15 Modules)
* **Dashboard:** Real-time revenue metrics, orders summary, low-stock warnings, and top-selling products.
* **Products:** Full 9-section enterprise product management (Basic, Pricing, Inventory, Variants, Specs, Media upload, SEO).
* **Categories & Subcategories:** Full hierarchical category management with banner and icon uploads.
* **Brands:** Brand partner management (ORIENT, Goldmedal, etc.).
* **Inventory & Orders:** Order processing, status updates, invoice generation, and customer details.
* **Reviews & Moderation:** Customer review moderation with approval/hiding tools.
* **Razorpay Payments Log:** Audit logs of transactions and signatures.
* **Store Settings & 1-Click Seeder:** Store profile editor and 1-click database seeder to initialize Cloud Firestore instantly.

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js (v18 or higher)
* npm or pnpm

### 2. Installation
```bash
git clone https://github.com/Sai-coder4433/atharv-electrical.git
cd atharv-electrical
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase and Razorpay credentials:
```bash
cp .env.example .env
```

### 4. Run Development Server
```bash
npm run dev
```
The application will run at:
* **Local:** `http://localhost:3001/`
* **Network:** `http://<your-ip>:3001/`

---

## 🔐 Admin Portal Access
* Click **Admin** in the storefront header or mobile drawer.
* Default admin email: `admin@atharvelectrical.com`
* Offline/Preview mode allows instant access for testing. Connect Firebase credentials in `.env` for production Firestore authentication.

---

## 📍 Store Location
* **Atharv Electrical**
* Manik Chowk, Chakan, India
