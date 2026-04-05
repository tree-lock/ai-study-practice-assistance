"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { sendEmailOtp } from "@/app/actions/auth-email";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/login-email";

type LoginFormProps = {
  hasGoogleOAuth: boolean;
};

export function LoginForm({ hasGoogleOAuth }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [passwordForOtp, setPasswordForOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSendOtp() {
    setFormError(null);
    setSendingOtp(true);
    try {
      const result = await sendEmailOtp(email);
      if (result.ok) {
        toast.success("验证码已发送，请查收邮箱");
      } else {
        toast.error(result.message);
      }
    } finally {
      setSendingOtp(false);
    }
  }

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setBusy(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.ok) {
        router.push("/");
        router.refresh();
        return;
      }
      if (res?.code === "need_password") {
        setFormError("首次注册请使用「验证码登录」并完成注册");
        return;
      }
      setFormError("邮箱或密码不正确");
    } finally {
      setBusy(false);
    }
  }

  async function handleOtpSignIn(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setBusy(true);
    try {
      const payload: Record<string, string> = { email, code };
      if (passwordForOtp.length >= MIN_PASSWORD_LENGTH) {
        payload.password = passwordForOtp;
      }
      const res = await signIn("credentials", {
        ...payload,
        redirect: false,
      });
      if (res?.ok) {
        router.push("/");
        router.refresh();
        return;
      }
      if (res?.code === "need_password") {
        setFormError(`首次注册请填写至少 ${MIN_PASSWORD_LENGTH} 位密码`);
        return;
      }
      setFormError("验证码错误或已过期，请重新获取");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">登录</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Tabs defaultValue="otp" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger type="button" value="otp">
              验证码
            </TabsTrigger>
            <TabsTrigger type="button" value="password">
              密码
            </TabsTrigger>
          </TabsList>

          <TabsContent value="otp" className="flex flex-col gap-4 pt-4">
            <form className="flex flex-col gap-4" onSubmit={handleOtpSignIn}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="login-email">
                  邮箱
                </label>
                <Input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-end gap-2">
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <label className="text-sm font-medium" htmlFor="login-code">
                      验证码
                    </label>
                    <Input
                      id="login-code"
                      type="text"
                      name="code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="6 位数字"
                      maxLength={6}
                      value={code}
                      onChange={(ev) => setCode(ev.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    disabled={sendingOtp || busy}
                    onClick={() => void handleSendOtp()}
                  >
                    发送验证码
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium"
                  htmlFor="login-password-otp"
                >
                  密码（首次注册必填）
                </label>
                <Input
                  id="login-password-otp"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={passwordForOtp}
                  onChange={(ev) => setPasswordForOtp(ev.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  已注册用户可留空，仅用验证码登录；新用户需设置至少{" "}
                  {MIN_PASSWORD_LENGTH} 位密码。
                </p>
              </div>
              {formError ? (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              ) : null}
              <Button type="submit" disabled={busy}>
                登录 / 注册
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="password" className="flex flex-col gap-4 pt-4">
            <form
              className="flex flex-col gap-4"
              onSubmit={handlePasswordSignIn}
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="login-email-pw">
                  邮箱
                </label>
                <Input
                  id="login-email-pw"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="login-password">
                  密码
                </label>
                <Input
                  id="login-password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                />
              </div>
              {formError ? (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              ) : null}
              <Button type="submit" disabled={busy}>
                登录
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {hasGoogleOAuth ? (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <p className="text-center text-xs text-muted-foreground">或</p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={busy}
              onClick={() => void signIn("google", { callbackUrl: "/" })}
            >
              使用 Google 登录
            </Button>
          </div>
        ) : null}

        <Button type="button" variant="ghost" className="w-full" asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
