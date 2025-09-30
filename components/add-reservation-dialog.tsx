"use client"

import * as React from "react"
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
import { cn } from "@/lib/utils"
import { IconCalendar, IconPlus } from "@tabler/icons-react"

export function AddReservationDialog() {
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    studentName: "",
    subject: "",
    level: "",
    tutor: "",
    date: undefined as Date | undefined,
    time: "",
    duration: 60,
    price: 0,
    location: "Online",
    notes: "",
  })

  const handleInputChange = (field: string, value: string | number | Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Tutaj będzie logika zapisywania rezerwacji
    console.log("Nowa rezerwacja:", formData)
    setOpen(false)
    // Reset formularza
    setFormData({
      studentName: "",
      subject: "",
      level: "",
      tutor: "",
      date: undefined,
      time: "",
      duration: 60,
      price: 0,
      location: "Online",
      notes: "",
    })
  }

  const subjects = [
    "Matematyka",
    "Fizyka",
    "Chemia",
    "Biologia",
    "Język polski",
    "Język angielski",
    "Historia",
    "Geografia",
    "Informatyka",
    "Inne"
  ]

  const levels = [
    "Szkoła podstawowa",
    "Gimnazjum",
    "Liceum",
    "Matura",
    "Studia"
  ]

  const tutors = [
    "Piotr Nowak",
    "Maria Wiśniewska",
    "Tomasz Kaczmarek",
    "Katarzyna Zielińska",
    "Aleksandra Kaczmarek",
    "Anna Kowalska"
  ]

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Nowa rezerwacja
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj nową rezerwację</DialogTitle>
          <DialogDescription>
            Wypełnij formularz, aby utworzyć nową rezerwację lekcji.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Imię i nazwisko ucznia *</Label>
              <Input
                id="studentName"
                value={formData.studentName}
                onChange={(e) => handleInputChange("studentName", e.target.value)}
                placeholder="Wprowadź imię i nazwisko"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tutor">Korepetytor *</Label>
              <Select
                value={formData.tutor}
                onValueChange={(value) => handleInputChange("tutor", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz korepetytora" />
                </SelectTrigger>
                <SelectContent>
                  {tutors.map((tutor) => (
                    <SelectItem key={tutor} value={tutor}>
                      {tutor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Przedmiot *</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => handleInputChange("subject", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz przedmiot" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Poziom *</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => handleInputChange("level", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz poziom" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data lekcji *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <IconCalendar className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      formData.date.toLocaleDateString('pl-PL', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    ) : (
                      <span>Wybierz datę</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => handleInputChange("date", date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Godzina rozpoczęcia *</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => handleInputChange("time", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz godzinę" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Czas trwania (minuty) *</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => handleInputChange("duration", parseInt(value))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz czas trwania" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minut</SelectItem>
                  <SelectItem value="45">45 minut</SelectItem>
                  <SelectItem value="60">60 minut</SelectItem>
                  <SelectItem value="90">90 minut</SelectItem>
                  <SelectItem value="120">120 minut</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Cena (PLN) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="10"
                value={formData.price}
                onChange={(e) => handleInputChange("price", parseInt(e.target.value) || 0)}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokalizacja *</Label>
            <Select
              value={formData.location}
              onValueChange={(value) => handleInputChange("location", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz lokalizację" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Stacjonarnie">Stacjonarnie</SelectItem>
                <SelectItem value="U ucznia">U ucznia</SelectItem>
                <SelectItem value="U korepetytora">U korepetytora</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notatki</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Dodatkowe informacje o lekcji..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anuluj
            </Button>
            <Button type="submit">
              <IconPlus className="mr-2 h-4 w-4" />
              Utwórz rezerwację
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
