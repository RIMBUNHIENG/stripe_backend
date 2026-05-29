import User from "../../models/User.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import { generateToken, cookieOptions, generateOTP } from "../../utils/auth/auth.js";

// register
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
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
    username: name,
    email,
    password: hashedPassword,
  });

  const token = generateToken(newUser.id);

  res.cookie("token", token, cookieOptions);

  return res.status(201).json({
    user: newUser,
  });
};