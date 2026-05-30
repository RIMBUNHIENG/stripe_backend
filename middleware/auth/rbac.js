import { UserType } from "../../models/userTypeModel";
import { User } from "../../models/userModel";

export const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.UserType.user_type_name;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};