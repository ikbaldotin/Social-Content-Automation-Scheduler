import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SEC = process.env.JWT_SEC;
if (!JWT_SEC)
    throw new Error("JWT_SEC is not set");
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SEC, {
        expiresIn: "7d",
    });
};
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SEC);
};
export { generateToken, verifyToken };
