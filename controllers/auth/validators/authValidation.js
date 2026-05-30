export const validateEmail = (email) => {
    const emailRegex =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email)
};

export const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    return passwordRegex.test(password)
};

// export const validateUsername = (username) => {
//     return username.trim().length >= 3;
// }
