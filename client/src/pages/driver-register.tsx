import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { insertDriverSchema, type InsertDriver } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, ArrowLeft } from "lucide-react";
import { z } from "zod";

const driverRegisterSchema = insertDriverSchema.extend({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  vehicleModel: z.string().min(2, "Modelo do veículo é obrigatório"),
  vehiclePlate: z.string().min(7, "Placa deve ter pelo menos 7 caracteres"),
  pixKey: z.string().min(11, "Chave Pix é obrigatória (CPF, CNPJ, email ou telefone)"),
  termsAccepted: z.literal(1, { errorMap: () => ({ message: "Você deve aceitar os termos para continuar" }) }),
});

export default function DriverRegister() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<InsertDriver>({
    resolver: zodResolver(driverRegisterSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      vehicleModel: "",
      vehiclePlate: "",
      pixKey: "",
      termsAccepted: undefined,
      isOnline: 0,
      latitude: "",
      longitude: "",
    },
  });

  const createDriverMutation = useMutation({
    mutationFn: async (data: InsertDriver) => {
      return await apiRequest("POST", "/api/driver", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      toast({
        title: "Cadastro enviado!",
        description: "Seu cadastro foi realizado com sucesso. Aguarde a aprovação do administrador para fazer login.",
      });
      form.reset();
      setTimeout(() => navigate("/motorista/login"), 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertDriver) => {
    createDriverMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header activeTab="passenger" onTabChange={() => {}} />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>Cadastro de Motorista</CardTitle>
                <CardDescription>
                  Preencha os dados abaixo. Após o cadastro, aguarde a aprovação para fazer login.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite seu nome completo"
                          {...field}
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="(21) 98765-4321"
                          {...field}
                          data-testid="input-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          {...field}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          {...field}
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo do Veículo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Fiat Uno, Volkswagen Gol"
                          {...field}
                          data-testid="input-vehicle-model"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehiclePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa do Veículo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ABC-1234"
                          {...field}
                          data-testid="input-vehicle-plate"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pixKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chave Pix</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="CPF, CNPJ, email ou telefone"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-pix-key"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  <h3 className="font-semibold mb-3 text-sm">Termos e Condições</h3>
                  <div className="text-xs text-muted-foreground space-y-2 mb-4">
                    <p>
                      • Será descontado <strong>R$ 1,00</strong> por cada corrida efetuada como taxa da plataforma.
                    </p>
                    <p>
                      • Você pode solicitar o saque dos valores acumulados a qualquer momento através do painel do motorista.
                    </p>
                    <p>
                      • A tecnok não se responsabiliza por avarias, roubos, acidentes envolvendo feridos ou morte.
                    </p>
                    <p>
                      • Não há vínculo empregatício entre você e a tecnok. Você é um prestador de serviço autônomo.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value === 1}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? 1 : undefined);
                            }}
                            data-testid="checkbox-terms"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium">
                            Li e aceito os termos e condições
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createDriverMutation.isPending}
                  data-testid="button-submit"
                >
                  {createDriverMutation.isPending ? "Cadastrando..." : "Cadastrar Motorista"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
