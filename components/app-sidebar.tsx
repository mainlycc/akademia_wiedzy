"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  IconCalendar,
  IconCreditCard,
  IconDashboard,
  IconInnerShadowTop,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const getNavData = (pathname: string) => ({
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Uczniowie",
      url: "/uczniowie",
      icon: IconUsers,
      isActive: pathname.startsWith("/uczniowie"),
    },
    {
      title: "Klienci",
      url: "/klienci",
      icon: IconUsers,
      isActive: pathname.startsWith("/klienci"),
    },
    {
      title: "Korepetytorzy",
      url: "/korepetytorzy",
      icon: IconUsers,
      isActive: pathname.startsWith("/korepetytorzy"),
    },
    {
      title: "Grafik",
      url: "/grafik",
      icon: IconCalendar,
      isActive: pathname.startsWith("/grafik"),
    },
    {
      title: "Rezerwacje",
      url: "/rezerwacje",
      icon: IconCalendar,
      isActive: pathname.startsWith("/rezerwacje"),
    },
    {
      title: "Płatności",
      url: "/platnosci",
      icon: IconCreditCard,
      isActive: pathname.startsWith("/platnosci"),
    },
  ],
  navSecondary: [],
})

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const navData = getNavData(pathname)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Akademia wiedzy</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
        <NavSecondary items={navData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
