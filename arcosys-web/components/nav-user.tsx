"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconBrandGithub,
  IconBrandGoogle,
  IconCheck,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useListAccounts } from "@/lib/auth-hooks";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data: session, isPending } = authClient.useSession();
  const { data: accounts } = useListAccounts();
  const router = useRouter();

  if (isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="h-12 w-full animate-pulse rounded-lg bg-sidebar-accent/50" />
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.image || ""} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.image || ""} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <IconUserCircle />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                Connections
              </DropdownMenuLabel>
              {(() => {
                const githubAccount = accounts?.find(
                  (a) => a.providerId === "github"
                );
                const googleAccount = accounts?.find(
                  (a) => a.providerId === "google"
                );

                return (
                  <>
                    <DropdownMenuItem
                      disabled={!!githubAccount}
                      onClick={
                        githubAccount
                          ? undefined
                          : async () => {
                              await authClient.signIn.social({
                                provider: "github",
                                callbackURL: window.location.href,
                              });
                            }
                      }
                    >
                      <IconBrandGithub
                        className={githubAccount ? "text-green-500" : ""}
                      />
                      {githubAccount ? "Connected to GitHub" : "Connect GitHub"}
                      {githubAccount && (
                        <IconCheck className="ml-auto size-4 text-green-500" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!!googleAccount}
                      onClick={
                        googleAccount
                          ? undefined
                          : async () => {
                              await authClient.signIn.social({
                                provider: "google",
                                callbackURL: window.location.href,
                              });
                            }
                      }
                    >
                      <IconBrandGoogle
                        className={googleAccount ? "text-green-500" : ""}
                      />
                      {googleAccount ? "Connected to Google" : "Connect Google"}
                      {googleAccount && (
                        <IconCheck className="ml-auto size-4 text-green-500" />
                      )}
                    </DropdownMenuItem>
                  </>
                );
              })()}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/sign-in");
                    },
                  },
                });
              }}
            >
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
