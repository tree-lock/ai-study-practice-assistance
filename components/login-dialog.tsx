"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type SignInResponse, signIn } from "next-auth/react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { sendEmailOtp } from "@/app/actions/auth-email";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * next-auth 在 redirect:false 时：失败会把 res.url 置为 null 并带 error；成功时 res.url 为回调地址。
 * 不能仅用 !res.error（边界情况下易误判）。
 */
function isCredentialsSignInSuccess(res: SignInResponse | undefined): boolean {
  return Boolean(res?.url && !res.error);
}

type LoginDialogProps = {
  hasGoogleOAuth: boolean;
  /** 点击打开弹窗的触发器（如顶部「登录」按钮） */
  trigger?: React.ReactNode;
  /** /login 等场景：进入页面即打开 */
  defaultOpen?: boolean;
  /** 关闭时导航（如返回首页） */
  onCloseNavigate?: string;
};

export function LoginDialog({
  hasGoogleOAuth,
  trigger,
  defaultOpen = false,
  onCloseNavigate,
}: LoginDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next && onCloseNavigate) {
      router.push(onCloseNavigate);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        className="max-h-[min(90dvh,calc(100dvh-2rem))] max-w-[420px] gap-0 overflow-y-auto border-0 bg-card p-0 shadow-xl sm:max-w-[420px]"
        showCloseButton
      >
        <DialogTitle className="sr-only">登录</DialogTitle>
        <LoginDialogBody
          hasGoogleOAuth={hasGoogleOAuth}
          onSuccess={() => {
            setOpen(false);
            // 整页跳转，确保 Set-Cookie 生效并拉齐服务端 RSC 会话（避免仅关弹窗却未登录）
            window.location.assign("/");
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function LoginDialogBody({
  hasGoogleOAuth,
  onSuccess,
}: {
  hasGoogleOAuth: boolean;
  onSuccess: () => void;
}) {
  const baseId = useId();
  const [tab, setTab] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
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
      if (!isCredentialsSignInSuccess(res)) {
        setFormError("邮箱或密码不正确；若尚未设置密码请使用验证码登录");
        return;
      }
      onSuccess();
    } catch {
      toast.error("登录请求失败，请稍后重试");
      setFormError("网络异常，请稍后重试");
    } finally {
      setBusy(false);
    }
  }

  async function handleOtpSignIn(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setBusy(true);
    try {
      const res = await signIn("credentials", {
        email,
        code: code.trim(),
        redirect: false,
      });
      if (!isCredentialsSignInSuccess(res)) {
        setFormError("验证码错误或已过期，请重新获取");
        return;
      }
      onSuccess();
    } catch {
      toast.error("登录请求失败，请稍后重试");
      setFormError("网络异常，请稍后重试");
    } finally {
      setBusy(false);
    }
  }

  const tabListClass =
    "grid h-12 w-full grid-cols-2 gap-0 rounded-none border-0 bg-transparent p-0";

  const tabTriggerClass =
    "relative h-12 w-full rounded-none border-0 bg-transparent px-4 text-base font-medium text-muted-foreground shadow-none data-[state=active]:bg-transparent data-[state=active]:text-sky-600 data-[state=active]:shadow-none dark:data-[state=active]:text-sky-400";

  const activeBar =
    "after:absolute after:right-4 after:bottom-0 after:left-4 after:h-0.5 after:rounded-full after:bg-sky-500 data-[state=active]:after:opacity-100 after:opacity-0";

  const fieldShell =
    "rounded-xl border border-border bg-background overflow-hidden divide-y divide-border";

  return (
    <div className="flex flex-col px-6 pt-2 pb-6">
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as "password" | "otp");
          setFormError(null);
        }}
        className="w-full"
      >
        <TabsList variant="line" className={tabListClass}>
          <TabsTrigger
            type="button"
            value="password"
            className={cn(tabTriggerClass, activeBar)}
          >
            密码登录
          </TabsTrigger>
          <TabsTrigger
            type="button"
            value="otp"
            className={cn(tabTriggerClass, activeBar, "border-l border-border")}
          >
            验证码登录
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="mt-6 outline-none">
          <form onSubmit={handlePasswordSignIn} className="flex flex-col gap-4">
            <div className={fieldShell}>
              <div className="flex min-h-12 items-center gap-3 px-3 py-2 sm:px-4">
                <label
                  className="w-14 shrink-0 text-sm text-muted-foreground"
                  htmlFor={`${baseId}-acc-pw`}
                >
                  账号
                </label>
                <Input
                  id={`${baseId}-acc-pw`}
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="请输入邮箱"
                  className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                />
              </div>
              <div className="flex min-h-12 items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
                <label
                  className="w-14 shrink-0 text-sm text-muted-foreground"
                  htmlFor={`${baseId}-pw`}
                >
                  密码
                </label>
                <Input
                  id={`${baseId}-pw`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="请输入密码（未设置可改用验证码登录）"
                  className="h-10 min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 text-muted-foreground"
                  aria-label={showPassword ? "隐藏密码" : "显示密码"}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </Button>
                <button
                  type="button"
                  className="shrink-0 text-sm text-sky-600 hover:underline dark:text-sky-400"
                  onClick={() =>
                    toast.info("忘记密码", {
                      description:
                        "可使用验证码登录。若需设置或修改登录密码，请稍后在设置中操作（即将推出）。",
                    })
                  }
                >
                  忘记密码?
                </button>
              </div>
            </div>

            {formError ? (
              <p className="text-center text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 border-border bg-background"
                disabled={busy}
                onClick={() => setTab("otp")}
              >
                注册
              </Button>
              <Button
                type="submit"
                className="h-11 flex-1 bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
                disabled={busy}
              >
                登录
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="otp" className="mt-6 outline-none">
          <form onSubmit={handleOtpSignIn} className="flex flex-col gap-4">
            <div className={fieldShell}>
              <div className="flex min-h-12 flex-wrap items-stretch gap-0 sm:flex-nowrap">
                <div className="flex min-h-12 min-w-0 flex-1 items-center gap-3 px-3 py-2 sm:px-4">
                  <label className="sr-only" htmlFor={`${baseId}-email-otp`}>
                    邮箱
                  </label>
                  <Input
                    id={`${baseId}-email-otp`}
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    placeholder="请输入邮箱"
                    className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                  />
                </div>
                <div className="flex items-center border-t border-border sm:border-t-0 sm:border-l">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 rounded-none px-4 text-sm text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400"
                    disabled={sendingOtp || busy}
                    onClick={() => void handleSendOtp()}
                  >
                    获取验证码
                  </Button>
                </div>
              </div>
              <div className="flex min-h-12 items-center gap-3 px-3 py-2 sm:px-4">
                <label
                  className="w-14 shrink-0 text-sm text-muted-foreground"
                  htmlFor={`${baseId}-code`}
                >
                  验证码
                </label>
                <Input
                  id={`${baseId}-code`}
                  type="text"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  placeholder="请输入 6 位验证码"
                  minLength={6}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  value={code}
                  onChange={(ev) => setCode(ev.target.value)}
                />
              </div>
            </div>

            {formError ? (
              <p className="text-center text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}

            <Button
              type="submit"
              className="h-11 w-full bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500"
              disabled={busy}
            >
              登录/注册
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      {hasGoogleOAuth ? (
        <div className="mt-8 border-t border-border pt-6">
          <p className="mb-4 text-center text-sm text-muted-foreground">
            其他方式登录
          </p>
          <div className="flex justify-center">
            <button
              type="button"
              className="flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              disabled={busy}
              aria-label="使用 Google 登录"
              onClick={() => void signIn("google", { callbackUrl: "/" })}
            >
              <span
                className="flex size-12 items-center justify-center rounded-full border border-border bg-white text-lg font-semibold text-sky-600 shadow-sm dark:bg-card"
                aria-hidden
              >
                G
              </span>
              <span className="text-xs">Google 登录</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
