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

// Przykładowe dane uczniów
const studentsData = [
  {
    id: 1,
    imieNazwisko: "Anna Kowalska",
    przedmiot: "Matematyka",
    poziom: "Liceum",
    status: "W trakcie",
    liczbaGodzin: 24,
    korepetytor: "Piotr Nowak",
  },
  {
    id: 2,
    imieNazwisko: "Jan Wiśniewski",
    przedmiot: "Fizyka",
    poziom: "Studia",
    status: "Zakończone",
    liczbaGodzin: 32,
    korepetytor: "Maria Wiśniewska",
  },
  {
    id: 3,
    imieNazwisko: "Katarzyna Zielińska",
    przedmiot: "Chemia",
    poziom: "Matura",
    status: "W trakcie",
    liczbaGodzin: 18,
    korepetytor: "Tomasz Kaczmarek",
  },
  {
    id: 4,
    imieNazwisko: "Michał Nowak",
    przedmiot: "Język angielski",
    poziom: "Gimnazjum",
    status: "Zaplanowane",
    liczbaGodzin: 0,
    korepetytor: "Przypisz korepetytora",
  },
  {
    id: 5,
    imieNazwisko: "Aleksandra Kaczmarek",
    przedmiot: "Biologia",
    poziom: "Liceum",
    status: "W trakcie",
    liczbaGodzin: 15,
    korepetytor: "Katarzyna Zielińska",
  },
  {
    id: 6,
    imieNazwisko: "Piotr Kowalski",
    przedmiot: "Historia",
    poziom: "Szkoła podstawowa",
    status: "Zakończone",
    liczbaGodzin: 28,
    korepetytor: "Anna Kowalska",
  },
  {
    id: 7,
    imieNazwisko: "Magdalena Wiśniewska",
    przedmiot: "Geografia",
    poziom: "Liceum",
    status: "W trakcie",
    liczbaGodzin: 12,
    korepetytor: "Piotr Nowak",
  },
  {
    id: 8,
    imieNazwisko: "Tomasz Zieliński",
    przedmiot: "Informatyka",
    poziom: "Studia",
    status: "Zaplanowane",
    liczbaGodzin: 0,
    korepetytor: "Przypisz korepetytora",
  },
]

export default async function StudentsPage() {
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
                      {studentsData.length} uczniów
                    </Badge>
                    {role && (
                      <Badge variant="outline" className="text-sm">
                        Rola: {role}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <DataTable data={studentsData} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
