"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import type { TimeSlot, Subject, Level } from "@/components/tutoring-calendar"
import { format } from "date-fns"
import { Calendar, Clock, CreditCard, User, GraduationCap } from "lucide-react"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  slot: TimeSlot
  subject: Subject
  level: Level
  onBook: (slot: TimeSlot, note?: string) => Promise<void>
}

export function BookingModal({ isOpen, onClose, slot, subject, level, onBook }: BookingModalProps) {
  const [note, setNote] = useState("")
  const [isBooking, setIsBooking] = useState(false)

  const handleBook = async () => {
    setIsBooking(true)
    try {
      await onBook(slot, note)
    } catch (error) {
      console.error("Booking failed:", error)
    } finally {
      setIsBooking(false)
    }
  }

  const slotDate = new Date(slot.start)
  const slotEndDate = new Date(slot.end)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{subject.icon}</span>
            Potwierdzenie rezerwacji
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lesson Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">{subject.name}</div>
                <div className="text-sm text-muted-foreground">Korepetycje indywidualne</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">Poziom: {level.name}</div>
                <div className="text-sm text-muted-foreground">{level.description}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">{format(slotDate, "EEEE, d MMMM yyyy")}</div>
                <div className="text-sm text-muted-foreground">Data zajęć</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium">
                  {format(slotDate, "HH:mm")} - {format(slotEndDate, "HH:mm")}
                </div>
                <div className="text-sm text-muted-foreground">Czas trwania: 60 minut</div>
              </div>
            </div>

            {slot.price && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{slot.price} zł</div>
                  <div className="text-sm text-muted-foreground">
                    Cena może się różnić w zależności od przydzielonego nauczyciela
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Additional Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Dodatkowe uwagi (opcjonalne)</label>
            <Textarea
              placeholder="Np. preferuję zajęcia online, mam trudności z konkretnym tematem..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <Separator />

          {/* Important Info */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Ważne informacje:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Nauczyciel zostanie przydzielony automatycznie</li>
              <li>• Szczegóły zajęć otrzymasz na e-mail</li>
              <li>• Możesz odwołać lekcję do 24h przed terminem</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Anuluj
            </Button>
            <Button onClick={handleBook} disabled={isBooking} className="flex-1">
              {isBooking ? "Rezerwuję..." : "Zarezerwuj lekcję"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Nie zostaniesz obciążony opłatą do momentu potwierdzenia
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
