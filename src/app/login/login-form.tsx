"use client";

import { useActionState, useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/auth/otp-input";
import {
  requestEmailOtp,
  verifyEmailOtp,
  type OtpState,
} from "@/app/(auth)/actions";

const initialRequest: OtpState = { status: "idle" };
const initialVerify: OtpState = { status: "idle" };

export function LoginForm() {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [requestState, requestAction, requestPending] = useActionState(
    requestEmailOtp,
    initialRequest,
  );
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (requestState.status === "sent") {
      setEmail(requestState.target ?? email);
      setStep("verify");
      setResendIn(requestState.resendIn ?? 30);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestState]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  if (step === "verify") {
    return (
      <VerifyStage
        email={email}
        code={code}
        setCode={setCode}
        resendIn={resendIn}
        onResend={async () => {
          const fd = new FormData();
          fd.set("email", email);
          await requestAction(fd);
        }}
      />
    );
  }

  return (
    <form action={requestAction} className="flex flex-col gap-4">
      {requestState.message && requestState.status === "error" && (
        <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700">
          {requestState.message}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="pl-9"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" disabled={requestPending}>
        {requestPending ? "Sending…" : "Send code"}
      </Button>
    </form>
  );
}

function VerifyStage({
  email,
  code,
  setCode,
  resendIn,
  onResend,
}: {
  email: string;
  code: string;
  setCode: (v: string) => void;
  resendIn: number;
  onResend: () => void;
}) {
  const [state, action, pending] = useActionState(verifyEmailOtp, initialVerify);
  const masked = email
    ? email.replace(/^(.)[^@]*(@.*)$/, (_m, a: string, b: string) =>
        a + "*".repeat(4) + b,
      )
    : "";

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.message && state.status === "error" && (
        <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}
      <div className="flex flex-col items-center gap-2">
        <p className="text-center text-sm text-muted-foreground">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-foreground">{masked}</span>
        </p>
        <input type="hidden" name="target" value={email} />
        <OtpInput value={code} onChange={setCode} />
        <input type="hidden" name="code" value={code} />
      </div>
      <Button type="submit" disabled={pending || code.length < 6}>
        {pending ? "Verifying…" : "Verify"}
      </Button>
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onResend}
          disabled={resendIn > 0}
          className="font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
        </button>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => window.location.reload()}
        >
          Change email
        </button>
      </div>
    </form>
  );
}
