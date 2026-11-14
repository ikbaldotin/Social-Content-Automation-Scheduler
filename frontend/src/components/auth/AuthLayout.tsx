import type { ReactNode } from "react";
import { Link } from "react-router";
import ThemeToggle from "../layout/ThemeToggle";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export default function AuthLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="text-2xl font-bold">
            Social<span className="text-primary">Scheduler</span>
          </Link>

          <h1 className="mt-8 text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
