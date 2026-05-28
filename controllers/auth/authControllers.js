import User from "../../models/User.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import { generateToken, cookieOptions, generateOTP } from "../../utils/auth/auth.js";
import UserType from "../../models/UserType.js";

// register
export const register = async (req, res) => {
  const { name, email, password, user_type } = req.body;

  if (!name || !email || !password || !user_type) {
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
    user_type_id: user_type,
  });

  const token = generateToken(newUser.id);

  res.cookie("token", token, cookieOptions);

  return res.status(201).json({
    user: newUser,
  });
};

// login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password || !email) {
      return res.status(400).json({
        message: "Please provide all fields",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({
        message: "Invalid user",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid",
      });
    }

      const token = generateToken(user.id);

      res.cookie("token", token, cookieOptions);

      res.json({
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
        },
      });
    
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// logout

export const logout = async (req, res) => {

    res.clearCookie('token', cookieOptions);
    res.json({message: 'Logged out successfully'})
    
}
