import client from "../config/database.js";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { transporter, generateVerificationCode, sendVerificationEmail, sendPasswordResetEmail } from "../utils/helper.js";

const getDB = () => client.db("db_pms");

export const getUsers = async (req, res) => {
  try {
    const collection = getDB().collection("users");
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
    const collection = getDB().collection("users");
    const { id } = req.params;
    const {
      firstName,
      lastName,
      password,
      currentPassword, 
      newPassword,
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

    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: "Current password is incorrect" });
      }
      updateFields.password = await bcrypt.hash(newPassword, 10);
    }

    // Reset Password: 
    if (password && !currentPassword) {
      updateFields.password = await bcrypt.hash(password, 10);
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
    const collection = getDB().collection("users");
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
    // const mailOptions = {
    //   from: 'noreply@sandbox8cd4247ad64149e58f2a5a059bb1572c.mailgun.org',
    //   to: newEmail.toLowerCase(),
    //   subject: "Email Change - Verification Code",
    //   html: `
    //     <div class="code-box">
    //       <div class="code">${verificationCode}</div> 
    //     </div>
    //     <p><strong>This code will expire in 10 minutes.</strong></p>
    //   `,
    // };

    try {
      //await transporter.sendMail(mailOptions);
      await sendVerificationEmail(newEmail.toLowerCase(), verificationCode);

      res.json({
        success: true,
        message: `We've sent a verification code to ${newEmail.toLowerCase()}`,
      });
    } catch (err) {
      console.error("Failed to send email change verification:", err);

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
    const collection = getDB().collection("users");
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

    const confirmationMailOptions = {
      from: `My-Task <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: [user.email, newEmail.toLowerCase()],
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

// Set password for Google Auth users
export const requestSetPasswordForGoogleAuth = async (req, res) => {
  try {
    const collection = getDB().collection("users");
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if user is from Google auth
    if (user.authProvider !== 'google') {
      return res.status(400).json({
        success: false,
        error: "This endpoint is only for Google auth users",
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        code: verificationCode,
        purpose: 'set-password',
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save to database
    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          setPasswordCode: verificationCode,
          setPasswordToken: token,
          setPasswordExpires: new Date(Date.now() + 10 * 60 * 1000),
          updatedAt: new Date(),
        },
      }
    );

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationCode);

      res.json({
        success: true,
        message: 'Verification code has been sent to your email',
      });
    } catch (err) {
      console.error('Failed to send set password code:', err);

      await collection.updateOne(
        { _id: user._id },
        {
          $unset: {
            setPasswordCode: '',
            setPasswordToken: '',
            setPasswordExpires: '',
          },
        }
      );

      res.status(500).json({
        success: false,
        error: 'Failed to send verification email. Please try again.',
      });
    }
  } catch (err) {
    console.error('Request set password error:', err);
    res.status(500).json({
      success: false,
      error: 'An error occurred. Please try again later.',
    });
  }
};

// Verify set password code and update password
export const verifyAndSetPasswordForGoogleAuth = async (req, res) => {
  try {
    const collection = getDB().collection("users");
    const { userId, verificationCode, newPassword, confirmPassword } = req.body;

    if (!userId || !verificationCode || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Passwords do not match",
      });
    }

    const user = await collection.findOne({
      _id: new ObjectId(userId),
      setPasswordCode: verificationCode.trim(),
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification code",
      });
    }

    // Check if code is expired
    if (new Date() > new Date(user.setPasswordExpires)) {
      await collection.updateOne(
        { _id: user._id },
        {
          $unset: {
            setPasswordCode: '',
            setPasswordToken: '',
            setPasswordExpires: '',
          },
        }
      );

      return res.status(400).json({
        success: false,
        error: "Verification code has expired. Please request a new one.",
      });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await collection.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
        $unset: {
          setPasswordCode: '',
          setPasswordToken: '',
          setPasswordExpires: '',
        },
      },
      { returnDocument: 'after' }
    );

    const { password: _, ...userResponse } = result;

    res.json({
      success: true,
      message: 'Password set successfully',
      user: userResponse,
    });
  } catch (err) {
    console.error('Verify and set password error:', err);
    res.status(500).json({
      success: false,
      error: 'An error occurred. Please try again later.',
    });
  }
};

// Admin send password reset link
export const sendAdminResetPasswordLink = async (req, res) => {
  try {
    const collection = getDB().collection("users");
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        purpose: "password-reset",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save reset token to database
    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: resetToken,
          passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          updatedAt: new Date(),
        },
      }
    );

    // Build reset link (adjust CLIENT_URL based on your environment)
    const clientURL = process.env.CLIENT_URL;
    const resetLink = `${clientURL}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      user.email
    )}`;

    try {
      await sendPasswordResetEmail(user.email, resetLink);

      res.json({
        success: true,
        message: `Password reset link has been sent to ${user.email}`,
      });
    } catch (err) {
      console.error("Failed to send password reset email:", err);

      // Delete reset token if email sending failed
      await collection.updateOne(
        { _id: user._id },
        {
          $unset: {
            passwordResetToken: "",
            passwordResetExpires: "",
          },
        }
      );

      res.status(500).json({
        success: false,
        error: "Failed to send password reset email. Please try again.",
      });
    }
  } catch (err) {
    console.error("Send admin reset password error:", err);
    res.status(500).json({
      success: false,
      error: "An error occurred. Please try again later.",
    });
  }
};


