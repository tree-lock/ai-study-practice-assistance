import { GearIcon } from "@radix-ui/react-icons";
import { Box, Flex, Heading, IconButton, Text } from "@radix-ui/themes";
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
          <Box className="w-full">
            {floatingActions ? (
              <Box className="absolute top-5 right-5 z-10">
                <Flex align="center" gap="2">
                  <IconButton variant="ghost" color="gray" aria-label="设置">
                    <GearIcon />
                  </IconButton>
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
                  <div className="p-px">
                    <IconButton variant="ghost" color="gray" aria-label="设置">
                      <GearIcon />
                    </IconButton>
                  </div>
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
