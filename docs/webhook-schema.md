# Schema Webhook n8n - System Rezerwacji

## URL Webhooka
```
POST https://n8nn.bibliotekapromptow.pl/webhook-test/4458b423-a920-48b9-b9a2-124f18d1c5b8
```

## Content-Type
```
application/json
```

## Przykład JSON-a wysyłanego do webhooka

```json
{
  "reservationId": "res_1703123456789_abc123def",
  "studentName": "Jan Kowalski",
  "parentName": "Anna Kowalska",
  "email": "rodzic@example.com",
  "phone": "+48 600 000 000",
  "subject": {
    "id": "math",
    "name": "Matematyka",
    "icon": "📐"
  },
  "level": {
    "id": "intermediate",
    "name": "Średni",
    "description": "Klasy 7-9"
  },
  "startTime": "2024-01-15T16:00:00.000Z",
  "endTime": "2024-01-15T17:00:00.000Z",
  "date": "2024-01-15",
  "note": "Preferuję zajęcia online",
  "status": "confirmed",
  "timestamp": "2024-01-14T10:30:00.000Z",
  "source": "calendar_booking"
}
```

## Opis pól

### Dane rezerwacji
- `reservationId` (string) - Unikalne ID rezerwacji
- `studentName` (string) - Imię i nazwisko ucznia
- `parentName` (string) - Imię i nazwisko rodzica
- `email` (string) - Email kontaktowy
- `phone` (string) - Numer telefonu

### Dane lekcji
- `subject` (object) - Przedmiot
  - `id` (string) - ID przedmiotu
  - `name` (string) - Nazwa przedmiotu
  - `icon` (string) - Emoji ikona
- `level` (object) - Poziom
  - `id` (string) - ID poziomu
  - `name` (string) - Nazwa poziomu
  - `description` (string) - Opis poziomu

### Termin
- `startTime` (string) - Czas rozpoczęcia (ISO 8601)
- `endTime` (string) - Czas zakończenia (ISO 8601)
- `date` (string) - Data w formacie YYYY-MM-DD

### Dodatkowe informacje
- `note` (string, optional) - Dodatkowe uwagi
- `status` (string) - Status rezerwacji: "confirmed", "pending", "cancelled"

### Metadane
- `timestamp` (string) - Czas utworzenia rezerwacji (ISO 8601)
- `source` (string) - Źródło rezerwacji: "calendar_booking"

## Przykład anulowania rezerwacji

```json
{
  "reservationId": "res_1703123456789_abc123def",
  "status": "cancelled",
  "reason": "Zmiana planów",
  "cancelledBy": "student",
  "timestamp": "2024-01-14T15:30:00.000Z",
  "source": "calendar_cancellation"
}
```

## Testowanie

Możesz przetestować webhook na stronie:
```
http://localhost:3000/webhook-test
```

## Obsługa błędów

Webhook zwraca odpowiedź w formacie:
```json
{
  "success": true,
  "message": "Dane rezerwacji zostały wysłane do n8n"
}
```

lub w przypadku błędu:
```json
{
  "success": false,
  "error": "Opis błędu"
}
```
