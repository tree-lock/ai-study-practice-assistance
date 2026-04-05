import { Settings } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  title?: string;
  subtitle?: string;
  /** @deprecated Use sidebar prop with Suspense-wrapped sidebar content */
  userLabel?: string;
  /** Sidebar component with Suspense boundary. */
  sidebar?: React.ReactNode;
  headerActions?: React.ReactNode;
  floatingActions?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({
  title,
  subtitle,
  userLabel,
  sidebar,
  headerActions,
  floatingActions,
  children,
}: AppShellProps) {
  const sidebarContent = sidebar ?? <Sidebar userLabel={userLabel} />;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {sidebarContent}

        <div className="relative flex-1">
          <div
            className="absolute top-0 bottom-0 left-0 z-0 w-px shrink-0 bg-gradient-to-b from-transparent via-border to-transparent"
            aria-hidden
          />
          <div className="relative z-10 w-full">
            {floatingActions ? (
              <div className="absolute top-5 right-5 z-10">
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
