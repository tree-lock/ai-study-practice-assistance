import { Suspense } from "react";
import { listTasks } from "@/app/actions/task";
import { signOut } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { FloatingLoginActions } from "@/components/floating-login-actions";
import { Sidebar } from "@/components/sidebar";
import { SidebarFallback } from "@/components/sidebar/fallback";
import { TaskListFallback } from "@/components/sidebar/task-list-fallback";
import { TaskListWithContext } from "@/components/sidebar/task-list-with-context";
import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";

const hasGoogleAuthConfig =
  Boolean(process.env.AUTH_GOOGLE_ID) &&
  Boolean(process.env.AUTH_GOOGLE_SECRET);

async function AsyncTaskList() {
  const tasks = await listTasks();
  return <TaskListWithContext tasks={tasks} />;
}

async function SidebarContent() {
  return (
    <Sidebar
      taskListSlot={
        <Suspense fallback={<TaskListFallback />}>
          <AsyncTaskList />
        </Suspense>
      }
    />
  );
}

async function FloatingActions() {
  const userId = await getCurrentUserId();
  const isLoggedIn = Boolean(userId);

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return isLoggedIn ? (
    <form action={logout} className="shrink-0">
      <Button type="submit" variant="default">
        退出登录
      </Button>
    </form>
  ) : (
    <FloatingLoginActions hasGoogleOAuth={hasGoogleAuthConfig} />
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
              <Button type="button" disabled className="shrink-0">
                加载中...
              </Button>
            }
          >
            <FloatingActions />
          </Suspense>
        )
      }
      sidebar={
        <Suspense fallback={<SidebarFallback />}>
          <SidebarContent />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
