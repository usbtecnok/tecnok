import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import PassengerPanel from "@/components/passenger-panel";
import DriverPanel from "@/components/driver-panel";
import MapPanel from "@/components/map-panel";
import logoPath from "@assets/logo_1759191818061.png";
import videoPath from "@assets/tecnok_ Segurança e Praticidade no Transporte!_1759234678136.mp4";
import { Mail, Play, Car, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type TabType = "passenger" | "driver" | "map";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("passenger");
  const [, navigate] = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setShowInstallButton(false);
      toast({
        title: "App Instalado!",
        description: "tecnok foi instalado com sucesso no seu dispositivo.",
      });
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Instalação não disponível",
        description: "Para instalar: No menu do navegador (⋮), selecione 'Adicionar à tela inicial' ou 'Instalar app'",
        variant: "destructive",
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="container mx-auto px-4 py-8 flex justify-center items-center gap-6">
        <img 
          src={logoPath} 
          alt="USB-TECNOK Logo" 
          className="h-24 w-auto object-contain"
          style={{
            filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3)) drop-shadow(-1px -1px 2px rgba(255,255,255,0.3))',
            mixBlendMode: 'multiply',
            transform: 'perspective(500px) rotateY(-5deg)',
            transition: 'all 0.3s ease'
          }}
          data-testid="img-logo"
        />
        <div className="flex items-center gap-3">
          {showInstallButton && (
            <Button
              onClick={handleInstallClick}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
              data-testid="button-install-app"
            >
              <Download className="w-5 h-5" />
              <span className="font-medium">Instalar App</span>
            </Button>
          )}
          <Button
            onClick={() => navigate("/motorista/login")}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg"
            data-testid="button-driver-area"
          >
            <Car className="w-5 h-5" />
            <span className="font-medium">Área do Motorista</span>
          </Button>
          <a 
            href="mailto:contato@tecnok.com.br"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-primary hover:bg-primary/90 transition-colors shadow-lg"
            title="Contato"
            data-testid="link-contact"
          >
            <Mail className="w-6 h-6 text-primary-foreground" />
          </a>
        </div>
      </div>

      <section className="container mx-auto px-4 pb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Play className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">
                Conheça a tecnok
              </h2>
            </div>
            <p className="text-blue-100 mb-6">
              Segurança e praticidade no transporte da sua comunidade
            </p>
            <div className="relative rounded-xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
              <video 
                controls 
                className="w-full"
                data-testid="video-promotional"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect fill='%232563eb' width='1920' height='1080'/%3E%3C/svg%3E"
              >
                <source src={videoPath} type="video/mp4" />
                Seu navegador não suporta a reprodução de vídeos.
              </video>
            </div>
          </div>
        </div>
      </section>
      
      <main className="container mx-auto px-4 py-8">
        {activeTab === "passenger" && <PassengerPanel />}
        {activeTab === "driver" && <DriverPanel />}
        {activeTab === "map" && <MapPanel />}
      </main>

      <Footer />
    </div>
  );
}
