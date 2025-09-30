"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { WeeklySchedule } from "@/components/weekly-schedule"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { User, Users, Calendar, FileText } from "lucide-react"

interface StudentRow { 
  id: string
  first_name?: string
  last_name?: string
  subject?: string
  grade?: string
}

interface TutorData {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  rate?: number
  bio?: string
  active?: boolean
  created_at?: string
  updated_at?: string
}

type SupabaseUser = Awaited<ReturnType<ReturnType<typeof createSupabaseBrowserClient>['auth']['getUser']>>['data']['user']

export default function TutorDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [tutor, setTutor] = useState<TutorData | null>(null)
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dane")

  const tutorId = params.id

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pobierz użytkownika
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/login")
          return
        }
        setUser(user)

        // Pobierz dane korepetytora
        const { data: tutorData, error: tutorError } = await supabase
          .from("tutors")
          .select("*")
          .eq("id", tutorId)
          .maybeSingle()

        if (tutorError || !tutorData) {
          router.push("/korepetytorzy")
          return
        }
        setTutor(tutorData)

        // Pobierz uczniów przypisanych do korepetytora
        const { data: studentsData } = await supabase
          .from("enrollments")
          .select(`
            students:student_id (
              id,
              first_name,
              last_name
            ),
            subjects:subject_id (
              name
            )
          `)
          .eq("tutor_id", tutorId)

        const studentsRows: StudentRow[] = (studentsData ?? [])
          .flatMap((row) => {
            const student = (row as { students?: StudentRow | StudentRow[] | null }).students
            const subjectRel = (row as { subjects?: { name: string } | { name: string }[] | null }).subjects
            const subject = Array.isArray(subjectRel) ? subjectRel[0] : subjectRel
            if (Array.isArray(student)) {
              return student.filter(Boolean).map(s => ({ ...s, subject: subject?.name }))
            }
            return student ? [{ ...student, subject: subject?.name }] : []
          })

        setStudents(studentsRows)
        setLoading(false)
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error)
        setLoading(false)
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, tutorId])

  if (loading) {
    return <div>Ładowanie...</div>
  }

  if (!tutor) {
    return <div>Korepetytor nie znaleziony</div>
  }

  const userData = {
    name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Użytkownik",
    email: user?.email || "",
    avatar: user?.user_metadata?.avatar_url || "/avatars/default.jpg",
  }

  const fullName = [tutor.first_name, tutor.last_name].filter(Boolean).join(" ") || "Korepetytor"

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
            <Badge variant={tutor.active ? "secondary" : "outline"}>
              {tutor.active ? "Aktywny" : "Nieaktywny"}
            </Badge>
          </div>

          {/* System zakładek */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dane" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Dane
              </TabsTrigger>
              <TabsTrigger value="uczniowie" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Uczniowie
              </TabsTrigger>
              <TabsTrigger value="kalendarz" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Kalendarz
              </TabsTrigger>
              <TabsTrigger value="deklaracje" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Deklaracje miesiąca
              </TabsTrigger>
            </TabsList>

            {/* Zakładka: Dane */}
            <TabsContent value="dane" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Podstawowe informacje</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Imię</label>
                        <p className="text-sm">{tutor.first_name || "—"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nazwisko</label>
                        <p className="text-sm">{tutor.last_name || "—"}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{tutor.email || "—"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                      <p className="text-sm">{tutor.phone || "—"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Stawka godzinowa</label>
                      <p className="text-sm">{tutor.rate ? `${tutor.rate} zł/h` : "—"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge variant={tutor.active ? "default" : "secondary"}>
                        {tutor.active ? "Aktywny" : "Nieaktywny"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Opis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {tutor.bio || "Brak opisu"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Zakładka: Uczniowie */}
            <TabsContent value="uczniowie" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Przypisani uczniowie ({students.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {students.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Brak przypisanych uczniów.</p>
                  ) : (
                    <div className="space-y-3">
                      {students.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">
                              {[student.first_name, student.last_name].filter(Boolean).join(" ") || "—"}
                            </p>
                            {student.subject && (
                              <p className="text-sm text-muted-foreground">Przedmiot: {student.subject}</p>
                            )}
                          </div>
                          <Badge variant="outline">
                            Aktywny
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Zakładka: Kalendarz */}
            <TabsContent value="kalendarz" className="space-y-6">
              <WeeklySchedule tutorName={fullName} />
            </TabsContent>

            {/* Zakładka: Deklaracje miesiąca */}
            <TabsContent value="deklaracje" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deklaracje godzin za bieżący miesiąc</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-green-600">32</p>
                        <p className="text-sm text-muted-foreground">Zadeklarowane godziny</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">28</p>
                        <p className="text-sm text-muted-foreground">Przepracowane godziny</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">4</p>
                        <p className="text-sm text-muted-foreground">Pozostałe godziny</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Historia deklaracji</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span className="text-sm">Styczeń 2024</span>
                          <span className="text-sm font-medium">32 godziny</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span className="text-sm">Grudzień 2023</span>
                          <span className="text-sm font-medium">28 godzin</span>
                        </div>
                        <div className="flex justify-between items-center p-2 border rounded">
                          <span className="text-sm">Listopad 2023</span>
                          <span className="text-sm font-medium">35 godzin</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


