import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../backend/models/user.model.js";
import Product from "../backend/models/product.model.js";
import Coupon from "../backend/models/coupon.model.js";
import { connectDB } from "../backend/lib/db.js";

import sampleProducts from "./sample-products.json" assert { type: "json" };
import sampleUsers from "./sample-users.json" assert { type: "json" };

dotenv.config();

// Connect to the database
connectDB();

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});

    console.log("Database cleared");

    // Create users with hashed passwords
    const createdUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        return User.create({
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role
        });
      })
    );

    console.log(`${createdUsers.length} users created`);

    // Create sample products
    const adminUser = createdUsers[0];
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`${createdProducts.length} products created`);

    // Create a sample coupon for the first customer
    const customerUser = createdUsers.find(user => user.role === "customer");
    
    if (customerUser) {
      const newCoupon = new Coupon({
        code: "WELCOME10",
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        userId: customerUser._id
      });
      
      await newCoupon.save();
      console.log("Sample coupon created");
    }

    console.log("Database seeded successfully!");
    process.exit();
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
