import client from "../config/database.js";
import bcrypt from "bcryptjs";

// Login
export const login = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("users");
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await collection.findOne({
      email
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    if (!user.active) {
      return res.status(403).json({ 
        success: false,
        message: "Your account has been deactivated" 
      });
    }

    await collection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLogin: new Date() 
        } 
      }
    );

    const { password: _, ...userResponse } = user;

    // if (user.status === "blocked") {
    //   return res.status(403).json({
    //     message: "Your account has been blocked. Please contact support.",
    //   });
    // }

    res.json({ 
      success: true,
      data: {
        user: userResponse,
      },
      message: "Login successful" 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Register
export const register = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("users");
    const { firstName, lastName, email, password, phone, location } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

   if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false,
        message: "Email, password, first name and last name are required" 
      });
    }

    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: phone || null,
      location: location || null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null
    };

    const result = await collection.insertOne(user);
    res.json({ _id: result.insertedId, firstName, lastName, email, phone, location});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Google Login
export const googleAuth = async (req, res, next) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("users");

    const { email, name, picture, family_name, given_name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Email and name are required from Google",
      });
    }

    // Find user by email
    let user = await collection.findOne({
      email: email.toLowerCase(),
    });

    // Nếu chưa có user, tạo mới
    if (!user) {     
      // Tạo random password (user login bằng Google không cần password)
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const newUser = {
        firstName: given_name || name.split(" ")[0],
        lastName: family_name || name.split(" ").slice(1).join(" "),
        email: email.toLowerCase(),
        password: hashedPassword,
        avatar: picture || null,
        phone: null,
        location: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
      };

      const result = await collection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      // User đã tồn tại, update last login và avatar
      await collection.updateOne(
        { _id: user._id },
        {
          $set: {
            lastLogin: new Date(),
            avatar: picture || user.avatar, 
          },
        }
      );
    }

    // Trả về user (không có password)
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      data: {
        user: {
          _id: userResponse._id,
          firstName: userResponse.firstName,
          lastName: userResponse.lastName,
          email: userResponse.email,
          avatar: userResponse.avatar,
          role: userResponse.role || "member",
          authProvider: "google",
          lastLogin: userResponse.lastLogin,
        },
      },
      message: "Google login successful",
    });
  } catch (error) {
    console.error("Google auth error:", error);
    next(error);
  }
};