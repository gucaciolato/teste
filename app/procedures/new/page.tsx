import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { addProcedure } from "@/lib/database-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewProcedurePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-[#161616] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/procedures">
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
            <h1 className="text-3xl font-bold text-white">Novo Procedimento</h1>
            <p className="text-gray-400">Cadastre um novo procedimento</p>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-[#1c1c1c] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Informações do Procedimento</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addProcedure} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Nome do Procedimento *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Ex: Corte de Cabelo, Manicure, etc."
                  className="bg-[#161616] border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-300">
                  Preço (R$) *
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="bg-[#161616] border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                  Descrição
                </label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Descreva o procedimento, tempo estimado, etc."
                  className="bg-[#161616] border-gray-700 text-white"
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1 bg-[#2b725e] hover:bg-[#235e4c]">
                  Cadastrar Procedimento
                </Button>
                <Link href="/procedures" className="flex-1">
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
