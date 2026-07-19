"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { PageContainer } from "@/components/page-container";
import { FormLayout } from "@/components/form-layout";
import { Stepper } from "@/components/stepper";
import { LoadingButton } from "@/components/loading-button";
import { LoadingOverlay } from "@/components/loading-overlay";
import { SuccessCard } from "@/components/success-card";
import { ErrorBanner } from "@/components/error-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import { apiFetch, ApiError } from "@/lib/api";
import {
  smtpTestSchema,
  createAccountSchema,
  type SmtpTestValues,
  type CreateAccountValues,
} from "@/lib/validations";

const STEPS = ["SMTP Connection", "Create Account"];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [testState, setTestState] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testError, setTestError] = useState<string | null>(null);
  const [smtpData, setSmtpData] = useState<SmtpTestValues | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);

  const step1Form = useForm<SmtpTestValues>({ resolver: zodResolver(smtpTestSchema) });
  const step2Form = useForm<CreateAccountValues>({ resolver: zodResolver(createAccountSchema) });

  async function handleTestConnection(values: SmtpTestValues) {
    setTestState("testing");
    setTestError(null);
    try {
      await apiFetch("/api/smtp/test", { method: "POST", body: JSON.stringify(values) });
      setSmtpData(values);
      setTestState("success");
    } catch (err) {
      setTestState("error");
      setTestError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  function handleContinue() {
    if (!smtpData) return;
    step2Form.reset({ email: smtpData.company_email, otp: "" });
    setStep(1);
  }

  function startOver() {
    setStep(0);
    setSmtpData(null);
    setTestState("idle");
    setTestError(null);
    step1Form.reset();
  }

  async function onCreateAccount(values: CreateAccountValues) {
    if (!smtpData) return;
    if (values.email !== smtpData.company_email) {
      step2Form.setError("email", {
        message: "Please use the same email that was successfully verified.",
      });
      return;
    }

    setSignupError(null);
    try {
      await apiFetch("/api/signup", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          otp: values.otp,
          smtp_host: smtpData.smtp_host,
          smtp_port: smtpData.smtp_port,
          smtp_username: smtpData.smtp_username,
          smtp_password: smtpData.smtp_password,
        }),
      });
      toast.success("Account created!");
      router.push("/dashboard");
    } catch (err) {
      setSignupError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  return (
    <PageContainer>
      <div className="w-full max-w-md space-y-6">
        <Stepper steps={STEPS} current={step} />

        {step === 0 && (
          <FormLayout
            title="Connect your SMTP"
            description="We'll verify your credentials by sending a real test email."
          >
            <div className="relative">
              <LoadingOverlay show={testState === "testing"} label="Testing connection..." />

              {testState === "success" ? (
                <div className="space-y-5">
                  <SuccessCard
                    title="SMTP Connection Successful"
                    description={`A confirmation email was sent to ${smtpData?.company_email}.`}
                  />
                  <Button className="w-full" onClick={handleContinue}>
                    Continue
                  </Button>
                </div>
              ) : (
                <form onSubmit={step1Form.handleSubmit(handleTestConnection)} className="space-y-4">
                  {testState === "error" && testError && <ErrorBanner message={testError} />}

                  <div className="space-y-1.5">
                    <Label htmlFor="company_email">Company Email</Label>
                    <Input
                      id="company_email"
                      type="email"
                      placeholder="you@company.com"
                      {...step1Form.register("company_email")}
                    />
                    {step1Form.formState.errors.company_email && (
                      <p className="text-xs text-destructive">
                        {step1Form.formState.errors.company_email.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1.5">
                      <Label htmlFor="smtp_host">SMTP Host</Label>
                      <Input id="smtp_host" placeholder="smtp.gmail.com" {...step1Form.register("smtp_host")} />
                      {step1Form.formState.errors.smtp_host && (
                        <p className="text-xs text-destructive">
                          {step1Form.formState.errors.smtp_host.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="smtp_port">Port</Label>
                      <Input id="smtp_port" inputMode="numeric" placeholder="587" {...step1Form.register("smtp_port")} />
                      {step1Form.formState.errors.smtp_port && (
                        <p className="text-xs text-destructive">
                          {step1Form.formState.errors.smtp_port.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="smtp_username">SMTP Username</Label>
                    <Input id="smtp_username" {...step1Form.register("smtp_username")} />
                    {step1Form.formState.errors.smtp_username && (
                      <p className="text-xs text-destructive">
                        {step1Form.formState.errors.smtp_username.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="smtp_password">SMTP Password</Label>
                    <PasswordInput id="smtp_password" {...step1Form.register("smtp_password")} />
                    {step1Form.formState.errors.smtp_password && (
                      <p className="text-xs text-destructive">
                        {step1Form.formState.errors.smtp_password.message}
                      </p>
                    )}
                  </div>

                  <LoadingButton type="submit" loading={testState === "testing"} className="w-full">
                    Test Connection
                  </LoadingButton>
                </form>
              )}
            </div>
          </FormLayout>
        )}

        {step === 1 && (
          <FormLayout
            title="Create your account"
            description="Confirm your email and enter the OTP we sent you."
          >
            <form onSubmit={step2Form.handleSubmit(onCreateAccount)} className="space-y-4">
              {signupError && <ErrorBanner message={signupError} />}

              <div className="space-y-1.5">
                <Label htmlFor="signup_email">Email</Label>
                <Input id="signup_email" type="email" {...step2Form.register("email")} />
                {step2Form.formState.errors.email && (
                  <p className="text-xs text-destructive">{step2Form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup_otp">OTP</Label>
                <Input
                  id="signup_otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  {...step2Form.register("otp")}
                />
                {step2Form.formState.errors.otp && (
                  <p className="text-xs text-destructive">{step2Form.formState.errors.otp.message}</p>
                )}
              </div>

              <LoadingButton type="submit" loading={step2Form.formState.isSubmitting} className="w-full">
                Create Account
              </LoadingButton>
              <Button type="button" variant="ghost" className="w-full" onClick={startOver}>
                Start over
              </Button>
            </form>
          </FormLayout>
        )}
      </div>
    </PageContainer>
  );
}
