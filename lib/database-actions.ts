"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function getSupabase() {
  const cookieStore = cookies()
  return createServerActionClient({ cookies: () => cookieStore })
}

async function requireUser() {
  const supabase = getSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  return { supabase, user }
}

/* ------------------------------------------------------------------ */
/*  Clients                                                           */
/* ------------------------------------------------------------------ */
export async function addClient(formData: FormData) {
  const { supabase, user } = await requireUser()

  const payload = {
    user_id: user.id,
    name: String(formData.get("name")),
    email: String(formData.get("email")),
    phone: (formData.get("phone") as string) ?? null,
    birth_date: (formData.get("birth_date") as string) ?? null,
    address: (formData.get("address") as string) ?? null,
  }

  const { error } = await supabase.from("clients").insert(payload)
  if (error) throw new Error(error.message)

  revalidatePath("/clients")
  return { success: true }
}

export async function updateClient(id: string, formData: FormData) {
  const { supabase } = await requireUser()

  const payload = {
    name: String(formData.get("name")),
    email: String(formData.get("email")),
    phone: (formData.get("phone") as string) ?? null,
    birth_date: (formData.get("birth_date") as string) ?? null,
    address: (formData.get("address") as string) ?? null,
  }

  const { error } = await supabase.from("clients").update(payload).eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/clients")
  return { success: true }
}

export async function toggleClientStatus(id: string, active: boolean) {
  const { supabase } = await requireUser()

  const { error } = await supabase.from("clients").update({ active }).eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/clients")
  return { success: true }
}

/* ------------------------------------------------------------------ */
/*  Procedures                                                        */
/* ------------------------------------------------------------------ */
export async function addProcedure(formData: FormData) {
  const { supabase, user } = await requireUser()

  const payload = {
    user_id: user.id,
    name: String(formData.get("name")),
    price: Number.parseFloat(String(formData.get("price"))),
    description: (formData.get("description") as string) ?? null,
  }

  const { error } = await supabase.from("procedures").insert(payload)
  if (error) throw new Error(error.message)

  revalidatePath("/procedures")
  return { success: true }
}

export async function updateProcedure(id: string, formData: FormData) {
  const { supabase } = await requireUser()

  const payload = {
    name: String(formData.get("name")),
    price: Number.parseFloat(String(formData.get("price"))),
    description: (formData.get("description") as string) ?? null,
  }

  const { error } = await supabase.from("procedures").update(payload).eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/procedures")
  return { success: true }
}

/* ------------------------------------------------------------------ */
/*  Appointments                                                      */
/* ------------------------------------------------------------------ */
export async function addAppointment(formData: FormData) {
  const { supabase, user } = await requireUser()

  const date = String(formData.get("appointment_date"))
  const time = String(formData.get("appointment_time"))
  const datetime = `${date}T${time}:00`

  const payload = {
    user_id: user.id,
    client_id: String(formData.get("client_id")),
    procedure_id: String(formData.get("procedure_id")),
    appointment_date: datetime,
    paid: formData.get("paid") === "true",
    notes: (formData.get("notes") as string) ?? null,
  }

  const { error } = await supabase.from("appointments").insert(payload)
  if (error) throw new Error(error.message)

  revalidatePath("/appointments")
  return { success: true }
}

export async function updateAppointmentStatus(
  id: string,
  status: "scheduled" | "completed" | "cancelled" | "rescheduled",
  paid?: boolean,
) {
  const { supabase } = await requireUser()

  const update: any = { status }
  if (paid !== undefined) update.paid = paid

  const { error } = await supabase.from("appointments").update(update).eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/appointments")
  return { success: true }
}
