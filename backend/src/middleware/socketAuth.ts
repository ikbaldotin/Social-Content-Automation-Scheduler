import { Socket } from "socket.io";
import { parseCookie } from "cookie";
import { verifyToken } from "../utils/helper";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
}

const socketAuth = (
  socket: AuthenticatedSocket,
  next: (error?: Error) => void,
) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie ?? "";

    console.log("Socket cookie header exists:", !!cookieHeader);

    const cookies = parseCookie(cookieHeader);
    const token = cookies.token;

    console.log("Socket token exists:", !!token);

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = verifyToken(token);

    console.log("Decoded user ID:", decoded?.id);

    if (!decoded?.id) {
      return next(new Error("Invalid authentication token"));
    }

    socket.userId = decoded.id;

    console.log("Socket authenticated:", socket.userId);

    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Invalid or expired token"));
  }
};

export default socketAuth;
