//module is added in type so that we can directly use import function for importing libraries

import express from "express";
import dotenv from "dotenv"; //A library to load environment variables from a .env file into process.env
import cookieParser from "cookie-parser"; //A library for parsing cookies in HTTP requests

//routes
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
//console.log(process.env.PORT);

// dev is used for development when server will be starting again and again on introducing some changes while start is used in production when server will not start again

app.use(express.json({limit:"10mb"}));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

app.listen(PORT, () => {
  // listen is used to start the server
  console.log("Server is running on http://localhost:" + PORT);

  connectDB();
  console.log("Database connected successfully");
});

// Add error handling for server startup
app.on('error', (err) => {
  console.error('Server error:', err);
});
