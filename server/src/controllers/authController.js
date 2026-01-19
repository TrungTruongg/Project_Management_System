import client from "../config/database.js";
import bcrypt from "bcryptjs";
import { transporter, generateVerificationCode } from "../utils/helper.js";
import jwt from "jsonwebtoken";

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
      email,
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          lastLogin: new Date(),
        },
      },
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
      message: "Login successful",
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
        message: "Email, password, first name and last name are required",
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
      lastLogin: null,
    };

    const result = await collection.insertOne(user);
    res.json({
      _id: result.insertedId,
      firstName,
      lastName,
      email,
      phone,
      location,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("users");
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const user = await collection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Email not found in our system",
      });
    }

    const verificationCode = generateVerificationCode();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        code: verificationCode,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetCode: verificationCode,
          passwordResetToken: token,
          passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 phút
          updatedAt: new Date(),
        },
      },
    );

    // Send the password reset email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);

      res.json({
        success: true,
        message: "Verification code has been sent to your email",
      });
    } catch (err) {
      console.error("Failed to send password reset email:", err);

      // Xóa verification code nếu gửi email thất bại
      await collection.updateOne(
        { _id: user._id },
        {
          $unset: {
            passwordResetCode: "",
            passwordResetToken: "",
            passwordResetExpires: "",
          },
        },
      );

      res.status(500).json({
        success: false,
        error: "Failed to send verification email. Please try again.",
      });
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred. Please try again later.",
    });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("users");
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({
        success: false,
        error: "Email and verification code are required",
      });
    }

    // Tìm user với email và code
    const user = await collection.findOne({
      email: email.toLowerCase(),
      passwordResetCode: verificationCode.trim(),
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification code",
      });
    }

    // Kiểm tra code đã hết hạn chưa
    if (new Date() > new Date(user.passwordResetExpires)) {
      // Xóa code đã hết hạn
      await collection.updateOne(
        { _id: user._id },
        {
          $unset: {
            passwordResetCode: "",
            passwordResetToken: "",
            passwordResetExpires: "",
          },
        },
      );

      return res.status(400).json({
        success: false,
        error: "Verification code has expired. Please request a new one.",
      });
    }

    // Tạo token mới để reset password
    const resetToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        purpose: "password-reset",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      success: true,
      message: "Verification successful",
      resetToken: resetToken,
      userId: user._id,
    });
  } catch (err) {
    console.error("Verify reset code error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred. Please try again later.",
    });
  }
};

// Bước 3: Reset password với token đã verify
export const resetPassword = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("users");
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Reset token and new password are required",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token",
      });
    }

    // Kiểm tra purpose của token
    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({
        success: false,
        error: "Invalid reset token",
      });
    }

    // Tìm user
    const user = await collection.findOne({ _id: decoded.id });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Hash password mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật password và xóa các trường reset
    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
        $unset: {
          passwordResetCode: "",
          passwordResetToken: "",
          passwordResetExpires: "",
        },
      },
    );

    // Gửi email thông báo password đã được thay đổi
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Confirmation",
      html: `
      <p>Your password has been successfully reset. If you did not initiate this request, please contact us immediately.</p>
    `,
    };
    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error("Failed to send confirmation email:", err);
    }

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred. Please try again later.",
    });
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
        },
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
