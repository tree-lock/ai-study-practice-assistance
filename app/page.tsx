import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { getTopics } from "@/app/actions/topic";
import { signIn, signOut } from "@/auth";
import { AgentCommandCenter } from "@/components/agent-command-center";
import { AppShell } from "@/components/app-shell";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";

const hasGoogleAuthConfig =
  Boolean(process.env.AUTH_GOOGLE_ID) &&
  Boolean(process.env.AUTH_GOOGLE_SECRET);

export default async function Home() {
  async function loginWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: "/" });
  }

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const userId = await getCurrentUserId();
  const isLoggedIn = Boolean(userId);
  const topics = await getTopics();

  return (
    <AppShell
      topics={topics}
      userLabel={isLoggedIn ? `用户 ${userId?.slice(0, 8)}` : "未登录"}
      floatingActions={
        isLoggedIn ? (
          <form action={logout}>
            <Button type="submit" variant="soft" color="gray">
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
        )
      }
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap="6"
        className="min-h-[calc(100vh-170px)] px-4"
      >
        <Heading size="9" align="center" className="home-hero-title">
          把题目变成可执行的
          <Text color="blue"> 学习计划 </Text>
        </Heading>
        <Text
          size="4"
          color="gray"
          align="center"
          className="home-hero-subtitle"
        >
          上传题目，文字、图片或文档，系统会自动生成目录、编排与复习任务。
        </Text>
        <AgentCommandCenter />
      </Flex>
    </AppShell>
  );
}
