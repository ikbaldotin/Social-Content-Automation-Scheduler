import { useEffect } from "react";
import useAuthStore from "../../stores/auth.store";

export default function AuthInitializer() {
  const getMe = useAuthStore((state) => state.getMe);
  useEffect(() => {
    void getMe();
  }, [getMe]);
  return null;
}
