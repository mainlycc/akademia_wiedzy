import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { PaymentManagement } from "@/components/payment-management"
import data from "../dashboard/data.json"

export default async function PlatnosciPage() {
  const supabase = await createSupabaseServerClient()
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

  // Przygotuj dane użytkownika dla sidebar
  const userData = {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Użytkownik',
    email: user.email || '',
    avatar: user.user_metadata?.avatar_url || '/avatars/default.jpg'
  }

  // Przygotuj dane użytkownika dla header
  const headerUserData = {
    name: userData.name,
    email: userData.email,
    role: role ?? undefined
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={userData} />
      <SidebarInset>
        <SiteHeader user={headerUserData} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <h1 className="text-2xl font-bold">Zarządzanie płatnościami</h1>
                <p className="text-muted-foreground">Przeglądaj i zarządzaj płatnościami uczniów</p>
              </div>
              <div className="px-4 lg:px-6">
                <PaymentManagement data={data} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
