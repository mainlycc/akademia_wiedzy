import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ReservationsTable } from "@/components/reservations-table"
import { ReservationsCalendar } from "@/components/reservations-calendar"
import { AddReservationDialog } from "@/components/add-reservation-dialog"
import { IconCalendar, IconClock, IconUsers } from "@tabler/icons-react"

// Przykładowe dane rezerwacji
const reservationsData = [
  {
    id: 1,
    studentName: "Anna Kowalska",
    subject: "Matematyka",
    level: "Liceum",
    tutor: "Piotr Nowak",
    date: "2024-01-15",
    time: "14:00-15:00",
    duration: 60,
    status: "Potwierdzona",
    price: 80,
    location: "Online",
    notes: "Przygotowanie do matury",
  },
  {
    id: 2,
    studentName: "Jan Wiśniewski",
    subject: "Fizyka",
    level: "Studia",
    tutor: "Maria Wiśniewska",
    date: "2024-01-16",
    time: "16:00-17:30",
    duration: 90,
    status: "W trakcie",
    price: 120,
    location: "Stacjonarnie",
    notes: "Mechanika kwantowa",
  },
  {
    id: 3,
    studentName: "Katarzyna Zielińska",
    subject: "Chemia",
    level: "Matura",
    tutor: "Tomasz Kaczmarek",
    date: "2024-01-17",
    time: "10:00-11:00",
    duration: 60,
    status: "Zaplanowana",
    price: 80,
    location: "Online",
    notes: "Chemia organiczna",
  },
  {
    id: 4,
    studentName: "Michał Nowak",
    subject: "Język angielski",
    level: "Gimnazjum",
    tutor: "Aleksandra Kaczmarek",
    date: "2024-01-18",
    time: "15:00-16:00",
    duration: 60,
    status: "Zakończona",
    price: 70,
    location: "Online",
    notes: "Gramatyka i słownictwo",
  },
  {
    id: 5,
    studentName: "Aleksandra Kaczmarek",
    subject: "Biologia",
    level: "Liceum",
    tutor: "Katarzyna Zielińska",
    date: "2024-01-19",
    time: "13:00-14:00",
    duration: 60,
    status: "Anulowana",
    price: 80,
    location: "Stacjonarnie",
    notes: "Genetyka - odwołana przez ucznia",
  },
  {
    id: 6,
    studentName: "Piotr Kowalski",
    subject: "Historia",
    level: "Szkoła podstawowa",
    tutor: "Anna Kowalska",
    date: "2024-01-20",
    time: "11:00-12:00",
    duration: 60,
    status: "Potwierdzona",
    price: 60,
    location: "Stacjonarnie",
    notes: "Historia Polski",
  },
]

// Statystyki rezerwacji
const getReservationStats = (reservations: typeof reservationsData) => {
  const total = reservations.length
  const confirmed = reservations.filter(r => r.status === "Potwierdzona").length
  const inProgress = reservations.filter(r => r.status === "W trakcie").length
  const completed = reservations.filter(r => r.status === "Zakończona").length
  const cancelled = reservations.filter(r => r.status === "Anulowana").length
  const totalRevenue = reservations
    .filter(r => r.status === "Zakończona" || r.status === "W trakcie")
    .reduce((sum, r) => sum + r.price, 0)

  return {
    total,
    confirmed,
    inProgress,
    completed,
    cancelled,
    totalRevenue
  }
}

export default async function ReservationsPage() {
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

  const stats = getReservationStats(reservationsData)

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
                    <h1 className="text-3xl font-bold tracking-tight">Rezerwacje</h1>
                    <p className="text-muted-foreground">
                      Zarządzaj rezerwacjami lekcji i harmonogramem
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AddReservationDialog />
                    <Badge variant="secondary" className="text-sm">
                      {stats.total} rezerwacji
                    </Badge>
                    {role && (
                      <Badge variant="outline" className="text-sm">
                        Rola: {role}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Statystyki */}
              <div className="px-4 lg:px-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Wszystkie rezerwacje
                      </CardTitle>
                      <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Potwierdzone
                      </CardTitle>
                      <IconClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        W trakcie
                      </CardTitle>
                      <IconUsers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Przychód (PLN)
                      </CardTitle>
                      <span className="text-2xl">💰</span>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{stats.totalRevenue}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Główna zawartość */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="table" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="table">Tabela rezerwacji</TabsTrigger>
                    <TabsTrigger value="calendar">Kalendarz</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="table" className="space-y-4">
                    <ReservationsTable data={reservationsData} />
                  </TabsContent>
                  
                  <TabsContent value="calendar" className="space-y-4">
                    <ReservationsCalendar data={reservationsData} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
