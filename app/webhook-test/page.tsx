import { WebhookTest } from "@/components/webhook-test"

export default function WebhookTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Test Webhook n8n</h1>
          <p className="text-muted-foreground">
            Przetestuj integrację z n8n webhookiem dla systemu rezerwacji
          </p>
        </div>
        <WebhookTest />
      </div>
    </div>
  )
}
