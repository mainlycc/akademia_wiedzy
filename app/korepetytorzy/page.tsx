import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function TutorsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: tutors } = await supabase
    .from("tutors")
    .select("id, first_name, last_name, email, phone, active")
    .order("last_name", { ascending: true })

  const rows = (tutors ?? []).map((t) => ({
    id: t.id as string,
    name: [ (t as any).first_name, (t as any).last_name ].filter(Boolean).join(" ") || "—",
    email: (t as any).email as string | undefined,
    phone: (t as any).phone as string | undefined,
    active: (t as any).active as boolean | undefined,
  }))

  const userData = {
    name:
      user.user_metadata?.full_name || user.email?.split("@")[0] || "Użytkownik",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url || "/avatars/default.jpg",
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
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Korepetytorzy</h1>
                    <p className="text-muted-foreground">Lista wszystkich korepetytorów.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {(rows?.length ?? 0)} osób
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="px-4 lg:px-6">
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead>Imię i nazwisko</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center h-24">
                            Brak danych do wyświetlenia.
                          </TableCell>
                        </TableRow>
                      ) : (
                        rows.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>
                              <a href={`/korepetytorzy/${r.id}`} className="underline-offset-2 hover:underline">
                                {r.name}
                              </a>
                            </TableCell>
                            <TableCell>{r.email || "—"}</TableCell>
                            <TableCell>{r.phone || "—"}</TableCell>
                            <TableCell>{r.active ? "Aktywny" : "Nieaktywny"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


