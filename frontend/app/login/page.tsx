"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { PageContainer } from "@/components/page-container";
import { FormLayout } from "@/components/form-layout";
import { LoadingButton } from "@/components/loading-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorBanner } from "@/components/error-banner";
import { apiFetch, ApiError } from "@/lib/api";
import { loginSchema, type LoginValues } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    try {
      await apiFetch("/api/login", { method: "POST", body: JSON.stringify(values) });
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  return (
    <PageContainer>
      <FormLayout title="Welcome back" description="Sign in with your email and OTP.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && <ErrorBanner message={serverError} />}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="otp">OTP</Label>
            <Input id="otp" inputMode="numeric" maxLength={6} placeholder="6-digit code" {...register("otp")} />
            {errors.otp && <p className="text-xs text-destructive">{errors.otp.message}</p>}
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <LoadingButton type="submit" loading={isSubmitting} className="w-full">
              Login
            </LoadingButton>
            <Button type="button" variant="outline" className="w-full" onClick={() => router.push("/signup")}>
              Create Account
            </Button>
          </div>
        </form>
      </FormLayout>
    </PageContainer>
  );
}
