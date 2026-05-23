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

    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME;

    if (!adminPassword || !adminEmail || !adminName) {
      console.error(
        "Missing ADMIN_EMAIL, ADMIN_NAME or " +
        "ADMIN_PASSWORD in .env file"
      );
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(
      adminPassword, 10
    );

    // CreateAdminUser
    await User.create({
      fullName: adminName,
      email: adminEmail,
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
