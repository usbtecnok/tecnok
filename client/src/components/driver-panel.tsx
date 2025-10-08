import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { UserCircle, List, RefreshCw, Car, Users, Clock, DollarSign, Circle, MapPin, Bell, BellOff, CheckCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import PixPaymentModal from "./pix-payment-modal";
import CreditRechargeModal from "./credit-recharge-modal";
import type { Driver } from "@shared/schema";

export default function DriverPanel() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [driverStatus, setDriverStatus] = useState("online");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const previousRideIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [creditRechargeModalOpen, setCreditRechargeModalOpen] = useState(false);
  const [completedRideForPayment, setCompletedRideForPayment] = useState<any>(null);
  const [acceptingRideIds, setAcceptingRideIds] = useState<Set<string>>(new Set());
  const [decliningRideIds, setDecliningRideIds] = useState<Set<string>>(new Set());
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(() => {
    // Load from localStorage or use first driver (with SSR safety check)
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedDriverId") || null;
    }
    return null;
  });

  // Get current authenticated driver
  const { data: currentDriver, isLoading: driverLoading, error: driverError } = useQuery<Driver>({
    queryKey: ["/api/driver/me"],
    retry: false,
  });
  const driverId = currentDriver?.id;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (driverError && !driverLoading) {
      toast({
        title: "Sessão expirada",
        description: "Faça login novamente para continuar",
        variant: "destructive",
      });
      navigate("/motorista/login");
    }
  }, [driverError, driverLoading, navigate, toast]);

  // Save selected driver to localStorage and update selection when drivers load
  useEffect(() => {
    if (currentDriver?.id) {
      setSelectedDriverId(currentDriver.id);
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedDriverId", currentDriver.id);
      }
    }
  }, [currentDriver?.id]);

  const { data: pendingRides, isLoading: ridesLoading } = useQuery({
    queryKey: ["/api/rides/pending"],
    refetchInterval: 3000, // Poll every 3 seconds
  });

  const { data: activeRides, isLoading: activeRidesLoading } = useQuery({
    queryKey: ["/api/driver/rides/active", driverId],
    queryFn: async () => {
      const response = await fetch(`/api/driver/rides/active?driverId=${driverId}`);
      if (!response.ok) throw new Error("Failed to fetch active rides");
      return response.json();
    },
    enabled: !!driverId,
    refetchInterval: 5000,
  });

  // Removed - driver panel doesn't need all drivers or all rides

  const { data: creditsData } = useQuery({
    queryKey: ["/api/driver", driverId, "credits"],
    queryFn: async () => {
      const response = await fetch(`/api/driver/${driverId}/credits`);
      if (!response.ok) throw new Error("Failed to fetch credits");
      return response.json();
    },
    enabled: !!driverId,
    refetchInterval: 5000,
  });

  const { data: creditPurchases } = useQuery({
    queryKey: ["/api/driver", driverId, "credit-purchases"],
    queryFn: async () => {
      const response = await fetch(`/api/driver/${driverId}/credit-purchases`);
      if (!response.ok) throw new Error("Failed to fetch credit purchases");
      return response.json();
    },
    enabled: !!driverId,
  });

  // Driver ride history is now fetched from /api/driver/rides/:driverId endpoint if needed

  // Update driver status based on current driver
  useEffect(() => {
    if (currentDriver) {
      setDriverStatus(currentDriver.isOnline === 1 ? "online" : "offline");
    }
  }, [currentDriver]);

  const acceptRideMutation = useMutation({
    mutationFn: async ({ rideId }: { rideId: string }) => {
      console.log("🚀 Tentando aceitar corrida:", { rideId });
      setAcceptingRideIds(prev => new Set(prev).add(rideId));
      
      const response = await apiRequest("POST", `/api/driver/rides/${rideId}/accept`, {});
      
      console.log("📡 Resposta da API:", response);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erro HTTP:", response.status, errorData);
        
        if (response.status === 402) {
          throw new Error("no_credits");
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Corrida aceita com sucesso:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("✅ onSuccess chamado:", data);
      toast({
        title: "Corrida aceita!",
        description: "O passageiro será notificado.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rides/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/rides/active", driverId] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver", driverId, "credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/me"] });
    },
    onError: (error: any) => {
      console.error("❌ Erro ao aceitar corrida:", error);
      
      if (error.message === "no_credits") {
        toast({
          title: "Sem créditos!",
          description: "Você precisa comprar créditos para aceitar corridas.",
          variant: "destructive",
          action: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCreditRechargeModalOpen(true)}
            >
              Comprar Agora
            </Button>
          ),
        });
      } else {
        toast({
          title: "Erro ao aceitar corrida",
          description: error.message || "Falha ao aceitar corrida.",
          variant: "destructive",
        });
      }
    },
    onSettled: (_data, _error, variables) => {
      console.log("⚙️ onSettled chamado");
      setAcceptingRideIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.rideId);
        return newSet;
      });
    },
  });

  const declineRideMutation = useMutation({
    mutationFn: async (rideId: string) => {
      setDecliningRideIds(prev => new Set(prev).add(rideId));
      // For now, we'll just remove it from pending (in a real app, we'd track declined rides)
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({
        title: "Corrida recusada",
        description: "A corrida foi enviada para outro motorista.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rides/pending"] });
    },
    onSettled: (_data, _error, variables) => {
      setDecliningRideIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables);
        return newSet;
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (isOnline: boolean) => {
      const response = await apiRequest("PATCH", `/api/drivers/${driverId}/status`, {
        isOnline: isOnline ? 1 : 0,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const newStatus = data.isOnline ? "online" : "offline";
      setDriverStatus(newStatus);
      toast({
        title: newStatus === "online" ? "Online" : "Offline",
        description: `Agora você está ${newStatus === "online" ? "disponível" : "indisponível"} para corridas.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/me"] });
    },
  });

  const completeRideMutation = useMutation({
    mutationFn: async (rideId: string) => {
      console.log("🚀 Tentando finalizar corrida:", rideId);
      const response = await apiRequest("PATCH", `/api/rides/${rideId}/status`, {
        status: "completed",
      });
      const data = await response.json();
      console.log("✅ Corrida finalizada com sucesso:", data);
      return data;
    },
    onSuccess: (ride) => {
      console.log("✅ onSuccess - corrida finalizada:", ride);
      queryClient.invalidateQueries({ queryKey: ["/api/driver/rides/active", driverId] });
      queryClient.invalidateQueries({ queryKey: ["/api/driver/me"] });
      
      setCompletedRideForPayment(ride);
      setPixModalOpen(true);
    },
    onError: (error: any) => {
      console.error("❌ Erro ao finalizar corrida:", error);
      toast({
        title: "Erro",
        description: `Falha ao finalizar corrida: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      });
    },
  });

  const handleAcceptRide = (rideId: string) => {
    acceptRideMutation.mutate({ rideId });
  };

  const handleDeclineRide = (rideId: string) => {
    declineRideMutation.mutate(rideId);
  };

  const handleToggleStatus = () => {
    if (!driverId) return;
    const newStatus = driverStatus === "online" ? false : true;
    toggleStatusMutation.mutate(newStatus);
  };

  const handleRefreshRides = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/rides/pending"] });
  };

  const handleCompleteRide = (rideId: string) => {
    completeRideMutation.mutate(rideId);
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Notificações não suportadas",
        description: "Seu navegador não suporta notificações.",
        variant: "destructive",
      });
      return;
    }

    // Initialize AudioContext on user interaction to avoid autoplay restrictions
    initAudioContext();

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
      toast({
        title: "Notificações ativadas!",
        description: "Você receberá alertas de novas corridas.",
      });
    } else {
      toast({
        title: "Notificações bloqueadas",
        description: "Ative as notificações nas configurações do navegador.",
        variant: "destructive",
      });
    }
  };

  // Initialize AudioContext on user interaction
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  // Play notification sound - Som de notificação mais forte e audível
  const playNotificationSound = () => {
    try {
      initAudioContext();
      const audioContext = audioContextRef.current;
      if (!audioContext) return;

      // Tocar 3 beeps para chamar atenção
      [0, 0.3, 0.6].forEach((delay) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Frequência mais alta e audível
        oscillator.frequency.value = 1200;
        oscillator.type = "square";
        
        // Volume mais alto
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.2);
        
        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + 0.2);
      });
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  // Detect new rides and notify
  useEffect(() => {
    console.log("🔍 useEffect triggered - pendingRides:", pendingRides);
    
    if (!Array.isArray(pendingRides)) {
      console.log("⚠️ pendingRides não é array");
      return;
    }
    
    if (pendingRides.length === 0) {
      console.log("⚠️ pendingRides está vazio");
      return;
    }
    
    // Build current set of ride IDs
    const currentRideIds = new Set(pendingRides.map((ride: any) => ride.id));
    console.log("📋 IDs atuais:", Array.from(currentRideIds));
    
    // After initialization, detect new rides by comparing IDs
    if (isInitializedRef.current) {
      console.log("📋 IDs anteriores:", Array.from(previousRideIdsRef.current));
      
      // Find new rides that weren't in the previous set
      const newRides = pendingRides.filter(
        (ride: any) => !previousRideIdsRef.current.has(ride.id)
      );
      
      console.log(`🔔 Novas corridas detectadas: ${newRides.length}`, newRides.map(r => r.id));
      
      // Notify for each new ride (only truly new ones)
      if (newRides.length > 0) {
        newRides.forEach((newRide: any) => {
          console.log("🚨 NOTIFICANDO CORRIDA:", newRide);
          
          // Play sound
          playNotificationSound();
          
          // Show browser notification if enabled
          if (notificationsEnabled && Notification.permission === "granted") {
            new Notification("🚗 Nova Corrida Disponível!", {
              body: `De: ${newRide.origin}\nPara: ${newRide.destination}\nPreço: ${newRide.estimatedPrice || "R$ 18,00"}`,
              icon: "/favicon.ico",
              tag: `ride-${newRide.id}`,
              requireInteraction: true,
            });
          }
          
          // Show toast notification
          toast({
            title: "🚗 Nova Corrida!",
            description: `${newRide.origin} → ${newRide.destination}`,
            duration: 5000,
          });
        });
      }
    } else {
      // First load - initialize the set and show info toast if there are pending rides
      console.log(`📱 Inicializado com ${pendingRides.length} corrida(s) pendente(s)`);
      isInitializedRef.current = true;
      
      // If there are already pending rides when driver opens the app, show a toast
      if (pendingRides.length > 0) {
        toast({
          title: `📋 ${pendingRides.length} corrida(s) aguardando`,
          description: "Confira as corridas pendentes abaixo",
          duration: 6000,
        });
      }
    }
    
    // Update the previous rides set
    previousRideIdsRef.current = currentRideIds;
    console.log("✅ previousRideIdsRef atualizado:", Array.from(currentRideIds));
  }, [pendingRides, notificationsEnabled, toast]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'in_progress': return 'bg-blue-500';
      case 'accepted': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      case 'in_progress': return 'Em andamento';
      case 'accepted': return 'Aceita';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Driver Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCircle className="text-primary mr-3" />
              Status do Motorista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          {/* Driver selection removed - now uses authenticated session */}
          
          {currentDriver && (
            <div className="p-3 bg-muted rounded-lg">
              <p data-testid="text-current-driver-name" className="font-medium">{currentDriver.name}</p>
              <p className="text-sm text-muted-foreground">{currentDriver.vehicleModel} - {currentDriver.vehiclePlate}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status:</span>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                driverStatus === "online" ? "bg-green-500" : "bg-gray-500"
              }`}></div>
              <span data-testid="text-driver-status" className={`font-medium ${
                driverStatus === "online" ? "text-green-600" : "text-gray-600"
              }`}>
                {driverStatus === "online" ? "Online" : "Offline"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Corridas hoje:</span>
            <span data-testid="text-rides-today" className="font-medium">8</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ganhos:</span>
            <span data-testid="text-earnings" className="font-medium text-primary">R$ 240,00</span>
          </div>
          
          <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Créditos:</span>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                <span data-testid="text-credits" className="text-2xl font-bold text-primary">
                  {creditsData?.credits || 0}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Corridas restantes
            </p>
            <Button
              data-testid="button-recharge-credits"
              onClick={() => setCreditRechargeModalOpen(true)}
              variant="outline"
              className="w-full mt-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Comprar Créditos
            </Button>
          </div>
          
          <Button
            data-testid="button-toggle-status"
            onClick={handleToggleStatus}
            disabled={toggleStatusMutation.isPending}
            className={`w-full py-3 transition-colors ${
              driverStatus === "online"
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            {driverStatus === "online" ? "Ficar Offline" : "Ficar Online"}
          </Button>

          <Button
            data-testid="button-toggle-notifications"
            onClick={requestNotificationPermission}
            disabled={notificationsEnabled}
            variant={notificationsEnabled ? "outline" : "secondary"}
            className="w-full py-3"
          >
            {notificationsEnabled ? (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Notificações Ativadas
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4 mr-2" />
                Ativar Notificações
              </>
            )}
          </Button>
          </CardContent>
        </Card>

        {/* Available Rides */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <List className="text-secondary mr-3" />
                Corridas Disponíveis
              </CardTitle>
              <Button
                data-testid="button-refresh-rides"
                variant="ghost"
                size="sm"
                onClick={handleRefreshRides}
                className="text-primary hover:text-primary/80"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {ridesLoading ? (
              <div data-testid="loading-rides" className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Carregando corridas...</p>
              </div>
            ) : Array.isArray(pendingRides) && pendingRides.length > 0 ? (
              <div className="space-y-4">
                {Array.isArray(pendingRides) && pendingRides.map((ride: any) => (
                  <div key={ride.id} className="ride-card p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="status-pending text-white text-xs px-2 py-1 rounded-full font-medium">
                            NOVA
                          </span>
                          <span data-testid={`text-ride-id-${ride.id}`} className="text-sm text-muted-foreground">
                            #{ride.id.slice(0, 8)}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Circle className="text-primary text-xs w-3 h-3" />
                            <span data-testid={`text-origin-${ride.id}`} className="text-sm">{ride.origin}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="text-secondary text-xs w-3 h-3" />
                            <span data-testid={`text-destination-${ride.id}`} className="text-sm">{ride.destination}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Distância</p>
                        <p data-testid={`text-distance-${ride.id}`} className="font-semibold text-primary">2.3 km</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span data-testid={`text-passengers-${ride.id}`}>
                          <Users className="inline w-3 h-3 mr-1" />
                          {ride.passengerCount} passageiro{ride.passengerCount > 1 ? 's' : ''}
                        </span>
                        <span>
                          <Clock className="inline w-3 h-3 mr-1" />
                          5 min
                        </span>
                        <span data-testid={`text-price-${ride.id}`}>
                          <DollarSign className="inline w-3 h-3 mr-1" />
                          {ride.estimatedPrice || "R$ 18,00"}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          data-testid={`button-decline-${ride.id}`}
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeclineRide(ride.id)}
                          disabled={decliningRideIds.has(ride.id)}
                        >
                          Recusar
                        </Button>
                        <Button
                          data-testid={`button-accept-${ride.id}`}
                          size="sm"
                          onClick={() => handleAcceptRide(ride.id)}
                          disabled={acceptingRideIds.has(ride.id) || (creditsData?.credits || 0) <= 0}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                          title={(creditsData?.credits || 0) <= 0 ? "Sem créditos disponíveis" : "Aceitar corrida"}
                        >
                          Aceitar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p data-testid="text-no-rides" className="text-muted-foreground">
                  Nenhuma corrida disponível no momento
                </p>
              </div>
            )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Rides - In Progress */}
      {Array.isArray(activeRides) && activeRides.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="text-green-500 mr-3" />
              Corridas em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeRides.map((ride: any) => (
                <div key={ride.id} className="p-4 border-2 border-green-500 rounded-lg bg-green-50 dark:bg-green-950" data-testid={`active-ride-${ride.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          EM ANDAMENTO
                        </span>
                        <span data-testid={`text-active-ride-id-${ride.id}`} className="text-sm text-muted-foreground">
                          #{ride.id.slice(0, 8)}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Circle className="text-primary text-xs w-3 h-3" />
                          <span data-testid={`text-active-origin-${ride.id}`} className="text-sm font-medium">{ride.origin}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="text-secondary text-xs w-3 h-3" />
                          <span data-testid={`text-active-destination-${ride.id}`} className="text-sm font-medium">{ride.destination}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400" data-testid={`text-active-price-${ride.id}`}>
                        {ride.estimatedPrice || "R$ 18,00"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Users className="inline w-3 h-3 mr-1" />
                        {ride.passengerCount} passageiro{ride.passengerCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    data-testid={`button-complete-ride-${ride.id}`}
                    onClick={() => handleCompleteRide(ride.id)}
                    disabled={completeRideMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finalizar Corrida e Liberar Pagamento
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Driver Ride History removed - use dedicated history page if needed */}

      {/* Credit Purchase History */}
      {Array.isArray(creditPurchases) && creditPurchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="text-primary mr-3" />
              Histórico de Recargas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {creditPurchases.map((purchase: any) => (
                <div 
                  key={purchase.id} 
                  className="p-3 border border-border rounded-lg"
                  data-testid={`purchase-${purchase.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {purchase.credits} créditos
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(purchase.purchasedAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        R$ {parseFloat(purchase.amount).toFixed(2)}
                      </p>
                      <p className={`text-xs font-medium ${
                        purchase.status === 'confirmed' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {purchase.status === 'confirmed' ? '✓ Confirmado' : '⏳ Pendente'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pix Payment Modal */}
      {completedRideForPayment && (
        <PixPaymentModal
          open={pixModalOpen}
          onClose={() => {
            setPixModalOpen(false);
            setCompletedRideForPayment(null);
          }}
          rideDetails={{
            id: completedRideForPayment.id,
            origin: completedRideForPayment.origin,
            destination: completedRideForPayment.destination,
            price: completedRideForPayment.estimatedPrice || "R$ 18,00",
          }}
        />
      )}

      {/* Credit Recharge Modal */}
      {driverId && (
        <CreditRechargeModal
          open={creditRechargeModalOpen}
          onClose={() => setCreditRechargeModalOpen(false)}
          driverId={driverId}
        />
      )}
    </div>
  );
}
