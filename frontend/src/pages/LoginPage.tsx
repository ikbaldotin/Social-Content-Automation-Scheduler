import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import useAuthStore from "../stores/auth.store";
import { loginSchema, type LoginFormValues } from "../validate/auth.schema";
import AuthLayout from "../components/auth/AuthLayout";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      await login(data);
      toast.success("Login successful");
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Login failed. Check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to manage your social media content"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>

          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
          />

          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>

          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register("password")}
          />

          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-primary">
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}
