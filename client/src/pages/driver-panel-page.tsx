import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { type Driver, type Payment } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LogOut, Loader2, Wallet, TrendingUp, DollarSign, Minus, CheckCircle, Calendar } from "lucide-react";
import DriverPanel from "@/components/driver-panel";
import { format } from "date-fns";

export default function DriverPanelPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: driver, isLoading, error } = useQuery<Driver>({
    queryKey: ["/api/driver/me"],
    retry: false,
  });

  const { data: earnings } = useQuery<{
    completedRides: number;
    totalEarnings: number;
    platformFee: number;
    netEarnings: number;
    pixKey: string | null;
  }>({
    queryKey: [`/api/driver/earnings/${driver?.id}`],
    enabled: !!driver?.id,
  });

  const { data: payments } = useQuery<Payment[]>({
    queryKey: [`/api/driver/payments/${driver?.id}`],
    enabled: !!driver?.id,
  });

  useEffect(() => {
    if (error) {
      navigate("/motorista/login");
    }
  }, [error, navigate]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/driver/logout", {});
      toast({
        title: "Logout realizado",
        description: "Até breve!",
      });
      navigate("/motorista/login");
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!driver) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header activeTab="driver" onTabChange={() => {}} />
      
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Bem-vindo, {driver.name}!</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {driver.email}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Veículo</p>
                <p className="font-medium">{driver.vehicleModel}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Placa</p>
                <p className="font-medium">{driver.vehiclePlate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Seus Ganhos</CardTitle>
                <CardDescription>
                  Resumo financeiro das suas corridas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {earnings ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Corridas</p>
                    </div>
                    <p className="text-2xl font-bold" data-testid="text-completed-rides">
                      {earnings.completedRides}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Total Ganho</p>
                    </div>
                    <p className="text-2xl font-bold" data-testid="text-total-earnings">
                      R$ {earnings.totalEarnings.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Minus className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Taxa Plataforma</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-platform-fee">
                      R$ {earnings.platformFee.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4 text-primary" />
                      <p className="text-xs font-medium text-primary">A Receber</p>
                    </div>
                    <p className="text-2xl font-bold text-primary" data-testid="text-net-earnings">
                      R$ {earnings.netEarnings.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
                {earnings.pixKey && (
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Sua Chave Pix</p>
                    <p className="font-medium text-sm" data-testid="text-driver-pix-key">
                      {earnings.pixKey}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Entre em contato com a administração para solicitar o saque dos seus ganhos.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Carregando informações financeiras...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>Pagamentos Recebidos</CardTitle>
                <CardDescription>
                  Histórico de pagamentos realizados pela plataforma
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {payments === undefined ? (
              <div className="text-center py-4 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Carregando histórico...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhum pagamento recebido ainda</p>
                <p className="text-xs mt-1">
                  Entre em contato com a administração para solicitar seu saque
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    data-testid={`payment-${payment.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          Pagamento via Pix
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Chave: {payment.pixKey}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {format(new Date(payment.paidAt), "dd/MM/yyyy 'às' HH:mm")}
                          </span>
                        </div>
                        {payment.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {payment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        R$ {parseFloat(payment.amount.toString()).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <DriverPanel />
      </div>

      <Footer />
    </div>
  );
}
