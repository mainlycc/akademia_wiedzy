"use client"

import * as React from "react"
import {
  IconCalendar,
  IconMapPin,
  IconPhone,
  IconMail,
  IconUser,
  IconDotsVertical,
  IconPhoneCall,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface StudentData {
  id: string
  first_name: string
  last_name: string
  active: boolean
  notes?: string
  created_at: string
  enrollment_year?: string
  location?: string
  class?: string
  school?: string
}

interface ParentData {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  relation: 'mother' | 'father' | 'guardian' | 'other'
  is_primary: boolean
}

interface SubjectData {
  id: string
  name: string
  color?: string
  tutor_name?: string
  status: 'active' | 'paused' | 'ended'
}

interface StudentCardProps {
  student: StudentData
  parents?: ParentData[]
  subjects?: SubjectData[]
  onContactParent?: (parent: ParentData) => void
  onEditStudent?: (student: StudentData) => void
}

export function StudentCard({
  student,
  parents = [],
  subjects = [],
  onContactParent,
  onEditStudent,
}: StudentCardProps) {
  const fullName = `${student.first_name} ${student.last_name}`
  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase()
  const studentId = `STU-${student.created_at.slice(0, 4)}-${student.id.slice(-3).toUpperCase()}`
  
  const primaryParent = parents.find(p => p.is_primary) || parents[0]
  const activeSubjects = subjects.filter(s => s.status === 'active')

  return (
    <Card className="w-full max-w-md mx-auto bg-card text-card-foreground">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                {fullName}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Student ID: {studentId}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <IconDotsVertical className="h-4 w-4" />
                <span className="sr-only">Otwórz menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditStudent?.(student)}>
                Edytuj ucznia
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informacje szkolne */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Klasa:</span>
            <p className="font-medium">{student.class || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Szkoła:</span>
            <p className="font-medium">{student.school || "—"}</p>
          </div>
        </div>

        {/* Przedmioty korepetycji */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Przedmioty korepetycji:
          </h4>
          <div className="flex flex-wrap gap-1">
            {activeSubjects.length > 0 ? (
              activeSubjects.map((subject) => (
                <Badge
                  key={subject.id}
                  variant="secondary"
                  className="text-xs"
                  style={subject.color ? { backgroundColor: subject.color + '20', color: subject.color } : undefined}
                >
                  {subject.name}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Brak przypisanych przedmiotów</span>
            )}
          </div>
        </div>

        <Separator />

        {/* Informacje o rodzicu */}
        {primaryParent && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Informacje o rodzicu:
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <IconUser className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {primaryParent.first_name} {primaryParent.last_name}
                </span>
              </div>
              {primaryParent.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <IconPhone className="h-4 w-4 text-muted-foreground" />
                  <span>{primaryParent.phone}</span>
                </div>
              )}
              {primaryParent.email && (
                <div className="flex items-center gap-2 text-sm">
                  <IconMail className="h-4 w-4 text-muted-foreground" />
                  <span>{primaryParent.email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Dodatkowe informacje */}
        <div className="space-y-2 text-sm">
          {student.location && (
            <div className="flex items-center gap-2">
              <IconMapPin className="h-4 w-4 text-muted-foreground" />
              <span>{student.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
            <span>Zapisany {student.enrollment_year || student.created_at.slice(0, 4)}</span>
          </div>
        </div>

        {/* Przyciski akcji */}
        {primaryParent && primaryParent.phone && (
          <div className="pt-2">
            <Button
              size="sm"
              className="w-full"
              onClick={() => onContactParent?.(primaryParent)}
            >
              <IconPhoneCall className="h-4 w-4 mr-2" />
              Skontaktuj się z rodzicem
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
