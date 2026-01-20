import client from "../config/database.js";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { transporter, generateVerificationCode } from "../utils/helper.js";

export const getUsers = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("users");
    const results = await collection
      .find({}, { projection: { password: 0 } })
      .toArray();
    // const processedResults = results.map((user) => ({
    //   ...user,
    //   role: user.roles,
    // }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user profile
export const updateUser = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("users");
    const { id } = req.params;
    const {
      firstName,
      lastName,
      password,
      phone,
      location
    } = req.body;

    const user = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    const updateFields = {
      updatedAt: new Date(),
    };

    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (phone !== undefined) updateFields.phone = phone;
    if (location !== undefined) updateFields.location = location;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userResponse } = result;

    res.json({ 
      success: true, 
      user: userResponse,
      message: "User updated successfully"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const requestEmailChange = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("users");
    const { userId, newEmail, currentPassword } = req.body;

    // Validation
    if (!userId || !newEmail || !currentPassword) {
      return res.status(400).json({
        success: false,
        error: "User ID, new email, and current password are required",
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Find user
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Kiểm tra current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    // Kiểm tra email mới đã tồn tại chưa
    const existingUser = await collection.findOne({
      email: newEmail.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "This email is already in use",
      });
    }

    // Kiểm tra email mới có giống email cũ không
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: "New email cannot be the same as current email",
      });
    }

    // Tạo verification code
    const verificationCode = generateVerificationCode();

    const token = jwt.sign(
      {
        id: user._id,
        newEmail: newEmail.toLowerCase(),
        code: verificationCode,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Lưu verification code vào database
    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          emailChangeCode: verificationCode,
          emailChangeToken: token,
          emailChangeExpires: new Date(Date.now() + 10 * 60 * 1000),
          pendingEmail: newEmail.toLowerCase(),
          updatedAt: new Date(),
        },
      }
    );

    // Gửi email verification code
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newEmail.toLowerCase(),
      subject: "Email Change - Verification Code",
      html: `
        <div class="code-box">
          <div class="code">${verificationCode}</div> 
        </div>
        <p><strong>This code will expire in 10 minutes.</strong></p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);

      res.json({
        success: true,
        message: `We've sent a verification code to ${newEmail.toLowerCase()}`,
      });
    } catch (err) {
      console.error("Failed to send email change verification:", err);

      // Xóa verification code nếu gửi email thất bại
      await collection.updateOne(
        { _id: user._id },
        {
          $unset: {
            emailChangeCode: "",
            emailChangeToken: "",
            emailChangeExpires: "",
            pendingEmail: "",
          },
        }
      );

      res.status(500).json({
        success: false,
        error: "Failed to send verification email. Please try again.",
      });
    }
  } catch (err) {
    console.error("Request email change error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred. Please try again later.",
    });
  }
};

//Verify Email Change
export const verifyEmailChange = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("users");
    const { userId, newEmail, verificationCode } = req.body;

    // Validation
    if (!userId || !newEmail || !verificationCode) {
      return res.status(400).json({
        success: false,
        error: "User ID, new email, and verification code are required",
      });
    }

    // Tìm user với verification code
    const user = await collection.findOne({
      _id: new ObjectId(userId),
      emailChangeCode: verificationCode.trim(),
      pendingEmail: newEmail.toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification code",
      });
    }

    // Kiểm tra code đã hết hạn chưa
    if (new Date() > new Date(user.emailChangeExpires)) {
      // Xóa code đã hết hạn
      await collection.updateOne(
        { _id: user._id },
        {
          $unset: {
            emailChangeCode: "",
            emailChangeToken: "",
            emailChangeExpires: "",
            pendingEmail: "",
          },
        }
      );

      return res.status(400).json({
        success: false,
        error: "Verification code has expired. Please request a new one.",
      });
    }

    // Kiểm tra email mới đã được dùng bởi user khác chưa (double check)
    const existingUser = await collection.findOne({
      email: newEmail.toLowerCase(),
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "This email is already in use",
      });
    }

    // Cập nhật email và xóa verification fields
    const result = await collection.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          email: newEmail.toLowerCase(),
          updatedAt: new Date(),
        },
        $unset: {
          emailChangeCode: "",
          emailChangeToken: "",
          emailChangeExpires: "",
          pendingEmail: "",
        },
      },
      { returnDocument: "after" }
    );

    // Gửi email thông báo email đã được thay đổi (gửi về cả 2 email)
    const confirmationMailOptions = {
      from: process.env.EMAIL_USER,
      to: [user.email, newEmail.toLowerCase()], // Gửi cho cả email cũ và mới
      subject: "Email Changed Successfully",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Email Changed Successfully</h2>
          <p>Hello ${user.firstName} ${user.lastName},</p>
          <p>Your email address has been successfully changed.</p>
          <p><strong>Old email:</strong> ${user.email}</p>
          <p><strong>New email:</strong> ${newEmail.toLowerCase()}</p>
          <p>If you didn't make this change, please contact support immediately.</p>
          <p>Best regards,<br>My-Task Management Team</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(confirmationMailOptions);
    } catch (err) {
      console.error("Failed to send confirmation email:", err);
    }

    const { password: _, ...userResponse } = result;

    res.json({
      success: true,
      message: "Email changed successfully",
      user: userResponse,
    });
  } catch (err) {
    console.error("Verify email change error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred. Please try again later.",
    });
  }
};


