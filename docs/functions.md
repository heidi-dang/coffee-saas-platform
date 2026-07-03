# CoffeeQR — Feature Development Roadmap

This document outlines the detailed step-by-step developer roadmap for implementing the 9 core functional enhancements proposed for the CoffeeQR SaaS platform.

---

## 1. Real-Time Order Sync via Server-Sent Events (SSE)

### Goal
Replace the 5-second HTTP polling loop in the kitchen order board with an instant server-sent event push.

### Step-by-Step Implementation Guide
1. **Database Event Trigger (Optional but recommended for scale):**
   * Use PostgreSQL `LISTEN` and `NOTIFY` inside a database trigger on the `Order` table to publish notifications on a channel named `order_updates`.
2. **Next.js SSE Route (`app/api/admin/orders/stream/route.ts`):**
   * Create an API route that sets headers:
     ```http
     Content-Type: text/event-stream
     Cache-Control: no-cache, no-transform
     Connection: keep-alive
     ```
   * Inside the route, establish a listener connection to PostgreSQL using a dedicated `pg` client.
   * On trigger fire, serialize the updated order payload and stream it down the connection:
     ```javascript
     controller.enqueue(`data: ${JSON.stringify(order)}\n\n`);
     ```
   * Clean up connections on request abort (close).
3. **Frontend Connection (`components/admin/orders-board.tsx`):**
   * Initialize `new EventSource('/app/api/admin/orders/stream')` inside a `useEffect`.
   * Bind `onmessage` handler to update the React state of orders instantly when a new event arrives.
   * Add reconnection logic with exponential backoff if the SSE stream drops.

---

## 2. Cryptographically Signed & Expiring Table QR Codes

### Goal
Prevent customers from placing fake orders by guessing other table numbers or ordering remotely.

### Step-by-Step Implementation Guide
1. **Token Generation Logic (`lib/auth/table-token.ts`):**
   * Write helper functions using standard Node.js `crypto` module (HMAC-SHA256).
   * Sign table details: `signTableToken(cafeId, tableNumber, secretKey)`.
   * Include a short hash and a timestamp in the token parameters.
2. **Generate QR Route (`app/api/admin/tables/[id]/qr/route.ts`):**
   * Generate the token using the cafe's private signing key.
   * Return URL structure: `/cafe/[slug]/order?tableToken=${signedToken}&t=${timestamp}`.
3. **Verify Table Middleware / Helper (`lib/orders/resolve-table.ts`):**
   * When checking out, verify the query signature matches the expected hash.
   * Verify the timestamp is within a reasonable window (e.g., 2 hours since scan) if strict expiration is turned on.
   * If signature is invalid, reject order creation.

---

## 3. Inventory Stock Control & Automatic "Sold Out" Badging

### Goal
Prevent customers from ordering out-of-stock items, particularly pastries and daily specials.

### Step-by-Step Implementation Guide
1. **Schema Update (`prisma/schema.prisma`):**
   * Add `stockQuantity Int?` to the `MenuItem` model (where `null` represents unlimited/always in stock).
2. **Checkout Validation (`lib/orders/create-order.ts`):**
   * Wrap order item checking inside a database transaction (`db.$transaction`).
   * Perform a check: If `item.stockQuantity !== null`:
     * If `item.stockQuantity < quantityOrdered`, throw an error ("Sorry, [Item] has sold out").
     * Else, perform a write update decrementing `stockQuantity` by the ordered amount.
3. **Customer UI Badging (`components/menu/menu-item-card.tsx`):**
   * If `stockQuantity === 0`, display a "Sold Out" badge instead of the price, and disable the "Add" button.
4. **Staff Management Panel:**
   * In the menu manager, allow staff to quickly increment or reset stock quantities.

---

## 4. ESC/POS Thermal Printing Integration for Kitchen Tickets

### Goal
Provide automatic or one-click thermal ticket printing for café operations.

### Step-by-Step Implementation Guide
1. **Format Print Content:**
   * Create a clean page layout specifically sized for 80mm roll paper using CSS `@media print` rules. Hide sidebars, navigation, and background glows.
2. **Browser Print Trigger (`app/admin/(protected)/orders/page.tsx`):**
   * Add a print button to the order card.
   * On click, open an iframe with the styled print ticket layout and call `window.print()` inside it.
3. **Advanced: Direct ESC/POS Driver (Optional):**
   * Write a handler utilizing the WebUSB API to query connected USB receipt printers.
   * Convert the order lines to raw ESC/POS byte commands (such as centering text, double-width titles, paper cut feeds) and send them directly to the device interface.

