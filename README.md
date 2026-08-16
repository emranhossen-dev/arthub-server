# 🎨 ArtHub – Express & MongoDB Backend API

Node.js, Express.js, and MongoDB backend REST API for ArtHub – Online Art Marketplace.

## 🔗 Repository & Live Server
- **Server Repository**: [https://github.com/emranhossen-dev/arthub-server.git](https://github.com/emranhossen-dev/arthub-server.git)
- **Live Client App**: [https://arthubemran.netlify.app](https://arthubemran.netlify.app)

---

## 🛠️ API Endpoints Summary

### 🖼️ Artworks API (`/api/artworks`)
- `GET /api/artworks` – Fetch all available artworks with multi-field search (`search`), category filter (`category`), price range (`minPrice`, `maxPrice`), sorting (`sort`), and pagination (`page`, `limit`).
- `GET /api/artworks/:id` – Fetch single artwork details by ID.
- `POST /api/artworks` – Create a new artwork in MongoDB (Artist/Admin).
- `PUT /api/artworks/:id` – Update existing artwork details (Owner Artist/Admin).
- `DELETE /api/artworks/:id` – Delete an artwork from MongoDB (Owner Artist/Admin).

### 💬 Comments API (`/api/comments`)
- `GET /api/comments/:artworkId` – Fetch all comments for a specific artwork.
- `POST /api/comments/:artworkId` – Add a new comment to an artwork.
- `DELETE /api/comments/:id` – Delete a comment (Comment author/Admin).

### 💳 Payments & Subscriptions API (`/api/payments`)
- `POST /api/payments/create-artwork-checkout` – Validate user subscription tier limits and generate Stripe checkout session.
- `POST /api/payments/confirm-purchase` – Confirm payment, set artwork status to `sold`, and record transaction in MongoDB.
- `POST /api/payments/subscribe` – Upgrade user subscription tier (Pro $9.99/mo, Premium $19.99/mo).

### 🛡️ Admin & Analytics API (`/api/admin`)
- `GET /api/admin/analytics` – Platform stats overview (total artworks, sold artworks, total users, total revenue).
- `GET /api/admin/users` – Fetch all registered users.
- `PATCH /api/admin/users/:id/role` – Update user role (`user`, `artist`, `admin`).

---

## 🛠️ Tech Stack & Packages Used
- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB Atlas with Mongoose 9.9.2 ORM
- **Environment**: `dotenv`
- **CORS**: `cors`
- **Payments**: `stripe`
- **Development**: `nodemon`

---

## 🚀 Getting Started Locally

1. **Clone Repository**:
   ```bash
   git clone https://github.com/emranhossen-dev/arthub-server.git
   cd arthub-server
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure `.env`**:
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   CLIENT_URL=http://localhost:3000
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   ```

4. **Run Server**:
   ```bash
   npm run dev
   ```
   The API server will listen on `http://localhost:5000`.
