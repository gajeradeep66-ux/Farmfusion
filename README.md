# FarmFusion

FarmFusion is a full-stack e-commerce platform for seeds, farming tools, soil nutrition, and plant care products.

## Stack

- Frontend: React + Vite + Tailwind CSS + React Router
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT + bcrypt
- Media: Cloudinary-ready upload support

## Production build

```bash
npm run build
npm run start
```

`npm run start` runs the Express server in production mode and serves the built frontend from the `dist` folder.

## Run locally or on another computer

Use Node.js 22.12 or newer (but below 25). From the folder containing `package.json`, install dependencies with `npm ci`. Copy `.env.example` to `.env`, then set `MONGO_URI`, `JWT_SECRET`, and `ADMIN_PASSWORD` to values for that computer; `.env` is intentionally not included in Git. The default MongoDB URI only works if MongoDB is installed and running on the same computer.

Start both the API and frontend with `npm run dev`. The frontend waits for the API and its database connection before starting, so its first requests do not race the backend startup.

## Admin access

The initial admin account is created from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the backend environment. Change the sample credentials before deployment and do not commit `.env`.
Administrators can change product and About-page images using either a direct image URL or a file upload (JPG, PNG, WebP or AVIF, up to 5 MB), edit the full product listing, manage customer account access, and update the public About content.
Customers can view their ordered products, saved-at-checkout delivery addresses, payment details, and current order statuses from **My Orders** in the account menu. Administrators can review each order's items and delivery address and update confirmed order statuses from the Orders section of the admin panel.

## API health check

```bash
http://localhost:7854/api/health
```

## Demo URL

After deployment, replace `YOUR-SERVICE-NAME` with the service name shown in Render, then use this Markdown link:

`[FarmFusion live demo](https://YOUR-SERVICE-NAME.onrender.com)`

### Deploy to Render

1. Push this project to a GitHub repository with `package.json` and `render.yaml` at the repository root, then create a new Blueprint in Render for that repository. If deploying from another computer, clone that project repository there; do not copy `node_modules` or rely on the local `.env`. Render will use the included `render.yaml` to build the Vite frontend and start the Express server with Node.js 22.12.0.
2. In the Blueprint setup, provide `MONGO_URI` for a reachable hosted MongoDB database and `ADMIN_PASSWORD` for the initial admin account. Render generates `JWT_SECRET`.
   - Free Render web services do not have static outbound IP addresses. If using MongoDB Atlas, you may need to allow connections from `0.0.0.0/0`; this permits connection attempts from any IP, so protect the database with a strong password and a least-privilege database user. Use a paid service with static outbound IPs if you need a narrower Atlas IP allowlist. URL-encode special characters in the MongoDB connection string.
3. After deployment, open `https://YOUR-SERVICE-NAME.onrender.com/api/health` and confirm it returns `"status":"ok"`.
4. Add valid `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` values in the Render service environment to enable online payments. For local development, set them in `.env`. Use Razorpay test keys for testing and live keys for real payments. The key secret must remain server-side; never expose it as a `VITE_` variable. If keys are not configured, checkout offers Cash on Delivery and explains that online payments are unavailable.
5. The Blueprint uses Render's free plan. Its filesystem is temporary, so admin-uploaded images saved under `uploads/` may disappear after a restart or redeploy. Use external image storage or a persistent disk on a supported paid service before relying on uploaded images.

## Notes

- Old dummy or unused PHP/SQL files were not part of the active Node project and were removed from the working project context.
- The 30 default catalog products (five per category) are inserted when missing; existing customer accounts and order records are not cleared.
- The storefront uses original local vector illustrations for product and category art. Administrators can upload matching product photos and About-page artwork; no external photo host is required.
- The blue-gradient theme and English, Gujarati and Hindi language preferences are saved in the visitor's browser. Both controls are next to the sign-in/cart actions.
- Online payment requires valid Razorpay test/live keys in backend environment variables. The checkout gracefully offers COD when gateway keys are not set.
