import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import useAuthStore from "../stores/auth.store";
import {
  registerSchema,
  type RegisterFormValues,
} from "../validate/auth.schema";
import AuthLayout from "../components/auth/AuthLayout";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      await registerUser(data);
      toast.success("Account created successfully");
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      description="Start managing your social media publishing"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full name
          </label>

          <Input id="name" placeholder="Your name" {...register("name")} />

          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

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
            placeholder="At least 8 characters"
            {...register("password")}
          />

          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
