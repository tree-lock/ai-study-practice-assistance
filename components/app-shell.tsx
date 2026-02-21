import { GearIcon } from "@radix-ui/react-icons";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { GhostButton } from "@/components/ghost-button";
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
      <Flex>
        {sidebarContent}

        <Box className="flex-1 relative">
          <Box className="w-full py-5 px-6">
            {floatingActions ? (
              <Box className="absolute top-5 right-5 z-10">
                <Flex align="center" gap="2">
                  <GhostButton layout="icon" aria-label="设置">
                    <GearIcon />
                  </GhostButton>
                  {floatingActions}
                </Flex>
              </Box>
            ) : null}

            {title || subtitle || headerActions ? (
              <Flex justify="between" align="start" gap="3" mb="5">
                <Box>
                  {title ? <Heading size="7">{title}</Heading> : null}
                  {subtitle ? (
                    <Text as="p" size="2" color="gray" mt="1">
                      {subtitle}
                    </Text>
                  ) : null}
                </Box>
                <Flex align="center" gap="2">
                  <GhostButton layout="icon" aria-label="设置">
                    <GearIcon />
                  </GhostButton>
                  {headerActions}
                </Flex>
              </Flex>
            ) : null}

            {children}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
