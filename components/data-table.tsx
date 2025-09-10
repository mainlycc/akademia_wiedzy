"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StudentCard } from "@/components/student-card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export const schema = z.object({
  id: z.string(),
  imieNazwisko: z.string(),
  przedmiot: z.string(),
  status: z.string(),
  korepetytor: z.string(),
})

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const createColumns = (tutors: Array<{ id: string; first_name: string; last_name: string }>): ColumnDef<z.infer<typeof schema>>[] => [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "imieNazwisko",
    header: "Imię i Nazwisko",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "przedmiot",
    header: "Przedmiot",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.przedmiot}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status === "Zakończone" ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ) : row.original.status === "W trakcie" ? (
          <IconLoader />
        ) : null}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "korepetytor",
    header: "Korepetytor",
    cell: ({ row }) => {
      const isAssigned = row.original.korepetytor !== "Przypisz korepetytora"

      if (isAssigned) {
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            {row.original.korepetytor}
          </div>
        )
      }

      return (
        <>
          <Label htmlFor={`${row.original.id}-korepetytor`} className="sr-only">
            Korepetytor
          </Label>
          <Select onValueChange={(tutorId) => {
            if (!tutorId) return
            
            const assignTutor = async () => {
            const supabase = createSupabaseBrowserClient()
            
            try {
              // Sprawdź czy już istnieje enrollment dla tego ucznia
              const { data: existingEnrollment } = await supabase
                .from("enrollments")
                .select("id")
                .eq("student_id", row.original.id)
                .eq("status", "active")
                .maybeSingle()

              if (existingEnrollment) {
                // Aktualizuj istniejący enrollment
                const { error } = await supabase
                  .from("enrollments")
                  .update({ tutor_id: tutorId })
                  .eq("id", existingEnrollment.id)

                if (error) throw error
              } else {
                // Utwórz nowy enrollment (potrzebujemy subject_id - na razie użyjemy pierwszego dostępnego)
                const { data: firstSubject } = await supabase
                  .from("subjects")
                  .select("id")
                  .eq("active", true)
                  .limit(1)
                  .single()

                if (!firstSubject) {
                  throw new Error("Brak dostępnych przedmiotów")
                }

                const { error } = await supabase
                  .from("enrollments")
                  .insert({
                    student_id: row.original.id,
                    subject_id: firstSubject.id,
                    tutor_id: tutorId,
                    status: "active"
                  })

                if (error) throw error
              }

              toast.success(`Przypisano korepetytora dla ${row.original.imieNazwisko}`)
              
              // Odśwież stronę
              window.location.reload()
            } catch (error) {
              console.error("Błąd przypisywania korepetytora:", error)
              toast.error("Błąd przypisywania korepetytora")
            }
            }
            
            assignTutor()
          }}>
            <SelectTrigger
              className="w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
              id={`${row.original.id}-korepetytor`}
            >
              <SelectValue placeholder="Przypisz korepetytora" />
            </SelectTrigger>
            <SelectContent align="end">
              {tutors.map((tutor) => (
                <SelectItem key={tutor.id} value={tutor.id}>
                  {[tutor.first_name, tutor.last_name].filter(Boolean).join(" ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )
    },
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Otwórz menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edytuj</DropdownMenuItem>
          <DropdownMenuItem>Skopiuj</DropdownMenuItem>
          <DropdownMenuItem>Oznacz jako ulubione</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Usuń</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
  tutors = [],
}: {
  data: z.infer<typeof schema>[]
  tutors?: Array<{ id: string; first_name: string; last_name: string }>
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const columns = createColumns(tutors)
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
            <SelectContent>
              <SelectItem value="outline">Lista korepetycji</SelectItem>
              <SelectItem value="past-performance">Historia</SelectItem>
              <SelectItem value="key-personnel">Korepetytorzy</SelectItem>
              <SelectItem value="focus-documents">Dokumenty</SelectItem>
            </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">Lista korepetycji</TabsTrigger>
          <TabsTrigger value="past-performance">
            Historia <Badge variant="secondary">12</Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel">
            Korepetytorzy <Badge variant="secondary">5</Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">Dokumenty</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Dostosuj kolumny</span>
                <span className="lg:hidden">Kolumny</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Dodaj korepetycję</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} z{" "}
              {table.getFilteredRowModel().rows.length} wybranych korepetycji.
            </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Wierszy na stronę
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Strona {table.getState().pagination.pageIndex + 1} z{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}


// Typy dla danych z Supabase
interface ParentFromDB {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
}

interface SubjectFromDB {
  id: string
  name: string
  color?: string
}

interface TutorFromDB {
  first_name: string
  last_name: string
}

interface StudentParentRelation {
  is_primary: boolean
  relation: 'mother' | 'father' | 'guardian' | 'other'
  parents: ParentFromDB[]
}

interface SupabaseEnrollment {
  id: string
  status: 'active' | 'paused' | 'ended'
  subjects: SubjectFromDB | SubjectFromDB[]
  tutors?: TutorFromDB | TutorFromDB[]
}


// Typy dla StudentCard (muszą pasować do interfejsów w student-card.tsx)
interface StudentCardData {
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

interface ParentCardData {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  relation: 'mother' | 'father' | 'guardian' | 'other'
  is_primary: boolean
}

interface SubjectCardData {
  id: string
  name: string
  color?: string
  tutor_name?: string
  status: 'active' | 'paused' | 'ended'
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()
  const [studentData, setStudentData] = React.useState<StudentCardData | null>(null)
  const [parentsData, setParentsData] = React.useState<ParentCardData[]>([])
  const [subjectsData, setSubjectsData] = React.useState<SubjectCardData[]>([])
  const [loading, setLoading] = React.useState(false)

  const loadStudentData = React.useCallback(async () => {
    if (studentData) return // Już załadowane
    
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    
    try {
      // Pobierz szczegółowe dane ucznia
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("id", item.id)
        .single()

      if (studentError) throw studentError

      // Pobierz rodziców ucznia
      const { data: parents, error: parentsError } = await supabase
        .from("student_parents")
        .select(`
          is_primary,
          relation,
          parents:parent_id (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq("student_id", item.id)

      if (parentsError) throw parentsError

      // Pobierz przedmioty i zapisy ucznia
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select(`
          id,
          status,
          subjects:subject_id (
            id,
            name,
            color
          ),
          tutors:tutor_id (
            first_name,
            last_name
          )
        `)
        .eq("student_id", item.id)

      if (enrollmentsError) throw enrollmentsError

      // Przekształć dane ucznia na format oczekiwany przez StudentCard
      const studentInfo = {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        active: student.active,
        notes: student.notes,
        created_at: student.created_at,
        enrollment_year: new Date(student.created_at).getFullYear().toString(),
        class: "—", // Można dodać pole class do tabeli students
        school: "—", // Można dodać pole school do tabeli students
        location: "—", // Można dodać pole location do tabeli students
      }

      // Przekształć dane rodziców na format oczekiwany przez StudentCard
      const parentsInfo = (parents as StudentParentRelation[] || [])
        .filter((sp) => sp.parents && sp.parents.length > 0)
        .flatMap((sp) => 
          sp.parents.map((parent) => ({
            id: parent.id,
            first_name: parent.first_name,
            last_name: parent.last_name,
            email: parent.email,
            phone: parent.phone,
            relation: sp.relation,
            is_primary: sp.is_primary,
          }))
        )

      // Przekształć dane przedmiotów na format oczekiwany przez StudentCard
      const subjectsInfo = (enrollments as SupabaseEnrollment[] || []).map((enrollment) => {
        // Obsługa przypadku, gdy subjects może być tablicą lub obiektem
        const subject = Array.isArray(enrollment.subjects) 
          ? enrollment.subjects[0] 
          : enrollment.subjects;
        
        // Obsługa przypadku, gdy tutors może być tablicą lub obiektem
        const tutor = Array.isArray(enrollment.tutors) 
          ? enrollment.tutors[0] 
          : enrollment.tutors;
        
        return {
          id: subject?.id,
          name: subject?.name,
          color: subject?.color,
          status: enrollment.status,
          tutor_name: tutor ? 
            `${tutor.first_name} ${tutor.last_name}` : 
            undefined,
        };
      })

      setStudentData(studentInfo)
      setParentsData(parentsInfo)
      setSubjectsData(subjectsInfo)
    } catch (error) {
      console.error("Błąd ładowania danych ucznia:", error)
    } finally {
      setLoading(false)
    }
  }, [item.id, studentData])

  const handleContactParent = (parent: ParentCardData) => {
    if (parent.phone) {
      window.open(`tel:${parent.phone}`)
    } else if (parent.email) {
      window.open(`mailto:${parent.email}`)
    }
  }

  const handleEditStudent = (student: StudentCardData) => {
    console.log("Edytuj ucznia:", student)
    // Tutaj można dodać logikę do edycji ucznia
  }

  return (
    <Drawer direction={isMobile ? "bottom" : "right"} onOpenChange={(open) => {
      if (open) {
        loadStudentData()
      }
    }}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.imieNazwisko}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-md mx-auto">
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Ładowanie danych ucznia...</p>
              </div>
            </div>
          ) : studentData ? (
            <StudentCard
              student={studentData}
              parents={parentsData}
              subjects={subjectsData}
              onContactParent={handleContactParent}
              onEditStudent={handleEditStudent}
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-sm text-muted-foreground">Nie udało się załadować danych ucznia</p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
