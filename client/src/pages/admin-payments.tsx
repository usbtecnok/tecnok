import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function AdminPayments() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();

  const { data: allRides, refetch, isLoading } = useQuery({
    queryKey: ["/api/rides"],
    enabled: isAuthenticated === true,
  });

  const { data: allDrivers } = useQuery({
    queryKey: ["/api/drivers/all"],
    enabled: isAuthenticated === true,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const calculateDriverEarnings = () => {
    if (!allRides || !allDrivers || !Array.isArray(allDrivers)) return [];

    return allDrivers.map((driver: any) => {
      const driverRides = Array.isArray(allRides) 
        ? allRides.filter((ride: any) => ride.driverId === driver.id && ride.status === 'completed')
        : [];

      const totalRides = driverRides.length;
      const totalEarnings = driverRides.reduce((sum: number, ride: any) => {
        if (!ride.estimatedPrice) return sum;
        const priceStr = ride.estimatedPrice
          .replace('R$', '')
          .replace('*', '')
          .replace(',', '.')
          .trim();
        return sum + parseFloat(priceStr);
      }, 0);

      const platformFee = totalRides * 1.00;
      const netAmount = totalEarnings - platformFee;

      return {
        ...driver,
        totalRides,
        totalEarnings,
        platformFee,
        netAmount
      };
    }).filter((d: any) => d.totalRides > 0);
  };

  const driverEarnings = calculateDriverEarnings();
  const totalPlatformFees = driverEarnings.reduce((sum: number, d: any) => sum + d.platformFee, 0);
  const totalToPayDrivers = driverEarnings.reduce((sum: number, d: any) => sum + d.netAmount, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Pagamentos aos Motoristas</h1>
            <p className="text-muted-foreground">Valores a receber por motorista</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="w-5 h-5 mr-2 text-primary" />
                Total a Pagar aos Motoristas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                R$ {totalToPayDrivers.toFixed(2).replace('.', ',')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Taxas da Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                R$ {totalPlatformFees.toFixed(2).replace('.', ',')}
              </p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : driverEarnings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum motorista com corridas completadas ainda.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {driverEarnings.map((driver: any) => (
              <Card key={driver.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{driver.name}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>📧 {driver.email}</p>
                        <p>🚗 {driver.vehicleModel} - {driver.vehiclePlate}</p>
                        {driver.pixKey && <p>💳 PIX: {driver.pixKey}</p>}
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Corridas Completadas</p>
                        <p className="text-2xl font-bold">{driver.totalRides}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ganhos Totais</p>
                        <p className="text-lg font-semibold text-green-600">
                          R$ {driver.totalEarnings.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa da Plataforma</p>
                        <p className="text-sm font-medium text-red-600">
                          - R$ {driver.platformFee.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">A Receber</p>
                        <p className="text-2xl font-bold text-primary">
                          R$ {driver.netAmount.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
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
