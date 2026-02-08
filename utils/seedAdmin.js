import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import connectDB from "../config/dbConnect.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // CheckIfAdminExists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    // HashPassword
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // CreateAdminUser
    await User.create({
      fullName: "System Admin",
      email: "admin@nivaran.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("Admin created successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
