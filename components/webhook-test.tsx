"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WebhookService } from "@/lib/webhook"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export function WebhookTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message?: string
    error?: string
  } | null>(null)

  const [testData, setTestData] = useState({
    studentName: "Jan Kowalski",
    parentName: "Anna Kowalska",
    email: "test@example.com",
    phone: "+48 600 000 000",
    subject: "Matematyka",
    level: "Średni",
    note: "Test rezerwacji z webhookiem"
  })

  const handleTestWebhook = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const webhookData = WebhookService.createBookingData({
        reservationId: `test_${Date.now()}`,
        studentName: testData.studentName,
        parentName: testData.parentName,
        email: testData.email,
        phone: testData.phone,
        subject: {
          id: "math",
          name: testData.subject,
          icon: "📐"
        },
        level: {
          id: "intermediate",
          name: testData.level,
          description: "Klasy 7-9"
        },
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Jutro
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Jutro + 1h
        note: testData.note,
        status: "confirmed"
      })

      const response = await WebhookService.sendBookingData(webhookData)
      setResult(response)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Nieznany błąd"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Test Webhook n8n
          <span className="text-sm text-muted-foreground">
            (https://n8nn.bibliotekapromptow.pl/webhook-test/...)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="studentName">Imię i nazwisko dziecka</Label>
            <Input
              id="studentName"
              value={testData.studentName}
              onChange={(e) => setTestData(prev => ({ ...prev, studentName: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="parentName">Imię i nazwisko rodzica</Label>
            <Input
              id="parentName"
              value={testData.parentName}
              onChange={(e) => setTestData(prev => ({ ...prev, parentName: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={testData.email}
              onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={testData.phone}
              onChange={(e) => setTestData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="subject">Przedmiot</Label>
            <Input
              id="subject"
              value={testData.subject}
              onChange={(e) => setTestData(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="level">Poziom</Label>
            <Input
              id="level"
              value={testData.level}
              onChange={(e) => setTestData(prev => ({ ...prev, level: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="note">Notatka</Label>
          <Input
            id="note"
            value={testData.note}
            onChange={(e) => setTestData(prev => ({ ...prev, note: e.target.value }))}
          />
        </div>

        <Button 
          onClick={handleTestWebhook} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wysyłanie...
            </>
          ) : (
            "Wyślij test do n8n"
          )}
        </Button>

        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="font-medium">
                {result.success ? 'Sukces!' : 'Błąd!'}
              </span>
            </div>
            <p className="mt-1 text-sm">
              {result.message || result.error}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>URL webhooka:</strong> https://n8nn.bibliotekapromptow.pl/webhook-test/4458b423-a920-48b9-b9a2-124f18d1c5b8</p>
          <p><strong>Metoda:</strong> POST</p>
          <p><strong>Content-Type:</strong> application/json</p>
        </div>
      </CardContent>
    </Card>
  )
}
