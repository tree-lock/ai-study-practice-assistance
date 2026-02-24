import { Settings } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

type Topic = {
  id: string;
  name: string;
  description: string | null;
};

type AppShellProps = {
  title?: string;
  subtitle?: string;
  /** @deprecated Use sidebar prop with SidebarWrapper for Suspense support */
  userLabel?: string;
  /** @deprecated Use sidebar prop with SidebarWrapper for Suspense support */
  topics?: Array<Topic>;
  /** Sidebar component with Suspense boundary. Pass <SidebarWrapper /> here for async loading. */
  sidebar?: React.ReactNode;
  headerActions?: React.ReactNode;
  floatingActions?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({
  title,
  subtitle,
  userLabel,
  topics = [],
  sidebar,
  headerActions,
  floatingActions,
  children,
}: AppShellProps) {
  const sidebarContent = sidebar ?? (
    <Sidebar topics={topics} userLabel={userLabel} />
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {sidebarContent}

        <div className="relative flex-1">
          <div className="w-full">
            {floatingActions ? (
              <div className="absolute right-5 top-5 z-10">
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="设置"
                  >
                    <Settings />
                  </Button>
                  {floatingActions}
                </div>
              </div>
            ) : null}

            {title || subtitle || headerActions ? (
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  {title ? (
                    <h1 className="text-2xl font-semibold tracking-tight">
                      {title}
                    </h1>
                  ) : null}
                  {subtitle ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="设置"
                  >
                    <Settings />
                  </Button>
                  {headerActions}
                </div>
              </div>
            ) : null}

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
