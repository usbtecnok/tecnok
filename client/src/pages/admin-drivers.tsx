import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, User, Phone, Mail, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Driver } from "@shared/schema";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function AdminDrivers() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();

  const { data: pendingDrivers = [], isLoading } = useQuery<Driver[]>({
    queryKey: ['/api/driver/pending'],
    enabled: isAuthenticated === true,
  });

  const approveMutation = useMutation({
    mutationFn: async (driverId: string) => {
      return apiRequest("PATCH", `/api/driver/${driverId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver/pending'] });
      toast({
        title: "Motorista aprovado!",
        description: "O motorista agora pode fazer login na plataforma.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao aprovar",
        description: "Não foi possível aprovar o motorista. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Carregando...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Administração de Motoristas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Aprove novos motoristas para que possam acessar a plataforma
          </p>
        </div>

        {pendingDrivers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum motorista pendente
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Todos os motoristas cadastrados já foram aprovados!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingDrivers.map((driver) => (
              <Card key={driver.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {driver.name}
                      </CardTitle>
                      <CardDescription className="text-blue-100 mt-1">
                        Aguardando aprovação
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-500 text-white">
                      <Clock className="h-3 w-3 mr-1" />
                      Pendente
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Telefone:</span>
                        <span>{driver.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Email:</span>
                        <span>{driver.email}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Car className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Veículo:</span>
                        <span>{driver.vehicleModel}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Car className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Placa:</span>
                        <span>{driver.vehiclePlate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => approveMutation.mutate(driver.id)}
                      disabled={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid={`button-approve-${driver.id}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {approveMutation.isPending ? "Aprovando..." : "Aprovar Motorista"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
