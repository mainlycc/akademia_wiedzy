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
import { AssignTutorSelect } from "@/components/assign-tutor"

interface TutorOption { id: string; first_name?: string; last_name?: string }
interface DBParent { id?: string; first_name?: string; last_name?: string; email?: string; phone?: string }
interface DBStudent { id?: string; first_name?: string; last_name?: string }
interface LinkRow { parents?: DBParent | null; students?: DBStudent | null }
interface SubjectRel { id?: string; name?: string; color?: string }
interface TutorRel { id?: string; first_name?: string; last_name?: string }
interface EnrollmentSelect {
  id: string
  student_id: string
  tutor_id: string | null
  subjects: SubjectRel | SubjectRel[] | null
  tutors: TutorRel | TutorRel[] | null
  status: string
}
interface ParentRow {
  id: string
  studentId: string
  studentName: string
  parentName: string
  email?: string
  phone?: string
  paymentStatus?: string
  enrollmentId: string
  subjectName?: string
  tutorId?: string | null
}

export default async function ClientsPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 1) Pobierz powiązania rodzic-uczeń wraz z danymi rodzica i ucznia
  const { data: links } = await supabase
    .from("student_parents")
    .select(`
      parent_id,
      is_primary,
      parents:parent_id (
        id, first_name, last_name, email, phone
      ),
      students:student_id (
        id, first_name, last_name
      )
    `)

  const studentIds = new Set<string>()
  for (const l of (links as LinkRow[] | null) ?? []) {
    const s = l.students
    if (s?.id) studentIds.add(s.id)
  }

  // 2) Pobierz zapisy (przedmioty + korepetytorzy) dla wszystkich tych uczniów
  const enrollmentRows: ParentRow[] = []
  let tutorsOptions: TutorOption[] = []
  if (studentIds.size > 0) {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select(`
        id,
        student_id,
        tutor_id,
        status,
        subjects:subject_id (
          id,
          name,
          color
        ),
        tutors:tutor_id (
          first_name,
          last_name
        )
      `)
      .in("student_id", Array.from(studentIds))

    for (const e of (enrollments as EnrollmentSelect[] | null) ?? []) {
      const sid = e.student_id
      if (!sid) continue
      const subjRel = e.subjects
      const subj = Array.isArray(subjRel) ? subjRel[0] : subjRel
      enrollmentRows.push({
        id: e.id,
        enrollmentId: e.id,
        studentId: sid,
        studentName: "", // uzupełnimy niżej
        parentName: "", // uzupełnimy niżej
        email: undefined,
        phone: undefined,
        paymentStatus: "—",
        subjectName: subj?.name,
        tutorId: e.tutor_id,
      })
    }
  }

  // 2b) Pobierz listę aktywnych tutorów do Selecta
  const { data: tutors } = await supabase
    .from("tutors")
    .select("id, first_name, last_name, active")
    .eq("active", true)
    .order("last_name", { ascending: true })
  tutorsOptions = (tutors ?? []).map((t) => ({ id: t.id as string, first_name: (t as { first_name?: string }).first_name, last_name: (t as { last_name?: string }).last_name }))
  

  // 3) Zbuduj wiersze: jeden wiersz = jedna para (uczeń, rodzic)
  const rows: ParentRow[] = ((links as LinkRow[] | null) ?? [])
    .flatMap((l) => {
      const p = l.parents
      const s = l.students
      if (!p || !s) return []
      const studentName = [s.first_name, s.last_name].filter(Boolean).join(" ") || "—"
      const parentName = [p.first_name, p.last_name].filter(Boolean).join(" ") || "—"
      const enrForStudent = enrollmentRows.filter((er) => er.studentId === s.id)
      if (enrForStudent.length === 0) {
        return [
          {
            id: `${p.id}-${s.id}`,
            enrollmentId: `${p.id}-${s.id}`,
            studentId: s.id!,
            studentName,
            parentName,
            email: p.email || undefined,
            phone: p.phone || undefined,
            paymentStatus: "—",
            subjectName: "—",
            tutorId: null,
          } as ParentRow,
        ]
      }
      return enrForStudent.map((er) => ({
        ...er,
        id: er.enrollmentId,
        studentName,
        parentName,
        email: p.email || undefined,
        phone: p.phone || undefined,
      }))
    })


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
                    <h1 className="text-3xl font-bold tracking-tight">Klienci</h1>
                    <p className="text-muted-foreground">
                      Lista klientów (rodzice) z powiązanymi uczniami, przedmiotami i korepetytorami.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {(rows?.length ?? 0)} pozycji
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="px-4 lg:px-6">
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead>Uczeń</TableHead>
                        <TableHead>Rodzic</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Status płatności</TableHead>
                        <TableHead>Przedmiot</TableHead>
                        <TableHead>Korepetytor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            Brak danych do wyświetlenia.
                          </TableCell>
                        </TableRow>
                      ) : (
                        rows.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>{r.studentName}</TableCell>
                            <TableCell>{r.parentName}</TableCell>
                            <TableCell>{r.email || "—"}</TableCell>
                            <TableCell>{r.phone || "—"}</TableCell>
                            <TableCell>{r.paymentStatus || "—"}</TableCell>
                            <TableCell>{r.subjectName || "—"}</TableCell>
                            <TableCell>
                              {r.enrollmentId.includes("-") ? (
                                <span className="text-muted-foreground">—</span>
                              ) : (
                                <AssignTutorSelect
                                  enrollmentId={r.enrollmentId}
                                  tutors={tutorsOptions}
                                  currentTutorId={r.tutorId ?? undefined}
                                  idSuffix="clients"
                                />
                              )}
                            </TableCell>
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


