import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../validate/auth.schema";
import { prisma } from "../utils/prisma";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/helper";
const register = async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    const { name, email, password } = result.data;
    const exitingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (exitingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hasPassowrd = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hasPassowrd,
      },
    });
    const token = generateToken(user.id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res
      .status(201)
      .json({ message: "User registered successfully", user, token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.issues });
    }
    const { email, password } = result.data;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }
    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      return res.status(404).json({ message: "Invalid email or password" });
    }
    const token = generateToken(user.id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res
      .status(200)
      .json({ message: "User registered successfully", user, token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
const myProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    console.log(userId);
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return res.status(200).json({ message: "User profile", user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
export { register, login, myProfile, logout };
