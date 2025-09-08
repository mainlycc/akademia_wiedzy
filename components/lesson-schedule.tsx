"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { IconX, IconEdit, IconCheck, IconX as IconCancel, IconPlus, IconChevronDown, IconUserPlus } from "@tabler/icons-react"

interface Lesson {
  id: string
  subject: string
  time: string
  duration: number
  student: string
  tutor: string
  status: "scheduled" | "completed" | "cancelled"
}

interface LessonScheduleProps {
  date?: Date
  lessons?: Lesson[]
  className?: string
  onLessonsChange?: (lessons: Lesson[]) => void
  availableTutors?: string[]
  availableStudents?: string[]
}

const defaultLessons: Lesson[] = [
  {
    id: "1",
    subject: "Matematyka",
    time: "08:00",
    duration: 60,
    student: "Jan Kowalski",
    tutor: "Anna Nowak",
    status: "scheduled"
  },
  {
    id: "2", 
    subject: "Chemia",
    time: "09:15",
    duration: 60,
    student: "Maria Wiśniewska",
    tutor: "Piotr Kowalczyk",
    status: "scheduled"
  },
  {
    id: "3",
    subject: "Język Polski",
    time: "10:30",
    duration: 45,
    student: "Tomasz Zieliński",
    tutor: "Katarzyna Lewandowska",
    status: "scheduled"
  },
  {
    id: "4",
    subject: "Język Angielski",
    time: "11:30",
    duration: 60,
    student: "Anna Krawczyk",
    tutor: "Michael Smith",
    status: "scheduled"
  },
  {
    id: "5",
    subject: "Fizyka",
    time: "13:00",
    duration: 60,
    student: "Paweł Dąbrowski",
    tutor: "Ewa Kowal",
    status: "scheduled"
  },
  {
    id: "6",
    subject: "Biologia",
    time: "14:15",
    duration: 45,
    student: "Kasia Nowak",
    tutor: "Dr Jan Kowalski",
    status: "scheduled"
  },
  {
    id: "7",
    subject: "Język Niemiecki",
    time: "15:30",
    duration: 60,
    student: "Marcin Wójcik",
    tutor: "Hans Mueller",
    status: "scheduled"
  },
  {
    id: "8",
    subject: "Język Hiszpański",
    time: "16:45",
    duration: 45,
    student: "Ola Kamińska",
    tutor: "Carlos Rodriguez",
    status: "scheduled"
  },
  {
    id: "9",
    subject: "Język Rosyjski",
    time: "17:45",
    duration: 60,
    student: "Bartek Szymański",
    tutor: "Ivan Petrov",
    status: "scheduled"
  }
]

const subjectColors: Record<string, string> = {
  "Matematyka": "bg-blue-100 text-blue-800 border-blue-200",
  "Chemia": "bg-green-100 text-green-800 border-green-200",
  "Biologia": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Fizyka": "bg-purple-100 text-purple-800 border-purple-200",
  "Język Polski": "bg-red-100 text-red-800 border-red-200",
  "Język Angielski": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Język Niemiecki": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Język Hiszpański": "bg-orange-100 text-orange-800 border-orange-200",
  "Język Rosyjski": "bg-pink-100 text-pink-800 border-pink-200"
}

const subjectBgColors: Record<string, string> = {
  "Matematyka": "bg-blue-50 border-blue-300",
  "Chemia": "bg-green-50 border-green-300",
  "Biologia": "bg-emerald-50 border-emerald-300",
  "Fizyka": "bg-purple-50 border-purple-300",
  "Język Polski": "bg-red-50 border-red-300",
  "Język Angielski": "bg-indigo-50 border-indigo-300",
  "Język Niemiecki": "bg-yellow-50 border-yellow-300",
  "Język Hiszpański": "bg-orange-50 border-orange-300",
  "Język Rosyjski": "bg-pink-50 border-pink-300"
}

const statusColors: Record<string, string> = {
  "scheduled": "bg-blue-100 text-blue-800",
  "completed": "bg-green-100 text-green-800",
  "cancelled": "bg-red-100 text-red-800"
}

