import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { addClient } from "@/lib/database-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewClientPage() {
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
          <Link href="/clients">
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
            <h1 className="text-3xl font-bold text-white">Novo Cliente</h1>
            <p className="text-gray-400">Cadastre um novo cliente</p>
          </div>
        </div>

        {/* Form */}
        <Card className="bg-[#1c1c1c] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addClient} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Nome Completo *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="bg-[#161616] border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="bg-[#161616] border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                    Telefone
                  </label>
                  <Input id="phone" name="phone" type="tel" className="bg-[#161616] border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="birth_date" className="block text-sm font-medium text-gray-300">
                    Data de Nascimento
                  </label>
                  <Input
                    id="birth_date"
                    name="birth_date"
                    type="date"
                    className="bg-[#161616] border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-300">
                  Endereço
                </label>
                <Textarea id="address" name="address" rows={3} className="bg-[#161616] border-gray-700 text-white" />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1 bg-[#2b725e] hover:bg-[#235e4c]">
                  Cadastrar Cliente
                </Button>
                <Link href="/clients" className="flex-1">
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
