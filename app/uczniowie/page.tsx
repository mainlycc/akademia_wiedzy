import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function StudentsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  // 1) Pobierz listę uczniów
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, first_name, last_name, active")
    .order("last_name", { ascending: true })

  // 2) Pobierz listę dostępnych tutorów
  const { data: tutors } = await supabase
    .from("tutors")
    .select("id, first_name, last_name, active")
    .eq("active", true)
    .order("last_name", { ascending: true })

  // 3) Pobierz aktywne zapisy, które są widoczne dla bieżącego użytkownika
  //    (Tutor zobaczy tylko swoje; Admin zobaczy wszystkie)
  const { data: activeEnrollments } = await supabase
    .from("enrollments")
    .select(`
      id, 
      student_id, 
      tutor_id, 
      status,
      tutors:tutor_id ( first_name, last_name )
    `)
    .eq("status", "active")

  // Zbuduj mapę student_id -> nazwa tutora (wg widocznych zapisów)
  const studentIdToTutorName = new Map<string, string>()
  for (const e of activeEnrollments ?? []) {
    if (e.student_id && e.tutor_id) {
      const tutorsAny: any = e?.tutors
      const tutorRel: any = Array.isArray(tutorsAny) ? tutorsAny[0] : tutorsAny
      const tutorName = [tutorRel?.first_name, tutorRel?.last_name]
        .filter(Boolean)
        .join(" ") || "Nieznany tutor"
      studentIdToTutorName.set(e.student_id as string, tutorName)
    }
  }

  const tableData = (students ?? []).map((s: any) => {
    const fullName = [s.first_name, s.last_name].filter(Boolean).join(" ") || "—"
    const tutorName = studentIdToTutorName.get(s.id)

    return {
      id: s.id as string,
      imieNazwisko: fullName,
      // Na widoku uczniów nie mamy naturalnego przedmiotu/statusu, zostawmy puste/„—"
      przedmiot: "—",
      status: s.active ? "W trakcie" : "Zakończone",
      korepetytor: tutorName || "Przypisz korepetytora",
    }
  })

  const userData = {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Użytkownik',
    email: user.email || '',
    avatar: user.user_metadata?.avatar_url || '/avatars/default.jpg'
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
                    <h1 className="text-3xl font-bold tracking-tight">Uczniowie</h1>
                    <p className="text-muted-foreground">
                      Zarządzaj listą uczniów i ich korepetycjami
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {(tableData?.length ?? 0)} uczniów
                    </Badge>
                    {role && (
                      <Badge variant="outline" className="text-sm">
                        Rola: {role}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <DataTable data={tableData} tutors={tutors || []} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
