import User from "../../models/userModel.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import {
  generateToken,
  cookieOptions,
  generateOTP,
} from "../../utils/auth/auth.js";
import UserType from "../../models/userTypeModel.js";
import OTP from "../../models/otpModel.js";
import { sendEmail, transporter } from "../../utils/auth/sendEmail.js";
import {
  validateEmail,
  validatePassword,
} from "./validators/authValidation.js";

// register
export const register = async (req, res) => {
  const { email, password, user_type } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message:
        "Password must contain uppercase, lowercase, number, special character and be at least 8 characters",
    });
  }

  if (!email || !password || !user_type) {
    return res.status(400).json({
      message: "Please enter all required fields",
    });
  }
  const userExist = await User.findOne({ where: { email } });

  if (userExist) {
    return res.status(400).json({ message: "User already exist" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    password: hashedPassword,
    user_type_id: user_type,
  });

  const token = generateToken(newUser.user_id);

  res.cookie("token", token, cookieOptions);

  return res.status(201).json({
    message: "Register succesfully",
  });
};

// login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password || !email) {
      return res.status(400).json({
        message: "Please provide all fields.",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({
        message: "Invalid user.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password.",
      });
    }

    //   const token = generateToken(user.id);

    //   res.cookie("token", token, cookieOptions);

    //   res.json({
    //     user: {
    //       id: user.id,
    //       name: user.username,
    //       email: user.email,
    //     },
    //   });

    const otp = generateOTP();

    await OTP.create({
      code: otp,
      user_id: user.user_id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
    });

    res.json({
      message: "OTP sent success",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// logout

export const logout = async (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out successfully" });
};

//who User profile

export const profile = async (req, res) => {
  try {
    res.json({
      id: req.user.user_id || req.user.id,
      email: req.user.email,
      status: req.user.status,
      role: req.user.UserType.user_type_name,
    });
  } catch (err) {
    res.status(500).json({
      message: "User not found",
    });
  }
};
