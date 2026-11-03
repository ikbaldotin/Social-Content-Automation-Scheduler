import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SEC = process.env.JWT_SEC;
if (!JWT_SEC) throw new Error("JWT_SEC is not set");
const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_SEC, {
    expiresIn: "7d",
  });
};

const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SEC) as JwtPayload;
};

export { generateToken, verifyToken };
