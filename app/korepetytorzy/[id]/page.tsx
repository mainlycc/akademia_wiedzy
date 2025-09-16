import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function TutorDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const tutorId = params.id

  const { data: tutor } = await supabase
    .from("tutors")
    .select("id, first_name, last_name, active")
    .eq("id", tutorId)
    .maybeSingle()

  if (!tutor) {
    redirect("/korepetytorzy")
  }

  // Uczniowie przypisani do tutora przez enrollments
  const { data: students } = await supabase
    .from("enrollments")
    .select(`
      students:student_id ( id, first_name, last_name )
    `)
    .eq("tutor_id", tutorId)

  interface StudentRow { id: string; first_name?: string; last_name?: string }
  const studentsRows: StudentRow[] = (students ?? [])
    .map((row) => (row as { students?: StudentRow | null }).students)
    .filter(Boolean) as StudentRow[]

  const userData = {
    name:
      user.user_metadata?.full_name || user.email?.split("@")[0] || "Użytkownik",
    email: user.email || "",
    avatar: user.user_metadata?.avatar_url || "/avatars/default.jpg",
  }

  const fullName = [ (tutor as { first_name?: string }).first_name, (tutor as { last_name?: string }).last_name ].filter(Boolean).join(" ") || "Korepetytor"

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
        <div className="flex flex-1 flex-col gap-6 px-4 lg:px-6 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
              <p className="text-muted-foreground">Panel korepetytora</p>
            </div>
            <Badge variant={ (tutor as { active?: boolean }).active ? "secondary" : "outline" }>
              {(tutor as { active?: boolean }).active ? "Aktywny" : "Nieaktywny"}
            </Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Kalendarz po lewej (szerzej) */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Kalendarz</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Tu można wstawić docelowy komponent kalendarza/timetable */}
                <div className="aspect-video w-full rounded-lg border border-dashed"></div>
              </CardContent>
            </Card>

            {/* Lista uczniów po prawej */}
            <Card>
              <CardHeader>
                <CardTitle>Uczniowie</CardTitle>
              </CardHeader>
              <CardContent>
                {studentsRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Brak przypisanych uczniów.</p>
                ) : (
                  <div className="space-y-3">
                    {studentsRows.map((s) => (
                      <div key={s.id} className="flex items-center justify-between">
                        <div>
                          {[s.first_name, s.last_name].filter(Boolean).join(" ") || "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


