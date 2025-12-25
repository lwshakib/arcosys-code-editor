"use client";

import { authClient } from "@/lib/auth-client";
import { useListAccounts } from "@/lib/auth-hooks";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconCheck,
  IconCirclePlus,
  IconLoader2,
  IconShieldCheck,
  IconUser,
  IconMail,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const { data: accounts, isPending: isAccountsPending } = useListAccounts();

  if (isSessionPending || isAccountsPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <IconLoader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const { user } = session;
  const githubAccount = accounts?.find((a) => a.providerId === "github");
  const googleAccount = accounts?.find((a) => a.providerId === "google");

  const handleConnect = async (provider: "github" | "google") => {
    await authClient.signIn.social({
      provider,
      callbackURL: window.location.href,
    });
  };

  return (
    <div className="flex flex-1 flex-col p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
          <p className="mt-2 text-lg text-muted-foreground italic">
            Manage your account preferences and connected services.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Profile Section */}
          <section className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-card/50 p-8 shadow-2xl backdrop-blur-md transition-all hover:bg-card/60">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-[80px]" />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
              <Avatar className="h-32 w-32 rounded-[2rem] border-4 border-white/5 shadow-2xl grayscale hover:grayscale-0 transition-all duration-500">
                <AvatarImage src={user.image || ""} alt={user.name} />
                <AvatarFallback className="text-4xl rounded-[2rem]">
                  {user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3 text-center md:text-left">
                <h2 className="text-3xl font-bold tracking-tight">
                  {user.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground md:justify-start">
                  <span className="flex items-center gap-1.5 font-medium">
                    <IconMail className="size-4 text-primary" />
                    {user.email}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-wider h-6 text-xs"
                  >
                    Free Plan
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                className="h-12 rounded-2xl font-bold px-8"
              >
                Edit Profile
              </Button>
            </div>
          </section>

          {/* Connected Accounts Section */}
          <section className="rounded-[2.5rem] border border-white/5 bg-muted/40 p-8 md:p-12 shadow-inner">
            <div className="mb-10 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-primary to-primary/50 shadow-lg shadow-primary/20">
                <IconShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Link Your Accounts
                </h2>
                <p className="text-sm text-muted-foreground">
                  Keep your access secure and connected.
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              {/* GitHub Connection */}
              <div className="group relative flex flex-col gap-6 rounded-3xl border border-white/5 bg-[#0d1117]/50 p-6 transition-all hover:bg-[#0d1117]/80 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl p-3 shadow-lg transition-transform group-hover:scale-110 ${
                      githubAccount
                        ? "bg-green-500/10 text-green-500"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    <IconBrandGithub className="h-full w-full" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">GitHub</h3>
                    <p className="text-sm text-muted-foreground">
                      {githubAccount
                        ? "Successfully connected to GitHub"
                        : "Securely connect your GitHub account"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => !githubAccount && handleConnect("github")}
                  disabled={!!githubAccount}
                  variant={githubAccount ? "secondary" : "default"}
                  className={`h-12 rounded-2xl px-6 font-bold flex items-center gap-2 ${
                    githubAccount
                      ? "border-green-500/20 bg-green-500/10 text-green-500 cursor-default"
                      : "shadow-lg shadow-primary/20"
                  }`}
                >
                  {githubAccount ? (
                    <>
                      <IconCheck className="size-5" />
                      Connected
                    </>
                  ) : (
                    <>
                      <IconCirclePlus className="size-5" />
                      Connect
                    </>
                  )}
                </Button>
              </div>

              {/* Google Connection */}
              <div className="group relative flex flex-col gap-6 rounded-3xl border border-white/5 bg-[#0d1117]/50 p-6 transition-all hover:bg-[#0d1117]/80 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl p-3 shadow-lg transition-transform group-hover:scale-110 ${
                      googleAccount
                        ? "bg-green-500/10 text-green-500"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    <IconBrandGoogle className="h-full w-full" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Google</h2>
                    <p className="text-sm text-muted-foreground">
                      {googleAccount
                        ? "Successfully connected to Google"
                        : "Link your Google account for easy sign-in"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => !googleAccount && handleConnect("google")}
                  disabled={!!googleAccount}
                  variant={googleAccount ? "secondary" : "default"}
                  className={`h-12 rounded-2xl px-6 font-bold flex items-center gap-2 ${
                    googleAccount
                      ? "border-green-500/20 bg-green-500/10 text-green-500 cursor-default"
                      : "shadow-lg shadow-primary/20"
                  }`}
                >
                  {googleAccount ? (
                    <>
                      <IconCheck className="size-5" />
                      Connected
                    </>
                  ) : (
                    <>
                      <IconCirclePlus className="size-5" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="rounded-[2.5rem] border border-red-500/10 bg-red-500/5 p-8 shadow-inner">
            <h3 className="mb-4 font-bold text-red-500 uppercase tracking-widest text-xs opacity-60">
              Security
            </h3>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-lg">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account.
                </p>
              </div>
              <Button
                variant="outline"
                className="h-12 rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold"
              >
                Configure 2FA
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