---

## 5. Loyalty Stamps & Customer Profiles

### Goal
Increase repeat business by letting users earn loyalty stamps on checkout.

### Step-by-Step Implementation Guide
1. **Database Schema:**
   * Add a `Customer` model: `id`, `email`, `phone`, `cafeId`, `stampCount` (default 0).
2. **Checkout Flow Integration (`components/checkout/checkout-form.tsx`):**
   * Add a optional field: "Phone Number for Loyalty Stamps".
   * On order success, look up the Customer record by phone number. If it exists, increment `stampCount` by the number of coffees purchased. If not, create a new record.
3. **Rewards Redemptions:**
   * If the customer's `stampCount >= 10`:
     * Deduct 10 stamps.
     * Apply a discount code/subtotal subtraction matching the value of a free base drink.
4. **Customer Landing Display:**
   * Store the customer's phone number in local storage on successful checkout. Next time they visit `/cafe/[slug]/order`, show their current stamp status (e.g. 7 / 10 stamps earned).

---

## 6. Advanced Customization Dependency Rules

### Goal
Hide irrelevant options (e.g., hiding dairy options on double espresso shots or cold brew).

### Step-by-Step Implementation Guide
1. **Database Schema:**
   * Add a new model `OptionDependency`:
     * `optionGroupId` (e.g., Milk Selection)
     * `dependsOnOptionValueId` (e.g., only show if "Hot Coffee" is selected)
2. **Admin Studio Customization Panel:**
   * In the menu option editor, add a checkbox: "Show this option group based on selection".
   * Let owners select the parent value from a dropdown list.
3. **Frontend Modal Logic (`components/menu/menu-item-modal.tsx`):**
   * In the option loop, check for dependencies.
   * Maintain a list of visible option groups in local React state. If the selected parent values don't match the required trigger ids, hide the dependent option groups and clear any current selections inside them.

---

## 7. Business Analytics & Performance Metrics Dashboard

### Goal
Provide cafe owners with actionable business intelligence directly in the dashboard.

### Step-by-Step Implementation Guide
1. **Performance Queries (`app/api/admin/analytics/route.ts`):**
   * Create an API endpoint using Prisma aggregation queries to fetch:
     * Daily / weekly revenue charts (`db.order.groupBy` by day).
     * Busiest hours (extract hour from `createdAt` fields on orders).
     * Top 5 selling items.
     * Average cycle time: difference in minutes between order `ACCEPTED` and `READY`.
2. **Visual Charts:**
   * Install a lightweight graphing library (like Recharts or Chart.js).
   * Render metrics beautifully in the main `app/admin/(protected)/dashboard/page.tsx` view with tabs for Daily, Weekly, and Monthly periods.

---

## 8. Frictionless PWA (Progressive Web App) with Offline Fallback

### Goal
Ensure the app loads instantly and works under weak network signals.

### Step-by-Step Implementation Guide
1. **Manifest File (`public/manifest.json`):**
   * Add application metadata, icons, start URL, theme colors, and display configuration.
2. **Service Worker Registration:**
   * Create `public/sw.js` using Workbox caching strategies.
   * Cache critical assets (CSS files, fonts, JavaScript bundles) and the base menu page structure.
3. **Offline Cart Queue:**
   * Store current cart items in IndexedDB using a wrapper like `idb-keyval`.
   * If the internet is offline during checkout, save the order request in an "Offline Queue" and monitor `window.addEventListener('online')` to retry the request automatically when network connectivity returns.

---

## 9. Post-Order Guest Feedback System

### Goal
Collect guest reviews privately so managers can optimize service without bad Google reviews.

### Step-by-Step Implementation Guide
1. **Schema Update (`prisma/schema.prisma`):**
   * Add `Feedback` model: `id`, `orderId`, `cafeId`, `rating` (Int 1-5), `comment` (String?), `createdAt`.
2. **Success Screen Rating UI (`app/cafe/[slug]/order/success/page.tsx`):**
   * When an order's status reaches `COMPLETED`, render a simple rating prompt (5 interactive stars) and a small comment box.
   * Send the payload via a POST request to `/api/cafe/[slug]/feedback`.
3. **Manager Dashboard List:**
   * Add a "Feedback" tab in the admin panel showing ratings, comments, and order details.
   * Alert managers on any 1-star or 2-star reviews so they can address issues immediately.
