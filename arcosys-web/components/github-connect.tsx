"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { IconBrandGithub } from "@tabler/icons-react";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function GithubConnect() {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/repositories",
      });
    } catch (error) {
      console.error("Failed to connect GitHub:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      onClick={handleConnect}
      disabled={isLoading}
      className="gap-2 px-8 py-6 text-lg font-semibold transition-all hover:scale-105 active:scale-95"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <IconBrandGithub className="h-6 w-6" />
      )}
      Connect GitHub Account
    </Button>
  );
}
