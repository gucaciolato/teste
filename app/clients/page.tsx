import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowLeft, Mail, Phone, MapPin, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { toggleClientStatus } from "@/lib/database-actions"
import type { Client } from "@/lib/types"

export default async function ClientsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching clients:", error)
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
              <h1 className="text-3xl font-bold text-white">Clientes</h1>
              <p className="text-gray-400">Gerencie seus clientes</p>
            </div>
          </div>
          <Link href="/clients/new">
            <Button className="bg-[#2b725e] hover:bg-[#235e4c]">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </Link>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients?.map((client: Client) => (
            <Card key={client.id} className="bg-[#1c1c1c] border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg">{client.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Badge variant={client.active ? "default" : "destructive"}>
                      {client.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-gray-300 text-sm">
                  <Mail className="h-4 w-4 mr-2" />
                  {client.email}
                </div>
                {client.phone && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <Phone className="h-4 w-4 mr-2" />
                    {client.phone}
                  </div>
                )}
                {client.birth_date && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(client.birth_date).toLocaleDateString("pt-BR")}
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    {client.address}
                  </div>
                )}

                {/* Client Stats */}
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Reagendamentos:</span>
                    <span className="text-orange-400">{client.rescheduled_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cancelamentos:</span>
                    <span className="text-red-400">{client.cancelled_count}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-3">
                  <Link href={`/clients/${client.id}/edit`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                    >
                      Editar
                    </Button>
                  </Link>
                  <form action={toggleClientStatus.bind(null, client.id, !client.active)} className="flex-1">
                    <Button
                      type="submit"
                      variant={client.active ? "destructive" : "default"}
                      size="sm"
                      className="w-full"
                    >
                      {client.active ? "Desativar" : "Ativar"}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!clients ||
          (clients.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p>Nenhum cliente cadastrado ainda.</p>
              </div>
              <Link href="/clients/new">
                <Button className="bg-[#2b725e] hover:bg-[#235e4c]">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Cliente
                </Button>
              </Link>
            </div>
          ))}
      </div>
    </div>
  )
}
