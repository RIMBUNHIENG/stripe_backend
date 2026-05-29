import { generateToken, cookieOptions } from "../../utils/auth/auth.js";
import OTP from "../../models/otpModel.js";
import User from "../../models/userModel.js";

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  // finduser 

  const user = await User.findOne({
    where: { email },
  });

  // check user
  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  // find otp
  const validOTP = await OTP.findOne({
    where: {
      code: otp,
      UserId: user.id,
    },
  });

  if (!validOTP) {
    return res.status(400).json({
      message: "Invalid OTP",
    });
  }

  // expired date
  if (validOTP.expiresAt < new Date()) {
    return res.status(400).json({
      message: "OTP expired",
    });
  }

  // delete OTP after success

  await validOTP.destroy();

  // create token
  const token = generateToken(user.id);

  //   store cookie
  res.cookie("token", token, cookieOptions);

  res.json({
    message: "login success",
    user: {
      id: user.id,
      name: user.username,
      email: user.email,
    },
  });
};
