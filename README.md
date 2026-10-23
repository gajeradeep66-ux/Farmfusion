# FarmFusion

An online store for seeds, farming tools, and plant care products.

## Project folders

| Folder | Contents |
|---|---|
| `frontend/` | React website |
| `backend/` | API and MongoDB |

## Features

- Browse, search, sort, and filter farm products by category.
- Manage a shopping cart and wishlist; place orders with Cash on Delivery or Razorpay.
- Register and sign in securely; view your order history and delivery details.
- Admin dashboard for products, inventory, customers, orders, and store information.
- Upload product and store images or use image URLs.
- English, Gujarati, and Hindi language options, plus light and dark themes.

## Run locally

Requirements: Node.js **22.12–24** and a running MongoDB instance.

1. Install dependencies for both folders:

   ```powershell
   npm ci --prefix backend
   npm ci --prefix frontend
   ```

2. Create the backend `.env` file:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

   Set `MONGO_URI`, `JWT_SECRET`, and `ADMIN_PASSWORD` in `backend\.env`.

3. Open two terminals and run one command in each:

   ```powershell
   npm run dev --prefix backend
   ```

   ```powershell
   npm run dev --prefix frontend
   ```

Website: `http://localhost:5173` · API health check: `http://localhost:7854/api/health`

## Deploy to Render

1. Push this repository to GitHub and create a **New Blueprint** in Render.
2. Render uses `render.yaml` to create the `farmfusion-api` and `farmfusion-web` services.
3. Set `MONGO_URI` and `ADMIN_PASSWORD` for the API service. Render generates `JWT_SECRET`.
4. After deployment, open the website: `https://farmfusion-web.onrender.com`
5. Check the API at `https://farmfusion-api.onrender.com/api/health`. It should return `"status":"ok"`.

To enable online payments, add the Razorpay `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to the Render **API service** environment. Never put these values in the frontend.

> On Render's free service, uploaded images may be lost after a restart or redeploy.
