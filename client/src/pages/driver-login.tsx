import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { driverLoginSchema, type DriverLogin } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, ArrowLeft, UserPlus } from "lucide-react";

export default function DriverLogin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<DriverLogin>({
    resolver: zodResolver(driverLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: DriverLogin) => {
      const response = await apiRequest("POST", "/api/driver/login", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
      });
      navigate("/motorista/painel");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Email ou senha inválidos",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DriverLogin) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header activeTab="passenger" onTabChange={() => {}} />
      
      <main className="container mx-auto px-4 py-8 max-w-md">
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
                <LogIn className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>Login do Motorista</CardTitle>
                <CardDescription>
                  Entre com seu email e senha
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          placeholder="Digite sua senha"
                          {...field}
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="button-submit"
                >
                  {loginMutation.isPending ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Ainda não é motorista parceiro?
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/cadastro-motorista")}
                data-testid="button-register"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastre-se aqui
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
