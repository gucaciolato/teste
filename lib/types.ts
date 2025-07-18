export interface Client {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
  birth_date?: string
  address?: string
  active: boolean
  rescheduled_count: number
  cancelled_count: number
  created_at: string
  updated_at: string
}

export interface Procedure {
  id: string
  user_id: string
  name: string
  price: number
  description?: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  user_id: string
  client_id: string
  procedure_id: string
  appointment_date: string
  paid: boolean
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"
  notes?: string
  created_at: string
  updated_at: string
  client?: Client
  procedure?: Procedure
}
