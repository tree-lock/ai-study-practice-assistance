import { Settings } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import { Sidebar } from "@/components/sidebar";

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
    <Box className="min-h-screen bg-[#f3f3f5]">
      <Box display="flex">
        {sidebarContent}

        <Box className="flex-1 relative">
          <Box className="w-full">
            {floatingActions ? (
              <Box className="absolute top-5 right-5 z-10">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <IconButton color="inherit" aria-label="设置" size="small">
                    <Settings />
                  </IconButton>
                  {floatingActions}
                </Box>
              </Box>
            ) : null}

            {title || subtitle || headerActions ? (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="start"
                gap={2}
                mb={2.5}
              >
                <Box>
                  {title ? <Typography variant="h3">{title}</Typography> : null}
                  {subtitle ? (
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      {subtitle}
                    </Typography>
                  ) : null}
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <div className="p-px">
                    <IconButton color="inherit" aria-label="设置" size="small">
                      <Settings />
                    </IconButton>
                  </div>
                  {headerActions}
                </Box>
              </Box>
            ) : null}

            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
