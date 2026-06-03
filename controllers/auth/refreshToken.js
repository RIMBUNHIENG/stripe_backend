import { User } from "../../models/userModel.js";
import { generateAccessToken } from "../../utils/auth/access - refresh - token.js";

export const refreshToken = async (req, res) => {
    const user = await User.findByPk(req.userId);

    const accessToken = generateAccessToken(user.user_id);

    return res.json({
        accessToken,
    })
}