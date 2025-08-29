"use client";

import {
  AlertCircle,
  BookUser,
  BotMessageSquare,
  Box,
  CalendarCheck,
  CircleHelp,
  LayoutDashboard,
  LinkIcon,
  LogOutIcon,
  Moon,
  PlaySquareIcon,
  Settings,
  Tag,
  Users,
} from "lucide-react";
import { Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
const itemsAgenda = [
  {
    title: "Agendamentos",
    url: "/appointments",
    icon: CalendarCheck,
  },
  {
    title: "Pendentes",
    url: "/appointments/pending",
    icon: AlertCircle,
  },
];

const itemsEnterprise = [
  {
    title: "Relatórios",
    url: "/dashboard",
    icon: LayoutDashboard,
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
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { setTheme, resolvedTheme } = useTheme();

  const router = useRouter();

  const session = authClient.useSession();

  const pathname = usePathname();

  const [hasUnreadPending, setHasUnreadPending] = useState<boolean>(false);
  useEffect(() => {
    let mounted = true;
    const fetchPending = async () => {
      try {
        const res = await fetch("/api/appointments/pending-count", { cache: "no-store" });
        const data = (await res.json()) as { notConfirmed: number; toConclude: number };
        if (!mounted) return;
        setHasUnreadPending((data?.notConfirmed || 0) > 0 || (data?.toConclude || 0) > 0);
      } catch { }
    };
    fetchPending();
    const id = setInterval(fetchPending, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [pathname]);

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
          <SidebarGroupLabel>Minha agenda</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsAgenda.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <div className="relative">
                        <item.icon />
                        {item.url === "/appointments/pending" && hasUnreadPending && (
                          <span className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500" aria-hidden />
                        )}
                      </div>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


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

        {/* Botões de logout e alternador de tema */}
        <div className="mt-auto px-3 py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Alternador de tema com animação */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex-1 h-10 hover:text-primary hover:bg-none"
              title="Alterar tema"
            >
              <div className="relative w-5 h-5">
                <Sun className="absolute inset-0 h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute inset-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </div>
              <span className="ml-2 group-data-[state=collapsed]:hidden">
                {resolvedTheme === "dark" ? "Tema claro" : "Tema escuro"}
              </span>
            </Button>

            {/* Botão de logout apenas com ícone */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="h-10 w-1/3 hover:text-red-500 hover:bg-none"
              title="Sair"
            >
              <LogOutIcon className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="bg-background border-t py-4">
        <SidebarMenu>
          <SidebarMenuItem>
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
