import { NextFunction, Request, Response } from "express";

import { verifyToken } from "../utils/helper";

const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ message: "token is missing" });
    }
    const decoded = verifyToken(token);

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default isAuth;