const statusLabels: Record<string, string> = {
  "scheduled": "Zaplanowana",
  "completed": "Zakończona",
  "cancelled": "Anulowana"
}

const defaultTutors = [
  "Anna Nowak",
  "Piotr Kowalczyk", 
  "Katarzyna Lewandowska",
  "Michael Smith",
  "Ewa Kowal",
  "Dr Jan Kowalski",
  "Hans Mueller",
  "Carlos Rodriguez",
  "Ivan Petrov"
]

const defaultStudents = [
  "Jan Kowalski",
  "Maria Wiśniewska",
  "Tomasz Zieliński",
  "Anna Krawczyk",
  "Paweł Dąbrowski",
  "Kasia Nowak",
  "Marcin Wójcik",
  "Ola Kamińska",
  "Bartek Szymański"
]

export function LessonSchedule({ 
  date, 
  lessons = defaultLessons, 
  className,
  onLessonsChange,
  availableTutors = defaultTutors,
  availableStudents = defaultStudents
}: LessonScheduleProps) {
  const [localLessons, setLocalLessons] = React.useState<Lesson[]>(lessons)
  const [editingLesson, setEditingLesson] = React.useState<string | null>(null)
  const [editingTutor, setEditingTutor] = React.useState<string>("")
  const [editingStudent, setEditingStudent] = React.useState<string>("")
  const [draggedLesson, setDraggedLesson] = React.useState<Lesson | null>(null)
  const [showAddStudent, setShowAddStudent] = React.useState<string | null>(null)
  const [newStudentName, setNewStudentName] = React.useState<string>("")
  const [showTutorDropdown, setShowTutorDropdown] = React.useState<string | null>(null)
  const [showAddNewStudent, setShowAddNewStudent] = React.useState<string | null>(null)
  const [newStudentInput, setNewStudentInput] = React.useState<string>("")
  const [currentDate, setCurrentDate] = React.useState<Date>(() => date || new Date())
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setLocalLessons(lessons)
  }, [lessons])

  React.useEffect(() => {
    setIsClient(true)
    setCurrentDate(new Date())
  }, [])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string, duration: number) => {
    const startTime = time
    const [hours, minutes] = time.split(':').map(Number)
    const endTime = new Date()
    endTime.setHours(hours, minutes + duration, 0, 0)
    const endTimeStr = endTime.toTimeString().slice(0, 5)
    return `${startTime} - ${endTimeStr}`
  }

  const updateLessons = (newLessons: Lesson[]) => {
    setLocalLessons(newLessons)
    onLessonsChange?.(newLessons)
  }

  const deleteLesson = (lessonId: string) => {
    const newLessons = localLessons.filter(lesson => lesson.id !== lessonId)
    updateLessons(newLessons)
  }

  const startEditTutor = (lessonId: string, currentTutor: string) => {
    setEditingLesson(lessonId)
    setEditingTutor(currentTutor)
  }

  const saveTutorEdit = (lessonId: string) => {
    if (editingTutor.trim()) {
      const newLessons = localLessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, tutor: editingTutor.trim() }
          : lesson
      )
      updateLessons(newLessons)
    }
    setEditingLesson(null)
    setEditingTutor("")
  }

  const startEditStudent = (lessonId: string, currentStudent: string) => {
    setEditingLesson(lessonId)
    setEditingStudent(currentStudent)
  }

  const saveStudentEdit = (lessonId: string) => {
    if (editingStudent.trim()) {
      const newLessons = localLessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, student: editingStudent.trim() }
          : lesson
      )
      updateLessons(newLessons)
    }
    setEditingLesson(null)
    setEditingStudent("")
  }

  const addNewStudent = (lessonId: string) => {
    if (newStudentName.trim()) {
      const newLessons = localLessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, student: newStudentName.trim() }
          : lesson
      )
      updateLessons(newLessons)
    }
    setShowAddStudent(null)
    setNewStudentName("")
  }

  const addNewLesson = (subject: string, time: string) => {
    if (newStudentName.trim()) {
      const newLesson: Lesson = {
        id: Date.now().toString(),
        subject,
        time,
        duration: 60,
        student: newStudentName.trim(),
        tutor: availableTutors[0] || "Nowy korepetytor",
        status: "scheduled"
      }
      updateLessons([...localLessons, newLesson])
    }
    setShowAddStudent(null)
    setNewStudentName("")
  }

  const addNewStudentToList = (lessonId: string) => {
    if (newStudentInput.trim()) {
      const newLessons = localLessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, student: newStudentInput.trim() }
          : lesson
      )
      updateLessons(newLessons)
    }
    setShowAddNewStudent(null)
    setNewStudentInput("")
  }

  const changeTutor = (lessonId: string, newTutor: string) => {
    const newLessons = localLessons.map(lesson => 
      lesson.id === lessonId 
        ? { ...lesson, tutor: newTutor }
        : lesson
    )
    updateLessons(newLessons)
    setShowTutorDropdown(null)
  }

  const cancelEdit = () => {
    setEditingLesson(null)
    setEditingTutor("")
    setEditingStudent("")
    setShowAddStudent(null)
    setNewStudentName("")
    setShowTutorDropdown(null)
    setShowAddNewStudent(null)
    setNewStudentInput("")
  }

  const handleDragStart = (e: React.DragEvent, lesson: Lesson) => {
    setDraggedLesson(lesson)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetSubject: string, targetTime: string) => {
    e.preventDefault()
    if (!draggedLesson) return

    const newLessons = localLessons.map(lesson => 
      lesson.id === draggedLesson.id 
        ? { ...lesson, subject: targetSubject, time: targetTime }
        : lesson
    )
    updateLessons(newLessons)
    setDraggedLesson(null)
  }

  // Grupuj lekcje według przedmiotów
  const lessonsBySubject = localLessons.reduce((acc, lesson) => {
    if (!acc[lesson.subject]) {
      acc[lesson.subject] = []
    }
    acc[lesson.subject].push(lesson)
    return acc
  }, {} as Record<string, Lesson[]>)

  // Sortuj lekcje w każdej grupie według czasu
  Object.keys(lessonsBySubject).forEach(subject => {
    lessonsBySubject[subject].sort((a, b) => a.time.localeCompare(b.time))
  })

  const subjects = Object.keys(lessonsBySubject)

  // Pobierz wszystkie unikalne godziny i posortuj je
  const allTimes = [...new Set(localLessons.map(lesson => lesson.time))].sort()

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Plan dnia</span>
          {isClient && (
            <Badge variant="outline" className="text-sm">
              {formatDate(currentDate)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {subjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Brak lekcji zaplanowanych na ten dzień
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left p-3 font-medium text-muted-foreground min-w-[100px] border-r">
                    Godzina
                  </th>
                  {subjects.map((subject) => (
                    <th key={subject} className="text-center p-3 min-w-[200px] border-r last:border-r-0">
                      <Badge 
                        className={cn(
                          "font-medium text-sm px-3 py-1",
                          subjectColors[subject] || "bg-gray-100 text-gray-800 border-gray-200"
                        )}
                      >
                        {subject}
                      </Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allTimes.map((time) => (
                  <tr key={time} className="border-b">
                    <td className="p-3 font-medium text-muted-foreground border-r">
                      {time}
                    </td>
                    {subjects.map((subject) => {
                      const lessonAtTime = lessonsBySubject[subject].find(lesson => lesson.time === time)
                      return (
                        <td 
                          key={subject} 
                          className="p-3 border-r last:border-r-0"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, subject, time)}
                        >
                          {lessonAtTime ? (
                            <div 
                              draggable
                              onDragStart={(e) => handleDragStart(e, lessonAtTime)}
                              className={cn(
                                "p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-move relative group",
                                subjectBgColors[lessonAtTime.subject] || "bg-gray-50 border-gray-300"
                              )}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="text-xs text-muted-foreground">Korepetytor:</div>
                                  <div className="text-sm font-medium">
                                    {lessonAtTime.tutor}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0"
                                    onClick={() => setShowTutorDropdown(showTutorDropdown === lessonAtTime.id ? null : lessonAtTime.id)}
                                  >
                                    <IconChevronDown className="h-3 w-3" />
                                  </Button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => deleteLesson(lessonAtTime.id)}
                                >
                                  <IconX className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="mb-2">
                                {editingLesson === lessonAtTime.id ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-1">
                                      <Select
                                        value={editingTutor}
                                        onValueChange={setEditingTutor}
                                      >
                                        <SelectTrigger className="h-6 text-xs">
                                          <SelectValue placeholder="Wybierz korepetytora" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {availableTutors.map((tutor) => (
                                            <SelectItem key={tutor} value={tutor}>
                                              {tutor}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => saveTutorEdit(lessonAtTime.id)}
                                      >
                                        <IconCheck className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={cancelEdit}
                                      >
                                        <IconCancel className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Select
                                        value={editingStudent}
                                        onValueChange={setEditingStudent}
                                      >
                                        <SelectTrigger className="h-6 text-xs">
                                          <SelectValue placeholder="Wybierz ucznia" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {availableStudents.map((student) => (
                                            <SelectItem key={student} value={student}>
                                              {student}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => saveStudentEdit(lessonAtTime.id)}
                                      >
                                        <IconCheck className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <Badge 
                                        variant="outline"
                                        className="text-xs cursor-pointer hover:bg-accent/30"
                                        onClick={() => startEditStudent(lessonAtTime.id, lessonAtTime.student)}
                                      >
                                        {lessonAtTime.student}
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0"
                                        onClick={() => setShowAddNewStudent(showAddNewStudent === lessonAtTime.id ? null : lessonAtTime.id)}
                                      >
                                        <IconUserPlus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-xs text-muted-foreground mb-2">
                                {formatTime(lessonAtTime.time, lessonAtTime.duration)}
                              </div>
                              
                              <Badge 
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  statusColors[lessonAtTime.status]
                                )}
                              >
                                {statusLabels[lessonAtTime.status]}
                              </Badge>
                              
                              {/* Rozwijana lista korepetytorów */}
                              {showTutorDropdown === lessonAtTime.id && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-10">
                                  <div className="max-h-32 overflow-y-auto">
                                    {availableTutors.map((tutor) => (
                                      <div
                                        key={tutor}
                                        className="px-3 py-2 text-xs hover:bg-accent cursor-pointer"
                                        onClick={() => changeTutor(lessonAtTime.id, tutor)}
                                      >
                                        {tutor}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Pole do dodania nowego ucznia */}
                              {showAddNewStudent === lessonAtTime.id && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-10 p-2">
                                  <div className="flex items-center gap-1">
                                    <Input
                                      value={newStudentInput}
                                      onChange={(e) => setNewStudentInput(e.target.value)}
                                      placeholder="Nowy uczeń"
                                      className="h-6 text-xs"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => addNewStudentToList(lessonAtTime.id)}
                                    >
                                      <IconCheck className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => setShowAddNewStudent(null)}
                                    >
                                      <IconCancel className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div 
                              className="h-20 flex items-center justify-center"
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, subject, time)}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs opacity-0 hover:opacity-100 transition-opacity"
                                onClick={() => setShowAddStudent(`${subject}-${time}`)}
                              >
                                <IconPlus className="h-3 w-3 mr-1" />
                                Dodaj lekcję
                              </Button>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {subjects.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Łącznie lekcji: {localLessons.length}</span>
              <span>
                Czas pracy: {localLessons.reduce((total, lesson) => total + lesson.duration, 0)} min
              </span>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Modal do dodawania nowej lekcji */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Dodaj nową lekcję</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Uczeń:</label>
                <Input
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Wpisz imię i nazwisko ucznia"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddStudent(null)
                    setNewStudentName("")
                  }}
                >
                  Anuluj
                </Button>
                <Button
                  onClick={() => {
                    const [subject, time] = showAddStudent.split('-')
                    addNewLesson(subject, time)
                  }}
                  disabled={!newStudentName.trim()}
                >
                  Dodaj lekcję
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
