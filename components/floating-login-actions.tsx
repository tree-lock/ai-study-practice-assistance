"use client";

import { LoginDialog } from "@/components/login-dialog";
import { Button } from "@/components/ui/button";

type FloatingLoginActionsProps = {
  hasGoogleOAuth: boolean;
};

export function FloatingLoginActions({
  hasGoogleOAuth,
}: FloatingLoginActionsProps) {
  return (
    <LoginDialog
      hasGoogleOAuth={hasGoogleOAuth}
      trigger={
        <Button type="button" className="shrink-0">
          登录
        </Button>
      }
    />
  );
}
