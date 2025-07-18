import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Users, Calendar, Scissors, Plus } from "lucide-react"
import { signOut } from "@/lib/actions"
import Link from "next/link"

export default async function Home() {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#161616]">
        <h1 className="text-2xl font-bold mb-4 text-white">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get dashboard stats
  const [clientsResult, proceduresResult, appointmentsResult] = await Promise.all([
    supabase.from("clients").select("id, active").eq("user_id", user.id),
    supabase.from("procedures").select("id").eq("user_id", user.id),
    supabase.from("appointments").select("id, status, appointment_date").eq("user_id", user.id),
  ])

  const totalClients = clientsResult.data?.length || 0
  const activeClients = clientsResult.data?.filter((c) => c.active).length || 0
  const totalProcedures = proceduresResult.data?.length || 0
  const todayAppointments =
    appointmentsResult.data?.filter((a) => {
      const today = new Date().toISOString().split("T")[0]
      return a.appointment_date.startsWith(today)
    }).length || 0

  return (
    <div className="min-h-screen bg-[#161616] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Bem-vindo, {user.email}</p>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#1c1c1c] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalClients}</div>
              <p className="text-xs text-gray-400">{activeClients} ativos</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1c1c] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Procedimentos</CardTitle>
              <Scissors className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalProcedures}</div>
              <p className="text-xs text-gray-400">cadastrados</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1c1c] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{todayAppointments}</div>
              <p className="text-xs text-gray-400">agendamentos</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1c1c] border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Ações Rápidas</CardTitle>
              <Plus className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <Link href="/appointments/new">
                <Button size="sm" className="w-full bg-[#2b725e] hover:bg-[#235e4c]">
                  Novo Agendamento
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/clients">
            <Card className="bg-[#1c1c1c] border-gray-800 hover:bg-[#252525] transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-400" />
                  Gerenciar Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Adicionar, editar e visualizar seus clientes</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/procedures">
            <Card className="bg-[#1c1c1c] border-gray-800 hover:bg-[#252525] transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Scissors className="h-5 w-5 mr-2 text-green-400" />
                  Gerenciar Procedimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Cadastrar e editar seus procedimentos</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/appointments">
            <Card className="bg-[#1c1c1c] border-gray-800 hover:bg-[#252525] transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-400" />
                  Agenda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Visualizar e gerenciar agendamentos</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
