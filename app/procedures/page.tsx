import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ArrowLeft, Scissors, DollarSign } from "lucide-react"
import Link from "next/link"
import type { Procedure } from "@/lib/types"

export default async function ProceduresPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: procedures, error } = await supabase
    .from("procedures")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching procedures:", error)
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
              <h1 className="text-3xl font-bold text-white">Procedimentos</h1>
              <p className="text-gray-400">Gerencie seus procedimentos</p>
            </div>
          </div>
          <Link href="/procedures/new">
            <Button className="bg-[#2b725e] hover:bg-[#235e4c]">
              <Plus className="h-4 w-4 mr-2" />
              Novo Procedimento
            </Button>
          </Link>
        </div>

        {/* Procedures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {procedures?.map((procedure: Procedure) => (
            <Card key={procedure.id} className="bg-[#1c1c1c] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center">
                  <Scissors className="h-5 w-5 mr-2 text-green-400" />
                  {procedure.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-green-400 text-xl font-bold">
                  <DollarSign className="h-5 w-5 mr-1" />
                  {procedure.price.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>

                {procedure.description && <p className="text-gray-300 text-sm">{procedure.description}</p>}

                <div className="text-xs text-gray-500">
                  Criado em {new Date(procedure.created_at).toLocaleDateString("pt-BR")}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-3">
                  <Link href={`/procedures/${procedure.id}/edit`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                    >
                      Editar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!procedures ||
          (procedures.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Scissors className="h-12 w-12 mx-auto mb-4" />
                <p>Nenhum procedimento cadastrado ainda.</p>
              </div>
              <Link href="/procedures/new">
                <Button className="bg-[#2b725e] hover:bg-[#235e4c]">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Procedimento
                </Button>
              </Link>
            </div>
          ))}
      </div>
    </div>
  )
}
