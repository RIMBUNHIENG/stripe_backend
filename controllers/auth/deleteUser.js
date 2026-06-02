import User from "../../models/userModel.js";

export const deleteUser = async (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must contain uppercase, lowercase, number, special character and be at least 8 characters",
      });
    }
    if (!user_id) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const user = await User.findByPk(user_id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.destroy();

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
