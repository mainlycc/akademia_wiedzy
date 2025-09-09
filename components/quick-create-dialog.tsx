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
import { CalendarIcon, Plus, User, BookOpen, GraduationCap } from "lucide-react"
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

type CreateType = "lesson" | "student" | "tutor"

interface QuickCreateDialogProps {
  onItemAdded?: (type: CreateType, item: any) => void
}

export function QuickCreateDialog({ onItemAdded }: QuickCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const [createType, setCreateType] = useState<CreateType>("lesson")
  const [selectedDate, setSelectedDate] = useState<Date>()
  
  // Dane formularza dla zajęć
  const [lessonData, setLessonData] = useState({
    tutorId: "",
    studentId: "",
    subject: "",
    startTime: "",
    endTime: "",
    notes: "",
    price: ""
  })

  // Dane formularza dla ucznia
  const [studentData, setStudentData] = useState({
    name: "",
    email: "",
    phone: "",
    parentName: "",
    parentPhone: "",
    notes: ""
  })

  // Dane formularza dla korepetytora
  const [tutorData, setTutorData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    hourlyRate: "",
    experience: "",
    notes: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    let newItem: any = {}
    let isValid = true

    switch (createType) {
      case "lesson":
        if (!selectedDate || !lessonData.tutorId || !lessonData.studentId || !lessonData.startTime || !lessonData.endTime) {
          alert("Proszę wypełnić wszystkie wymagane pola dla zajęć")
          isValid = false
        } else {
          const selectedTutor = tutors.find(t => t.id === lessonData.tutorId)
          const selectedStudent = students.find(s => s.id === lessonData.studentId)
          
          newItem = {
            id: Date.now(),
            tutorId: lessonData.tutorId,
            tutorName: selectedTutor?.name || "",
            studentId: lessonData.studentId,
            student: selectedStudent?.name || "",
            subject: lessonData.subject || selectedTutor?.subject || "",
            startTime: lessonData.startTime,
            endTime: lessonData.endTime,
            date: selectedDate.toISOString().split('T')[0],
            notes: lessonData.notes,
            price: lessonData.price ? parseFloat(lessonData.price) : 0,
            status: "scheduled"
          }
        }
        break

      case "student":
        if (!studentData.name || !studentData.email) {
          alert("Proszę wypełnić imię i email ucznia")
          isValid = false
        } else {
          newItem = {
            id: Date.now(),
            name: studentData.name,
            email: studentData.email,
            phone: studentData.phone,
            parentName: studentData.parentName,
            parentPhone: studentData.parentPhone,
            notes: studentData.notes,
            status: "active"
          }
        }
        break

      case "tutor":
        if (!tutorData.name || !tutorData.email || !tutorData.subject) {
          alert("Proszę wypełnić imię, email i przedmiot korepetytora")
          isValid = false
        } else {
          newItem = {
            id: Date.now(),
            name: tutorData.name,
            email: tutorData.email,
            phone: tutorData.phone,
            subject: tutorData.subject,
            hourlyRate: tutorData.hourlyRate ? parseFloat(tutorData.hourlyRate) : 0,
            experience: tutorData.experience,
            notes: tutorData.notes,
            status: "active"
          }
        }
        break
    }

    if (!isValid) return

    console.log(`Dodawanie ${createType}:`, newItem)
    
    if (onItemAdded) {
      onItemAdded(createType, newItem)
    }

    // Reset formularza
    setLessonData({
      tutorId: "",
      studentId: "",
      subject: "",
      startTime: "",
      endTime: "",
      notes: "",
      price: ""
    })
    setStudentData({
      name: "",
      email: "",
      phone: "",
      parentName: "",
      parentPhone: "",
      notes: ""
    })
    setTutorData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      hourlyRate: "",
      experience: "",
      notes: ""
    })
    setSelectedDate(undefined)
    setOpen(false)
  }

  const handleTutorChange = (tutorId: string) => {
    const tutor = tutors.find(t => t.id === tutorId)
    setLessonData(prev => ({
      ...prev,
      tutorId,
      subject: tutor?.subject || ""
    }))
  }

  const getTitle = () => {
    switch (createType) {
      case "lesson": return "Dodaj zajęcia"
      case "student": return "Dodaj ucznia"
      case "tutor": return "Dodaj korepetytora"
      default: return "Dodaj"
    }
  }

  const getDescription = () => {
    switch (createType) {
      case "lesson": return "Wypełnij formularz aby dodać nowe zajęcia do kalendarza."
      case "student": return "Wypełnij formularz aby dodać nowego ucznia do systemu."
      case "tutor": return "Wypełnij formularz aby dodać nowego korepetytora do systemu."
      default: return "Wybierz co chcesz dodać."
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear">
          <Plus className="h-4 w-4 mr-2" />
          Dodaj
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        {/* Wybór typu */}
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Co chcesz dodać?</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={createType === "lesson" ? "default" : "outline"}
                onClick={() => setCreateType("lesson")}
                className="flex flex-col items-center p-4 h-auto"
              >
                <BookOpen className="h-5 w-5 mb-2" />
                <span className="text-sm">Zajęcia</span>
              </Button>
              <Button
                type="button"
                variant={createType === "student" ? "default" : "outline"}
                onClick={() => setCreateType("student")}
                className="flex flex-col items-center p-4 h-auto"
              >
                <User className="h-5 w-5 mb-2" />
                <span className="text-sm">Uczeń</span>
              </Button>
              <Button
                type="button"
                variant={createType === "tutor" ? "default" : "outline"}
                onClick={() => setCreateType("tutor")}
                className="flex flex-col items-center p-4 h-auto"
              >
                <GraduationCap className="h-5 w-5 mb-2" />
                <span className="text-sm">Korepetytor</span>
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Formularz zajęć */}
            {createType === "lesson" && (
              <>
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
                  <Select value={lessonData.tutorId} onValueChange={handleTutorChange}>
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
                  <Select value={lessonData.studentId} onValueChange={(value) => setLessonData(prev => ({ ...prev, studentId: value }))}>
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
                    value={lessonData.subject}
                    onChange={(e) => setLessonData(prev => ({ ...prev, subject: e.target.value }))}
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
                      value={lessonData.startTime}
                      onChange={(e) => setLessonData(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">Godzina zakończenia *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={lessonData.endTime}
                      onChange={(e) => setLessonData(prev => ({ ...prev, endTime: e.target.value }))}
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
                    value={lessonData.price}
                    onChange={(e) => setLessonData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                {/* Notatki */}
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notatki</Label>
                  <Textarea
                    id="notes"
                    value={lessonData.notes}
                    onChange={(e) => setLessonData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Dodatkowe informacje o zajęciach..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Formularz ucznia */}
            {createType === "student" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="studentName">Imię i nazwisko *</Label>
                  <Input
                    id="studentName"
                    value={studentData.name}
                    onChange={(e) => setStudentData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Jan Kowalski"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="studentEmail">Email *</Label>
                  <Input
                    id="studentEmail"
                    type="email"
                    value={studentData.email}
                    onChange={(e) => setStudentData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="jan.kowalski@email.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="studentPhone">Telefon</Label>
                  <Input
                    id="studentPhone"
                    value={studentData.phone}
                    onChange={(e) => setStudentData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="123 456 789"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="parentName">Imię i nazwisko rodzica</Label>
                  <Input
                    id="parentName"
                    value={studentData.parentName}
                    onChange={(e) => setStudentData(prev => ({ ...prev, parentName: e.target.value }))}
                    placeholder="Anna Kowalska"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="parentPhone">Telefon rodzica</Label>
                  <Input
                    id="parentPhone"
                    value={studentData.parentPhone}
                    onChange={(e) => setStudentData(prev => ({ ...prev, parentPhone: e.target.value }))}
                    placeholder="123 456 789"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="studentNotes">Notatki</Label>
                  <Textarea
                    id="studentNotes"
                    value={studentData.notes}
                    onChange={(e) => setStudentData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Dodatkowe informacje o uczniu..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Formularz korepetytora */}
            {createType === "tutor" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="tutorName">Imię i nazwisko *</Label>
                  <Input
                    id="tutorName"
                    value={tutorData.name}
                    onChange={(e) => setTutorData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Anna Kowalska"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tutorEmail">Email *</Label>
                  <Input
                    id="tutorEmail"
                    type="email"
                    value={tutorData.email}
                    onChange={(e) => setTutorData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="anna.kowalska@email.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tutorPhone">Telefon</Label>
                  <Input
                    id="tutorPhone"
                    value={tutorData.phone}
                    onChange={(e) => setTutorData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="123 456 789"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tutorSubject">Przedmiot *</Label>
                  <Input
                    id="tutorSubject"
                    value={tutorData.subject}
                    onChange={(e) => setTutorData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Matematyka"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="hourlyRate">Stawka godzinowa (zł)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    value={tutorData.hourlyRate}
                    onChange={(e) => setTutorData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    placeholder="50.00"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="experience">Doświadczenie (lata)</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={tutorData.experience}
                    onChange={(e) => setTutorData(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="5"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tutorNotes">Notatki</Label>
                  <Textarea
                    id="tutorNotes"
                    value={tutorData.notes}
                    onChange={(e) => setTutorData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Dodatkowe informacje o korepetytorze..."
                    rows={3}
                  />
                </div>
              </>
            )}

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Anuluj
              </Button>
              <Button type="submit">
                Dodaj {createType === "lesson" ? "zajęcia" : createType === "student" ? "ucznia" : "korepetytora"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
