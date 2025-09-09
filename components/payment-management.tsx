"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import { 
  Bell, 
  FileText, 
  Send, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle,
  Plus,
} from "lucide-react"

interface PaymentData {
  name: string
  [key: string]: unknown
}

interface PaymentItem extends PaymentData {
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'cancelled'
  amount: number
  dueDate: string
  lastReminder: string | null
}

// Rozszerzamy dane o status płatności
const addPaymentStatus = (data: PaymentData[]): PaymentItem[] => {
  return data.map((item, index) => ({
    ...item,
    paymentStatus: index % 4 === 0 ? 'paid' : index % 4 === 1 ? 'pending' : index % 4 === 2 ? 'overdue' : 'cancelled',
    amount: Math.floor(Math.random() * 500) + 100,
    dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lastReminder: index % 3 === 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
  }))
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Opłacone</Badge>
    case 'pending':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Oczekujące</Badge>
    case 'overdue':
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Przeterminowane</Badge>
    case 'cancelled':
      return <Badge variant="outline" className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Anulowane</Badge>
    default:
      return <Badge variant="outline">Nieznany</Badge>
  }
}

const getStatusCounts = (data: PaymentItem[]) => {
  const counts = data.reduce((acc, item) => {
    acc[item.paymentStatus] = (acc[item.paymentStatus] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    paid: counts.paid || 0,
    pending: counts.pending || 0,
    overdue: counts.overdue || 0,
    cancelled: counts.cancelled || 0,
    total: data.length
  }
}

interface PaymentManagementProps {
  data: PaymentData[]
}

export function PaymentManagement({ data }: PaymentManagementProps) {
  const [selectedRows, setSelectedRows] = useState<PaymentItem[]>([])
  const [activeTab, setActiveTab] = useState("all")
  
  const dataWithPayments = addPaymentStatus(data)
  const statusCounts = getStatusCounts(dataWithPayments)
  
  const filteredData = activeTab === "all" 
    ? dataWithPayments 
    : dataWithPayments.filter(item => item.paymentStatus === activeTab)

  const handleRemindPayment = () => {
    console.log("Wysyłanie przypomnienia o płatności dla:", selectedRows.map(row => row.name))
    // Tutaj będzie logika wysyłania przypomnienia
  }

  const handleGenerateInvoice = () => {
    console.log("Generowanie faktury dla:", selectedRows.map(row => row.name))
    // Tutaj będzie logika generowania faktury
  }

  const handleSendInvoice = () => {
    console.log("Wysyłanie faktury dla:", selectedRows.map(row => row.name))
    // Tutaj będzie logika wysyłania faktury
  }

  const handleDownloadReport = () => {
    console.log("Pobieranie raportu płatności")
    // Tutaj będzie logika pobierania raportu
  }

  return (
    <div className="space-y-6">
      {/* Statystyki płatności */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wszystkie</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Opłacone</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.paid}</p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Oczekujące</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Przeterminowane</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.overdue}</p>
              </div>
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Anulowane</p>
                <p className="text-2xl font-bold text-gray-600">{statusCounts.cancelled}</p>
              </div>
              <XCircle className="h-4 w-4 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Akcje płatności */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Akcje płatności</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                <Download className="h-4 w-4 mr-2" />
                Pobierz raport
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Dodaj płatność
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={handleRemindPayment}
              disabled={selectedRows.length === 0}
            >
              <Bell className="h-4 w-4 mr-2" />
              Przypomnij o płatności ({selectedRows.length})
            </Button>
            <Button 
              variant="outline" 
              onClick={handleGenerateInvoice}
              disabled={selectedRows.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Wygeneruj fakturę ({selectedRows.length})
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSendInvoice}
              disabled={selectedRows.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Wyślij fakturę ({selectedRows.length})
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Podgląd faktury
            </Button>
          </div>
          {selectedRows.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Wybrano {selectedRows.length} {selectedRows.length === 1 ? 'płatność' : 'płatności'}: 
                {selectedRows.map(row => ` ${row.name}`).join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela z filtrami */}
      <Card>
        <CardHeader>
          <CardTitle>Lista płatności</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Wszystkie ({statusCounts.total})</TabsTrigger>
              <TabsTrigger value="paid">Opłacone ({statusCounts.paid})</TabsTrigger>
              <TabsTrigger value="pending">Oczekujące ({statusCounts.pending})</TabsTrigger>
              <TabsTrigger value="overdue">Przeterminowane ({statusCounts.overdue})</TabsTrigger>
              <TabsTrigger value="cancelled">Anulowane ({statusCounts.cancelled})</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-4">
                {/* Dodatkowe informacje o płatnościach w tabeli */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {filteredData.slice(0, 4).map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.name}</span>
                        {getStatusBadge(item.paymentStatus)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Kwota: {item.amount} zł</p>
                        <p>Termin: {item.dueDate}</p>
                        {item.lastReminder && (
                          <p>Ostatnie przypomnienie: {item.lastReminder}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Tabela z danymi */}
                <DataTable 
                  data={filteredData.map(item => ({
                    id: item.id || Math.random(),
                    imieNazwisko: item.name,
                    przedmiot: item.przedmiot || 'Nieznany',
                    poziom: item.poziom || 'Nieznany',
                    status: item.paymentStatus === 'paid' ? 'Zakończone' : 
                            item.paymentStatus === 'pending' ? 'W trakcie' :
                            item.paymentStatus === 'overdue' ? 'Przeterminowane' : 'Anulowane',
                    liczbaGodzin: item.liczbaGodzin || 0,
                    korepetytor: item.korepetytor || 'Nieprzypisany'
                  }))} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
