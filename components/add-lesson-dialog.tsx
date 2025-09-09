"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus } from "lucide-react"
// Usunięto date-fns - używamy natywnych funkcji JavaScript
import { cn } from "@/lib/utils"

// Funkcja do formatowania daty w języku polskim
const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }
  return date.toLocaleDateString('pl-PL', options)
}

// Przykładowe dane korepetytorów
const tutors = [
  { id: "1", name: "Anna Kowalska", subject: "Matematyka" },
  { id: "2", name: "Piotr Nowak", subject: "Fizyka" },
  { id: "3", name: "Maria Wiśniewska", subject: "Chemia" },
  { id: "4", name: "Tomasz Krawczyk", subject: "Język angielski" },
  { id: "5", name: "Katarzyna Zielińska", subject: "Biologia" },
]

// Przykładowe dane uczniów
const students = [
  { id: "1", name: "Jan Kowalski", email: "jan.kowalski@email.com" },
  { id: "2", name: "Anna Nowak", email: "anna.nowak@email.com" },
  { id: "3", name: "Piotr Wiśniewski", email: "piotr.wisniewski@email.com" },
  { id: "4", name: "Maria Kowalczyk", email: "maria.kowalczyk@email.com" },
  { id: "5", name: "Tomasz Zieliński", email: "tomasz.zielinski@email.com" },
]

interface Lesson {
  id: number
  tutorId: string
  tutorName: string
  studentId: string
  student: string
  subject: string
  startTime: string
  endTime: string
  date: string
  notes: string
  price: number
  status: string
}

interface AddLessonDialogProps {
  onLessonAdded?: (lesson: Lesson) => void
}

export function AddLessonDialog({ onLessonAdded }: AddLessonDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [formData, setFormData] = useState({
    tutorId: "",
    studentId: "",
    subject: "",
    startTime: "",
    endTime: "",
    notes: "",
    price: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !formData.tutorId || !formData.studentId || !formData.startTime || !formData.endTime) {
      alert("Proszę wypełnić wszystkie wymagane pola")
      return
    }

    const selectedTutor = tutors.find(t => t.id === formData.tutorId)
    const selectedStudent = students.find(s => s.id === formData.studentId)

    const newLesson = {
      id: Date.now(), // Tymczasowe ID
      tutorId: formData.tutorId,
      tutorName: selectedTutor?.name || "",
      studentId: formData.studentId,
      student: selectedStudent?.name || "",
      subject: formData.subject || selectedTutor?.subject || "",
      startTime: formData.startTime,
      endTime: formData.endTime,
      date: selectedDate.toISOString().split('T')[0],
      notes: formData.notes,
      price: formData.price ? parseFloat(formData.price) : 0,
      status: "scheduled"
    }

    console.log("Dodawanie zajęć:", newLesson)
    
    // Wywołaj callback jeśli jest podany
    if (onLessonAdded) {
      onLessonAdded(newLesson)
    }

    // Reset formularza
    setFormData({
      tutorId: "",
      studentId: "",
      subject: "",
      startTime: "",
      endTime: "",
      notes: "",
      price: ""
    })
    setSelectedDate(undefined)
    setOpen(false)
  }

  const handleTutorChange = (tutorId: string) => {
    const tutor = tutors.find(t => t.id === tutorId)
    setFormData(prev => ({
      ...prev,
      tutorId,
      subject: tutor?.subject || ""
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj zajęcia
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj nowe zajęcia</DialogTitle>
          <DialogDescription>
            Wypełnij formularz aby dodać nowe zajęcia do kalendarza.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Data */}
            <div className="grid gap-2">
              <Label htmlFor="date">Data zajęć *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? formatDate(selectedDate) : "Wybierz datę"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Korepetytor */}
            <div className="grid gap-2">
              <Label htmlFor="tutor">Korepetytor *</Label>
              <Select value={formData.tutorId} onValueChange={handleTutorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz korepetytora" />
                </SelectTrigger>
                <SelectContent>
                  {tutors.map((tutor) => (
                    <SelectItem key={tutor.id} value={tutor.id}>
                      {tutor.name} - {tutor.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Uczeń */}
            <div className="grid gap-2">
              <Label htmlFor="student">Uczeń *</Label>
              <Select value={formData.studentId} onValueChange={(value) => setFormData(prev => ({ ...prev, studentId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz ucznia" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Przedmiot */}
            <div className="grid gap-2">
              <Label htmlFor="subject">Przedmiot</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Przedmiot zajęć"
              />
            </div>

            {/* Godziny */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Godzina rozpoczęcia *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">Godzina zakończenia *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            {/* Cena */}
            <div className="grid gap-2">
              <Label htmlFor="price">Cena (zł)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            {/* Notatki */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notatki</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Dodatkowe informacje o zajęciach..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anuluj
            </Button>
            <Button type="submit">
              Dodaj zajęcia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
