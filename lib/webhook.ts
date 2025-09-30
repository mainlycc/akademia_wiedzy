interface BookingWebhookData {
  // Dane rezerwacji
  reservationId: string
  studentName: string
  parentName: string
  email: string
  phone: string
  
  // Dane lekcji
  subject: {
    id: string
    name: string
    icon: string
  }
  level: {
    id: string
    name: string
    description: string
  }
  
  // Termin
  startTime: string
  endTime: string
  date: string
  
  // Dodatkowe informacje
  note?: string
  status: 'confirmed' | 'pending' | 'cancelled'
  
  // Metadane
  timestamp: string
  source: 'calendar_booking'
}

interface WebhookResponse {
  success: boolean
  message?: string
  error?: string
}

export class WebhookService {
  private static readonly N8N_WEBHOOK_URL = 'https://n8nn.bibliotekapromptow.pl/webhook/4458b423-a920-48b9-b9a2-124f18d1c5b8'
  
  /**
   * Wysyła dane rezerwacji do n8n webhook
   */
  static async sendBookingData(data: BookingWebhookData): Promise<WebhookResponse> {
    try {
      console.log('Wysyłanie danych rezerwacji do n8n:', data)
      
      const response = await fetch(this.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      console.log('Odpowiedź z n8n:', result)
      
      return {
        success: true,
        message: 'Dane rezerwacji zostały wysłane do n8n'
      }
    } catch (error) {
      console.error('Błąd podczas wysyłania danych do n8n:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Nieznany błąd'
      }
    }
  }

  /**
   * Tworzy strukturę danych rezerwacji dla webhooka
   */
  static createBookingData({
    reservationId,
    studentName,
    parentName,
    email,
    phone,
    subject,
    level,
    startTime,
    endTime,
    note,
    status = 'confirmed'
  }: {
    reservationId: string
    studentName: string
    parentName: string
    email: string
    phone: string
    subject: { id: string; name: string; icon: string }
    level: { id: string; name: string; description: string }
    startTime: string
    endTime: string
    note?: string
    status?: 'confirmed' | 'pending' | 'cancelled'
  }): BookingWebhookData {
    const startDate = new Date(startTime)
    
    return {
      reservationId,
      studentName,
      parentName,
      email,
      phone,
      subject,
      level,
      startTime,
      endTime,
      date: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
      note,
      status,
      timestamp: new Date().toISOString(),
      source: 'calendar_booking'
    }
  }

  /**
   * Wysyła powiadomienie o anulowaniu rezerwacji
   */
  static async sendCancellationData({
    reservationId,
    reason,
    cancelledBy
  }: {
    reservationId: string
    reason?: string
    cancelledBy: 'student' | 'tutor' | 'admin'
  }): Promise<WebhookResponse> {
    try {
      const data = {
        reservationId,
        status: 'cancelled' as const,
        reason,
        cancelledBy,
        timestamp: new Date().toISOString(),
        source: 'calendar_cancellation'
      }

      const response = await fetch(this.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return {
        success: true,
        message: 'Dane anulowania zostały wysłane do n8n'
      }
    } catch (error) {
      console.error('Błąd podczas wysyłania danych anulowania:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Nieznany błąd'
      }
    }
  }
}
