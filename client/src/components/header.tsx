import { Car } from "lucide-react";

interface HeaderProps {
  activeTab: "passenger" | "driver" | "map";
  onTabChange: (tab: "passenger" | "driver" | "map") => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Car className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">tecnok</h1>
              <p className="text-sm text-muted-foreground">Transporte Comunitário</p>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <button
              data-testid="tab-passenger"
              onClick={() => onTabChange("passenger")}
              className={`transition-colors pb-1 ${
                activeTab === "passenger"
                  ? "text-primary border-b-2 border-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Passageiro
            </button>
            <button
              data-testid="tab-driver"
              onClick={() => onTabChange("driver")}
              className={`transition-colors pb-1 ${
                activeTab === "driver"
                  ? "text-primary border-b-2 border-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Motorista
            </button>
            <button
              data-testid="tab-map"
              onClick={() => onTabChange("map")}
              className={`transition-colors pb-1 ${
                activeTab === "map"
                  ? "text-primary border-b-2 border-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mapa
            </button>
          </nav>

          <a
            href="https://wa.me/5521980669989?text=Fale%20com%20um%20agente%20Tecnok"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-whatsapp"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.75"/>
            </svg>
            <span className="hidden sm:inline">Contato</span>
          </a>
        </div>
      </div>
    </header>
  );
}
