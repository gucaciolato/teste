import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowLeft, Calendar, Clock, User, Scissors, DollarSign } from "lucide-react"
import Link from "next/link"
import { updateAppointmentStatus } from "@/lib/database-actions"

export default async function AppointmentsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select(
      `
      id,
      appointment_date,
      paid,
      status,
      notes,
      client:clients!appointments_client_id_fkey (
        id,
        name,
        email
      ),
      procedure:procedures!appointments_procedure_id_fkey (
        id,
        name,
        price
      )
    `,
    )
    .eq("user_id", user.id)
    .order("appointment_date", { ascending: true })

  if (error) {
    console.error("Error fetching appointments:", error)
  }

  // Group appointments by date
  const groupedAppointments = appointments?.reduce((groups: any, appointment: any) => {
    const date = new Date(appointment.appointment_date).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(appointment)
    return groups
  }, {})

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      case "rescheduled":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendado"
      case "completed":
        return "Concluído"
      case "cancelled":
        return "Cancelado"
      case "rescheduled":
        return "Reagendado"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-[#161616] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Agenda</h1>
              <p className="text-gray-400">Gerencie seus agendamentos</p>
            </div>
          </div>
          <Link href="/appointments/new">
            <Button className="bg-[#2b725e] hover:bg-[#235e4c]">
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </Link>
        </div>

        {/* Appointments by Date */}
        <div className="space-y-8">
          {groupedAppointments &&
            Object.keys(groupedAppointments).map((dateString) => {
              const date = new Date(dateString)
              const isToday = date.toDateString() === new Date().toDateString()
              const isPast = date < new Date() && !isToday

              return (
                <div key={dateString}>
                  <div className="flex items-center space-x-3 mb-4">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    <h2
                      className={`text-xl font-semibold ${isToday ? "text-green-400" : isPast ? "text-gray-500" : "text-white"}`}
                    >
                      {isToday
                        ? "Hoje"
                        : date.toLocaleDateString("pt-BR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                    </h2>
                    {isToday && <Badge className="bg-green-500">Hoje</Badge>}
                    {isPast && <Badge variant="secondary">Passado</Badge>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedAppointments[dateString].map((appointment: any) => (
                      <Card key={appointment.id} className="bg-[#1c1c1c] border-gray-800">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-purple-400" />
                              <span className="text-white font-medium">
                                {new Date(appointment.appointment_date).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusText(appointment.status)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center text-gray-300">
                            <User className="h-4 w-4 mr-2" />
                            <span className="font-medium">{appointment.client?.name}</span>
                          </div>

                          <div className="flex items-center text-gray-300">
                            <Scissors className="h-4 w-4 mr-2" />
                            <span>{appointment.procedure?.name}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-green-400">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span className="font-medium">
                                R${" "}
                                {appointment.procedure?.price?.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <Badge variant={appointment.paid ? "default" : "destructive"}>
                              {appointment.paid ? "Pago" : "Pendente"}
                            </Badge>
                          </div>

                          {appointment.notes && <p className="text-gray-400 text-sm italic">{appointment.notes}</p>}

                          {/* Quick Actions */}
                          <div className="flex space-x-2 pt-3 border-t border-gray-700">
                            {appointment.status === "scheduled" && (
                              <>
                                <form
                                  action={updateAppointmentStatus.bind(null, appointment.id, "completed", true)}
                                  className="flex-1"
                                >
                                  <Button type="submit" size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                    Concluir
                                  </Button>
                                </form>
                                <form
                                  action={updateAppointmentStatus.bind(null, appointment.id, "cancelled")}
                                  className="flex-1"
                                >
                                  <Button type="submit" size="sm" variant="destructive" className="w-full">
                                    Cancelar
                                  </Button>
                                </form>
                              </>
                            )}

                            {!appointment.paid && appointment.status !== "cancelled" && (
                              <form
                                action={updateAppointmentStatus.bind(null, appointment.id, appointment.status, true)}
                                className="flex-1"
                              >
                                <Button
                                  type="submit"
                                  size="sm"
                                  variant="outline"
                                  className="w-full border-green-600 text-green-400 hover:bg-green-600 hover:text-white bg-transparent"
                                >
                                  Marcar Pago
                                </Button>
                              </form>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
        </div>

        {/* Empty State */}
        {!appointments ||
          (appointments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p>Nenhum agendamento encontrado.</p>
              </div>
              <Link href="/appointments/new">
                <Button className="bg-[#2b725e] hover:bg-[#235e4c]">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Agendamento
                </Button>
              </Link>
            </div>
          ))}
      </div>
    </div>
  )
}
