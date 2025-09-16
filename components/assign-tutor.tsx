"use client"

import * as React from "react"
import { toast } from "sonner"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TutorOption {
  id: string
  first_name?: string
  last_name?: string
}

export function AssignTutorSelect({
  enrollmentId,
  tutors,
  currentTutorId,
  idSuffix,
}: {
  enrollmentId: string
  tutors: TutorOption[]
  currentTutorId?: string | null
  idSuffix?: string
}) {
  const [value, setValue] = React.useState<string | undefined>(
    currentTutorId || undefined
  )
  const [loading, setLoading] = React.useState(false)

  const handleChange = async (tutorId: string) => {
    if (!tutorId) return
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    try {
      const { error } = await supabase
        .from("enrollments")
        .update({ tutor_id: tutorId })
        .eq("id", enrollmentId)

      if (error) throw error
      setValue(tutorId)
      toast.success("Przypisano korepetytora")
      window.location.reload()
    } catch (err) {
      console.error(err)
      toast.error("Nie udało się przypisać korepetytora")
    } finally {
      setLoading(false)
    }
  }

  const selectableId = `assign-tutor-${enrollmentId}${idSuffix ? `-${idSuffix}` : ""}`

  return (
    <div className="min-w-40">
      <Label htmlFor={selectableId} className="sr-only">
        Korepetytor
      </Label>
      <Select
        disabled={loading}
        value={value}
        onValueChange={handleChange}
      >
        <SelectTrigger id={selectableId} size="sm" className="w-48">
          <SelectValue placeholder="Przypisz korepetytora" />
        </SelectTrigger>
        <SelectContent align="start">
          {tutors.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {[t.first_name, t.last_name].filter(Boolean).join(" ") || "—"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}


