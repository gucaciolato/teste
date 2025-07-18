import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { addAppointment } from "@/lib/database-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewAppointmentPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get clients and procedures for the select options
  const [clientsResult, proceduresResult] = await Promise.all([
    supabase.from("clients").select("id, name, email").eq("user_id", user.id).eq("active", true).order("name"),
    supabase.from("procedures").select("id, name, price").eq("user_id", user.id).order("name"),
  ])

  const clients = clientsResult.data || []
  const procedures = proceduresResult.data || []

  // Get current date and time for default values
  const now = new Date()
  const defaultDate = now.toISOString().split("T")[0]
  const defaultTime = now.toTimeString().slice(0, 5)

  return (
    <div className="min-h-screen bg-[#161616] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/appointments">
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
            <h1 className="text-3xl font-bold text-white">Novo Agendamento</h1>
            <p className="text-gray-400">Agende um novo procedimento</p>
          </div>
        </div>

        {/* Check if we have clients and procedures */}
        {clients.length === 0 && (
          <Card className="bg-red-500/10 border-red-500/50 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-400">
                Você precisa ter pelo menos um cliente ativo para criar agendamentos.{" "}
                <Link href="/clients/new" className="underline hover:text-red-300">
                  Cadastre um cliente primeiro.
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        {procedures.length === 0 && (
          <Card className="bg-red-500/10 border-red-500/50 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-400">
                Você precisa ter pelo menos um procedimento para criar agendamentos.{" "}
                <Link href="/procedures/new" className="underline hover:text-red-300">
                  Cadastre um procedimento primeiro.
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <Card className="bg-[#1c1c1c] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Informações do Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addAppointment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="client_id" className="block text-sm font-medium text-gray-300">
                    Cliente *
                  </label>
                  <select
                    id="client_id"
                    name="client_id"
                    required
                    className="w-full px-3 py-2 bg-[#161616] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#2b725e]"
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="procedure_id" className="block text-sm font-medium text-gray-300">
                    Procedimento *
                  </label>
                  <select
                    id="procedure_id"
                    name="procedure_id"
                    required
                    className="w-full px-3 py-2 bg-[#161616] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#2b725e]"
                  >
                    <option value="">Selecione um procedimento</option>
                    {procedures.map((procedure) => (
                      <option key={procedure.id} value={procedure.id}>
                        {procedure.name} - R${" "}
                        {procedure.price.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-300">
                    Data *
                  </label>
                  <Input
                    id="appointment_date"
                    name="appointment_date"
                    type="date"
                    required
                    defaultValue={defaultDate}
                    className="bg-[#161616] border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="appointment_time" className="block text-sm font-medium text-gray-300">
                    Horário *
                  </label>
                  <Input
                    id="appointment_time"
                    name="appointment_time"
                    type="time"
                    required
                    defaultValue={defaultTime}
                    className="bg-[#161616] border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-300">
                  Observações
                </label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Observações sobre o agendamento..."
                  className="bg-[#161616] border-gray-700 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="paid"
                  name="paid"
                  value="true"
                  className="rounded border-gray-700 bg-[#161616] text-[#2b725e] focus:ring-[#2b725e]"
                />
                <label htmlFor="paid" className="text-sm text-gray-300">
                  Marcar como pago
                </label>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="flex-1 bg-[#2b725e] hover:bg-[#235e4c]"
                  disabled={clients.length === 0 || procedures.length === 0}
                >
                  Criar Agendamento
                </Button>
                <Link href="/appointments" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                  >
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
