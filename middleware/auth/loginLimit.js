import rateLimit from "express-rate-limit";

export const loginLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 8,

    message: {
        message: "Too many login!, Try again in 15 minutes.", 
    },

    standardHeaders: true,
    legacyHeaders: false,
});z