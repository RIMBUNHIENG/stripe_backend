import jwt from  'jsonwebtoken';
import User from '../../models/userModel.js';
import UserType from '../../models/userTypeModel.js';

export const protect = async (req, res, next ) => {
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({
                message: 'Not authorized, no token'
            })
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decode.user_id, {
            include: UserType,
        });

        if(!user){
            return res.status(401).json(
                {
                    message: 'Unauthorized, user not found'
                }
            )
        }
        req.user = user;
        next();

    } catch (error) {
        console.error(error);
        res.status(401).json({
            message: "Invalid Token"
        });
    }
}