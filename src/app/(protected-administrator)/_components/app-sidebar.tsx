"use client";

import {
  BookUser,
  BotMessageSquare,
  Box,
  Calendar,
  CircleHelp,
  LayoutDashboard,
  LinkIcon,
  LogOutIcon,
  Moon,
  PlaySquareIcon,
  SettingsIcon,
  Tag,
  Users,
} from "lucide-react";
import { Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

// Menu items.
const itemsEnterprise = [
  {
    title: "Relatórios",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Agenda",
    url: "/appointments",
    icon: Calendar,
  },
  {
    title: "Profissionais",
    url: "/professionals",
    icon: Users,
  },
  {
    title: "Serviços",
    url: "/enterprise-services",
    icon: Tag,
  },
  {
    title: "Estoque",
    url: "/products",
    icon: Box,
  },
];

const itemsClients = [
  {
    title: "Clientes",
    url: "/clients",
    icon: BookUser,
  },
  {
    title: "Mensagens",
    url: "/messages",
    icon: BotMessageSquare,
  },
  {
    title: "Link de agendamento",
    url: "/booking-link",
    icon: LinkIcon,
  },
];

const othersItems = [
  {
    title: "Tutoriais",
    url: "/tutorials",
    icon: PlaySquareIcon,
  },
  {
    title: "Suporte iGenda",
    url: "/support",
    icon: CircleHelp,
  },
];

export function AppSidebar() {
  const { setTheme, resolvedTheme } = useTheme();

  const router = useRouter();

  const session = authClient.useSession();

  const pathname = usePathname();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/authentication");
        },
      },
    });
  };

  const enterpriseInitials = session.data?.user?.enterprise?.name
    .split(" ")
    .map((name) => name[0])
    .join("");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="bg-background flex items-center justify-center border-b p-4" />

      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel>Minha empresa</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsEnterprise.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Meus clientes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsClients.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Minha iGenda</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {othersItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-background border-t py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="h-12 w-12 rounded-full border-2 border-green-500 group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8">
                    <AvatarImage
                      src={session.data?.user?.enterprise?.avatarImageURL || ""}
                    />
                    {!session.data?.user?.enterprise?.avatarImageURL && (
                      <AvatarFallback>{enterpriseInitials}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="group-data-[state=collapsed]:hidden">
                    <p className="text-sm">
                      {session.data?.user?.enterprise?.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {session.data?.user.email}
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                  className="flex items-center gap-2"
                >
                  <span className="inline-block transition-transform duration-300 ease-in-out group-active:rotate-180">
                    {resolvedTheme === "dark" ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                  </span>
                  <span>
                    {resolvedTheme === "dark" ? "Tema claro" : "Tema escuro"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <SettingsIcon />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOutIcon />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
