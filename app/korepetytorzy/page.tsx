"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Download, Mail, UserCheck, UserX, Filter } from "lucide-react"

interface TutorRow { 
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  active?: boolean
  subjects?: string[]
  levels?: string[]
  studentCount?: number
  monthlyHours?: number
}

export default function TutorsPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [tutors, setTutors] = useState<TutorRow[]>([])
  const [selectedTutors, setSelectedTutors] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    subject: '',
    level: '',
    status: '',
    minHours: '',
    maxHours: ''
  })

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

        // Pobierz korepetytorów z bazy danych
        const { data: tutorsData, error: tutorsError } = await supabase
          .from("tutors")
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            active,
            rate,
            bio,
            created_at,
            updated_at
          `)
          .order("last_name", { ascending: true })

        if (tutorsError) {
          console.error("Błąd pobierania korepetytorów:", tutorsError)
          return
        }

        // Pobierz przedmioty dla każdego korepetytora
        const tutorsWithSubjects = await Promise.all(
          (tutorsData || []).map(async (tutor) => {
            // Pobierz przedmioty z enrollments
            const { data: enrollments } = await supabase
              .from("enrollments")
              .select(`
                subjects:subject_id (
                  name
                )
              `)
              .eq("tutor_id", tutor.id)

            const subjects = enrollments?.map(e => e.subjects?.name).filter(Boolean) || []

            // Pobierz liczbę uczniów
            const { count: studentCount } = await supabase
              .from("enrollments")
              .select("*", { count: "exact", head: true })
              .eq("tutor_id", tutor.id)
              .eq("status", "active")

            // Przykładowe godziny w miesiącu (w rzeczywistej aplikacji można to obliczyć z harmonogramu)
            const monthlyHours = Math.floor(Math.random() * 40) + 10

            return {
              ...tutor,
              subjects,
              levels: ['Podstawowy', 'Średni', 'Rozszerzony'], // Przykładowe poziomy
              studentCount: studentCount || 0,
              monthlyHours
            }
          })
        )

        setTutors(tutorsWithSubjects)
        setLoading(false)
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error)
        setLoading(false)
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const userData = {
    name:
      user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Użytkownik",
    email: user?.email || "",
    avatar: user?.user_metadata?.avatar_url || "/avatars/default.jpg",
  }

  // Funkcje do obsługi zaznaczania
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTutors(filteredTutors.map(t => t.id))
    } else {
      setSelectedTutors([])
    }
  }

  const handleSelectTutor = (tutorId: string, checked: boolean) => {
    if (checked) {
      setSelectedTutors(prev => [...prev, tutorId])
    } else {
      setSelectedTutors(prev => prev.filter(id => id !== tutorId))
    }
  }

  // Filtrowanie danych
  const filteredTutors = tutors.filter(tutor => {
    if (filters.subject && !tutor.subjects?.includes(filters.subject)) return false
    if (filters.level && !tutor.levels?.includes(filters.level)) return false
    if (filters.status && ((filters.status === 'active' && !tutor.active) || (filters.status === 'inactive' && tutor.active))) return false
    if (filters.minHours && (tutor.monthlyHours || 0) < parseInt(filters.minHours)) return false
    if (filters.maxHours && (tutor.monthlyHours || 0) > parseInt(filters.maxHours)) return false
    return true
  })

  // Akcje masowe
  const handleBulkAction = async (action: string) => {
    if (selectedTutors.length === 0) return
    
    try {
      switch (action) {
        case 'activate':
          // Aktywuj zaznaczonych korepetytorów
          const { error: activateError } = await supabase
            .from("tutors")
            .update({ active: true })
            .in("id", selectedTutors)
          
          if (activateError) {
            console.error("Błąd aktywacji:", activateError)
            return
          }
          
          // Odśwież dane
          setTutors(prev => prev.map(tutor => 
            selectedTutors.includes(tutor.id) ? { ...tutor, active: true } : tutor
          ))
          setSelectedTutors([])
          break
          
        case 'deactivate':
          // Deaktywuj zaznaczonych korepetytorów
          const { error: deactivateError } = await supabase
            .from("tutors")
            .update({ active: false })
            .in("id", selectedTutors)
          
          if (deactivateError) {
            console.error("Błąd deaktywacji:", deactivateError)
            return
          }
          
          // Odśwież dane
          setTutors(prev => prev.map(tutor => 
            selectedTutors.includes(tutor.id) ? { ...tutor, active: false } : tutor
          ))
          setSelectedTutors([])
          break
          
        case 'message':
          // Wyślij wiadomość do zaznaczonych korepetytorów
          console.log('Wyślij wiadomość:', selectedTutors)
          // Tutaj można dodać funkcjonalność wysyłania wiadomości
          break
          
        case 'export':
          // Eksportuj zaznaczonych korepetytorów
          const selectedTutorsData = tutors.filter(tutor => selectedTutors.includes(tutor.id))
          exportSelectedToCSV(selectedTutorsData)
          break
      }
    } catch (error) {
      console.error("Błąd podczas wykonywania akcji masowej:", error)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Imię i nazwisko', 'Przedmioty', 'Poziomy', 'Liczba uczniów', 'Godziny w miesiącu', 'Status'],
      ...filteredTutors.map(tutor => [
        `${tutor.first_name} ${tutor.last_name}`,
        tutor.subjects?.join(', ') || '',
        tutor.levels?.join(', ') || '',
        tutor.studentCount?.toString() || '0',
        tutor.monthlyHours?.toString() || '0',
        tutor.active ? 'Aktywny' : 'Archiwalny'
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'korepetytorzy.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportSelectedToCSV = (selectedTutorsData: TutorRow[]) => {
    const csvContent = [
      ['Imię i nazwisko', 'Przedmioty', 'Poziomy', 'Liczba uczniów', 'Godziny w miesiącu', 'Status'],
      ...selectedTutorsData.map(tutor => [
        `${tutor.first_name} ${tutor.last_name}`,
        tutor.subjects?.join(', ') || '',
        tutor.levels?.join(', ') || '',
        tutor.studentCount?.toString() || '0',
        tutor.monthlyHours?.toString() || '0',
        tutor.active ? 'Aktywny' : 'Archiwalny'
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'zaznaczeni_korepetytorzy.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div>Ładowanie...</div>
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
                    <p className="text-muted-foreground">Zarządzaj korepetytorami i ich harmonogramami.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={exportToCSV} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Eksport CSV
                    </Button>
                    <Button size="sm" onClick={() => router.push('/korepetytorzy/dodaj')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj korepetytora
                    </Button>
                    <Badge variant="secondary" className="text-sm">
                      {filteredTutors.length} osób
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Filtry */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filtry
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label>Przedmiot</Label>
                        <Select value={filters.subject || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value === "all" ? "" : value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Wszystkie przedmioty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Wszystkie przedmioty</SelectItem>
                            <SelectItem value="Matematyka">Matematyka</SelectItem>
                            <SelectItem value="Fizyka">Fizyka</SelectItem>
                            <SelectItem value="Chemia">Chemia</SelectItem>
                            <SelectItem value="Język angielski">Język angielski</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Poziom</Label>
                        <Select value={filters.level || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, level: value === "all" ? "" : value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Wszystkie poziomy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Wszystkie poziomy</SelectItem>
                            <SelectItem value="Podstawowy">Podstawowy</SelectItem>
                            <SelectItem value="Średni">Średni</SelectItem>
                            <SelectItem value="Rozszerzony">Rozszerzony</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={filters.status || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Wszystkie statusy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Wszystkie statusy</SelectItem>
                            <SelectItem value="active">Aktywny</SelectItem>
                            <SelectItem value="inactive">Archiwalny</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Min. godziny</Label>
                        <Input 
                          type="number" 
                          placeholder="0"
                          value={filters.minHours}
                          onChange={(e) => setFilters(prev => ({ ...prev, minHours: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Max. godziny</Label>
                        <Input 
                          type="number" 
                          placeholder="100"
                          value={filters.maxHours}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxHours: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Akcje masowe */}
              {selectedTutors.length > 0 && (
                <div className="px-4 lg:px-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Zaznaczono {selectedTutors.length} korepetytorów
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleBulkAction('message')}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Wyślij wiadomość
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleBulkAction('activate')}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Aktywuj
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleBulkAction('deactivate')}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Deaktywuj
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleBulkAction('export')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Eksportuj
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="px-4 lg:px-6">
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedTutors.length === filteredTutors.length && filteredTutors.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Imię i nazwisko</TableHead>
                        <TableHead>Przedmioty</TableHead>
                        <TableHead>Poziomy</TableHead>
                        <TableHead>Liczba uczniów</TableHead>
                        <TableHead>Godziny w miesiącu</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTutors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center h-24">
                            Brak danych do wyświetlenia.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTutors.map((tutor) => (
                          <TableRow key={tutor.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedTutors.includes(tutor.id)}
                                onCheckedChange={(checked) => handleSelectTutor(tutor.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell>
                              <a 
                                href={`/korepetytorzy/${tutor.id}`} 
                                className="underline-offset-2 hover:underline font-medium"
                              >
                                {tutor.first_name} {tutor.last_name}
                              </a>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {tutor.subjects?.map((subject, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {subject}
                                  </Badge>
                                )) || "—"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {tutor.levels?.map((level, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {level}
                                  </Badge>
                                )) || "—"}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-medium">{tutor.studentCount || 0}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-medium">{tutor.monthlyHours || 0}h</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={tutor.active ? "default" : "secondary"}>
                                {tutor.active ? "Aktywny" : "Archiwalny"}
                              </Badge>
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


