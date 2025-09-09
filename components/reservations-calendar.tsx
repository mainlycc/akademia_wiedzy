"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { pl } from "date-fns/locale"
import { IconCalendar, IconClock, IconMapPin, IconUser } from "@tabler/icons-react"

export type Reservation = {
  id: number
  studentName: string
  subject: string
  level: string
  tutor: string
  date: string
  time: string
  duration: number
  status: string
  price: number
  location: string
  notes: string
}

interface ReservationsCalendarProps {
  data: Reservation[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Potwierdzona":
      return "bg-green-100 text-green-800 border-green-200"
    case "W trakcie":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "Zakończona":
      return "bg-gray-100 text-gray-800 border-gray-200"
    case "Anulowana":
      return "bg-red-100 text-red-800 border-red-200"
    case "Zaplanowana":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function ReservationsCalendar({ data }: ReservationsCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())

  // Konwertuj dane rezerwacji na obiekty Date
  const reservationsWithDates = data.map(reservation => ({
    ...reservation,
    dateObj: new Date(reservation.date)
  }))

  // Funkcja do pobierania rezerwacji dla konkretnego dnia
  const getReservationsForDate = (date: Date) => {
    return reservationsWithDates.filter(reservation => 
      isSameDay(reservation.dateObj, date)
    )
  }

  // Funkcja do renderowania rezerwacji w kalendarzu
  const renderReservations = (date: Date) => {
    const dayReservations = getReservationsForDate(date)
    
    if (dayReservations.length === 0) return null

    return (
      <div className="mt-1 space-y-1">
        {dayReservations.slice(0, 2).map((reservation) => (
          <div
            key={reservation.id}
            className={cn(
              "text-xs p-1 rounded border truncate",
              getStatusColor(reservation.status)
            )}
            title={`${reservation.studentName} - ${reservation.subject} (${reservation.time})`}
          >
            {reservation.time} - {reservation.studentName}
          </div>
        ))}
        {dayReservations.length > 2 && (
          <div className="text-xs text-muted-foreground">
            +{dayReservations.length - 2} więcej
          </div>
        )}
      </div>
    )
  }

  // Pobierz rezerwacje dla wybranego dnia
  const selectedDayReservations = selectedDate ? getReservationsForDate(selectedDate) : []

  // Statystyki dla bieżącego miesiąca
  const currentMonthReservations = reservationsWithDates.filter(reservation => 
    reservation.dateObj.getMonth() === currentMonth.getMonth() &&
    reservation.dateObj.getFullYear() === currentMonth.getFullYear()
  )

  const monthlyStats = {
    total: currentMonthReservations.length,
    confirmed: currentMonthReservations.filter(r => r.status === "Potwierdzona").length,
    inProgress: currentMonthReservations.filter(r => r.status === "W trakcie").length,
    completed: currentMonthReservations.filter(r => r.status === "Zakończona").length,
    revenue: currentMonthReservations
      .filter(r => r.status === "Zakończona" || r.status === "W trakcie")
      .reduce((sum, r) => sum + r.price, 0)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Kalendarz */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Kalendarz rezerwacji</CardTitle>
            <CardDescription>
              Wybierz datę, aby zobaczyć szczegóły rezerwacji
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border"
              locale={pl}
              components={{
                Day: ({ date, displayMonth }) => {
                  const dayReservations = getReservationsForDate(date)
                  const hasReservations = dayReservations.length > 0
                  
                  return (
                    <div className="relative">
                      <div className={cn(
                        "h-9 w-9 p-0 font-normal",
                        hasReservations && "font-semibold"
                      )}>
                        {date.getDate()}
                      </div>
                      {renderReservations(date)}
                    </div>
                  )
                }
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Szczegóły wybranego dnia */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5" />
              {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: pl }) : "Wybierz datę"}
            </CardTitle>
            <CardDescription>
              {selectedDayReservations.length} rezerwacji
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDayReservations.length > 0 ? (
              <div className="space-y-3">
                {selectedDayReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="p-3 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{reservation.studentName}</h4>
                      <Badge variant="outline" className={getStatusColor(reservation.status)}>
                        {reservation.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <IconClock className="h-4 w-4" />
                        {reservation.time} ({reservation.duration} min)
                      </div>
                      <div className="flex items-center gap-2">
                        <IconUser className="h-4 w-4" />
                        {reservation.tutor}
                      </div>
                      <div className="flex items-center gap-2">
                        <IconMapPin className="h-4 w-4" />
                        {reservation.location}
                      </div>
                      <div className="font-medium text-foreground">
                        {reservation.subject} - {reservation.price} PLN
                      </div>
                      {reservation.notes && (
                        <div className="text-xs italic">
                          {reservation.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Brak rezerwacji na wybrany dzień
              </p>
            )}
          </CardContent>
        </Card>

        {/* Statystyki miesiąca */}
        <Card>
          <CardHeader>
            <CardTitle>Statystyki miesiąca</CardTitle>
            <CardDescription>
              {format(currentMonth, "MMMM yyyy", { locale: pl })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Wszystkie:</span>
                <span className="font-medium">{monthlyStats.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Potwierdzone:</span>
                <span className="font-medium text-green-600">{monthlyStats.confirmed}</span>
              </div>
              <div className="flex justify-between">
                <span>W trakcie:</span>
                <span className="font-medium text-blue-600">{monthlyStats.inProgress}</span>
              </div>
              <div className="flex justify-between">
                <span>Zakończone:</span>
                <span className="font-medium text-gray-600">{monthlyStats.completed}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Przychód:</span>
                <span className="font-bold text-green-600">{monthlyStats.revenue} PLN</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
