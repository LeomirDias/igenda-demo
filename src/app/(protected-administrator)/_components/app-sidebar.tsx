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
  PlaySquareIcon,
  Settings,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  useSidebar,
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
  const session = authClient.useSession();
  const { setOpen } = useSidebar();

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



  const enterpriseInitials = session.data?.user?.enterprise?.name
    .split(" ")
    .map((name) => name[0])
    .join("");

  return (
    <Sidebar collapsible="icon" className="md:left-0 md:right-auto right-0 left-auto">
      <SidebarHeader className="bg-background flex items-center justify-center border-b p-4" />

      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel>Minha agenda</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsAgenda.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url} onClick={() => setOpen(false)}>
                      <div className="relative">
                        <item.icon className="h-5 w-5" />
                        {item.url === "/appointments/pending" && hasUnreadPending && (
                          <span className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500" aria-hidden />
                        )}
                      </div>
                      <span className="text-sm">{item.title}</span>
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
                    <Link href={item.url} onClick={() => setOpen(false)}>
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm">{item.title}</span>
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
                    <Link href={item.url} onClick={() => setOpen(false)}>
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm">{item.title}</span>
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
                    <Link href={item.url} onClick={() => setOpen(false)}>
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm">{item.title}</span>
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
