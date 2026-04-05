import { LoginForm } from "@/app/login/login-form";

const hasGoogleOAuth =
  Boolean(process.env.AUTH_GOOGLE_ID) &&
  Boolean(process.env.AUTH_GOOGLE_SECRET);

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <LoginForm hasGoogleOAuth={hasGoogleOAuth} />
    </div>
  );
}
