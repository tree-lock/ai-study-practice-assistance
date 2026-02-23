import { Suspense } from "react";
import { getTopics } from "@/app/actions/topic";
import { signIn, signOut } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { Sidebar } from "@/components/sidebar";
import { SidebarSkeleton } from "@/components/sidebar/skeleton";
import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";

const hasGoogleAuthConfig =
  Boolean(process.env.AUTH_GOOGLE_ID) &&
  Boolean(process.env.AUTH_GOOGLE_SECRET);

async function SidebarContent() {
  const userId = await getCurrentUserId();
  const topics = await getTopics();
  const userLabel = userId ? `用户 ${userId.slice(0, 8)}` : "未登录";

  return <Sidebar topics={topics} userLabel={userLabel} />;
}

async function FloatingActions() {
  const userId = await getCurrentUserId();
  const isLoggedIn = Boolean(userId);

  async function loginWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: "/" });
  }

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return isLoggedIn ? (
    <form action={logout}>
      <Button type="submit" variant="default" className="justify-start">
        退出登录
      </Button>
    </form>
  ) : hasGoogleAuthConfig ? (
    <form action={loginWithGoogle}>
      <Button type="submit">登录</Button>
    </form>
  ) : (
    <Button type="button" disabled>
      Google 登录未配置
    </Button>
  );
}

type AppLayoutProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  floatingActions?: React.ReactNode;
};

export default function AppLayout({
  children,
  title,
  subtitle,
  headerActions,
  floatingActions,
}: AppLayoutProps) {
  return (
    <AppShell
      title={title}
      subtitle={subtitle}
      headerActions={headerActions}
      floatingActions={
        floatingActions ?? (
          <Suspense fallback={<Button disabled>加载中...</Button>}>
            <FloatingActions />
          </Suspense>
        )
      }
      sidebar={
        <Suspense fallback={<SidebarSkeleton />}>
          <SidebarContent />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
