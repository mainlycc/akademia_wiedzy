"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AddLessonDialog } from "@/components/add-lesson-dialog"

// Przykładowe dane korepetytorów
const tutors = [
  { id: "1", name: "Anna Kowalska", subject: "Matematyka" },
  { id: "2", name: "Piotr Nowak", subject: "Fizyka" },
  { id: "3", name: "Maria Wiśniewska", subject: "Chemia" },
  { id: "4", name: "Tomasz Krawczyk", subject: "Język angielski" },
  { id: "5", name: "Katarzyna Zielińska", subject: "Biologia" },
]

// Przykładowe zajęcia
const sampleLessons = [
  { id: 1, tutorId: "1", student: "Jan Kowalski", subject: "Matematyka", startTime: "09:00", endTime: "10:00", date: "2024-01-15" },
  { id: 2, tutorId: "1", student: "Anna Nowak", subject: "Matematyka", startTime: "10:30", endTime: "11:30", date: "2024-01-15" },
  { id: 3, tutorId: "2", student: "Piotr Wiśniewski", subject: "Fizyka", startTime: "14:00", endTime: "15:00", date: "2024-01-15" },
  { id: 4, tutorId: "3", student: "Maria Kowalczyk", subject: "Chemia", startTime: "16:00", endTime: "17:00", date: "2024-01-16" },
  { id: 5, tutorId: "1", student: "Tomasz Zieliński", subject: "Matematyka", startTime: "11:00", endTime: "12:00", date: "2024-01-16" },
]

export function TutorSchedule() {
  const [selectedTutor, setSelectedTutor] = useState<string>("all")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [lessons, setLessons] = useState(sampleLessons)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { firstDay, lastDay, daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)

  const monthNames = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ]

  const dayNames = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"]

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getLessonsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return lessons.filter(lesson => {
      const matchesDate = lesson.date === dateStr
      const matchesTutor = selectedTutor === "all" || lesson.tutorId === selectedTutor
      return matchesDate && matchesTutor
    })
  }

  const handleLessonAdded = (newLesson: {
    id: number
    tutorId: string
    student: string
    subject: string
    startTime: string
    endTime: string
    date: string
  }) => {
    setLessons(prev => [...prev, newLesson])
  }

  return (
    <div className="space-y-6">
      {/* Wybór korepetytora */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Wybór korepetytora</span>
            <AddLessonDialog onLessonAdded={handleLessonAdded} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select value={selectedTutor} onValueChange={setSelectedTutor}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Wybierz korepetytora" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszyscy korepetytorzy</SelectItem>
                {tutors.map((tutor) => (
                  <SelectItem key={tutor.id} value={tutor.id}>
                    {tutor.name} - {tutor.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTutor !== "all" && (
              <div className="text-sm text-muted-foreground">
                Wyświetlane zajęcia dla: {tutors.find(t => t.id === selectedTutor)?.name}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Kalendarz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 }, (_, i) => (
              <div key={`empty-${i}`} className="h-24"></div>
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const lessons = getLessonsForDate(day)
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
              
              return (
                <div
                  key={day}
                  className={`h-24 p-1 border rounded-md ${
                    isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                  }`}
                >
                  <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                    {day}
                  </div>
                  <div className="space-y-1 mt-1">
                    {lessons.slice(0, 2).map((lesson) => (
                      <div
                        key={lesson.id}
                        className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                        title={`${lesson.student} - ${lesson.startTime}-${lesson.endTime}`}
                      >
                        {lesson.startTime} {lesson.student}
                      </div>
                    ))}
                    {lessons.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{lessons.length - 2} więcej
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
