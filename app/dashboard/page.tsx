import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { createSupabaseServerClient } from "@/lib/supabase/server"

import data from "./data.json"

export default async function Page() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Przekieruj na logowanie jeśli użytkownik nie jest zalogowany
  if (!user) {
    redirect("/login")
  }

  let role: string | null = null
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .maybeSingle()
  role = profile?.role ?? null

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {user ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Zalogowano jako:</span>
                    <span>{user.email}</span>
                    {role ? <Badge variant="secondary">rola: {role}</Badge> : null}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Nie zalogowano</div>
                )}
              </div>
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
