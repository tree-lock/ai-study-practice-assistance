import { Button, CircularProgress } from "@mui/material";
import { Suspense } from "react";
import { getTopics } from "@/app/actions/topic";
import { AppShell } from "@/components/app-shell";
import { Sidebar } from "@/components/sidebar";
import { SidebarSkeleton } from "@/components/sidebar/skeleton";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";
import { loginWithGoogle, logout } from "./auth-actions";

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

  return isLoggedIn ? (
    <form action={logout}>
      <Button type="submit" color="inherit" sx={{ textTransform: "none" }}>
        退出登录
      </Button>
    </form>
  ) : hasGoogleAuthConfig ? (
    <form action={loginWithGoogle}>
      <Button type="submit" variant="contained">
        登录
      </Button>
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
          <Suspense
            fallback={
              <Button disabled>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                加载中...
              </Button>
            }
          >
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
