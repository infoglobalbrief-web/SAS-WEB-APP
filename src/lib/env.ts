import "server-only";

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",
  authSecret:
    process.env.AUTH_SECRET ?? "dev-only-secret-change-me-in-production",
  fakeOtp: (process.env.FAKE_OTP ?? "1") === "1",
  otpTtlMinutes: Number(process.env.OTP_TTL_MINUTES ?? 5),
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS ?? 5),
  otpResendCooldownSeconds: Number(
    process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 30,
  ),
  otpMaxResendsPerHour: Number(process.env.OTP_MAX_RESENDS_PER_HOUR ?? 5),
  billingProvider: process.env.BILLING_PROVIDER ?? "none",
  appName: process.env.APP_NAME ?? "SAS Web App",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
};

export function isFakeOtp() {
  return env.fakeOtp;
}
