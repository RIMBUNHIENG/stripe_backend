import User from "../../../models/userModel.js";
import OTP from "../../../models/otpModel.js";
import { sendEmail } from "../../../utils/auth/sendEmail.js";
import { generateOTP } from "../../../utils/auth/auth.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000);

    await OTP.create({
      code: code,
      user_id: user.user_id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmail(email, code);

    res.json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
