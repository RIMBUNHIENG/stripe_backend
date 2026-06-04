import  User  from "../../models/userModel.js";
import { generateAccessToken } from "../../utils/auth/access - refresh - token.js";

export const refreshToken = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if(!user){
        return res.status(404).json({
            message: "User not found.",
        })
    }

    const accessToken = generateAccessToken(user.user_id);

    return res.json({
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
        message: error.message,
    })
  }
};
