import { Car, UserPlus } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-muted border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Car className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-primary">tecnok</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transporte comunitário seguro e acessível para Furnas, Agrícola e Mata Machado.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Regiões Atendidas</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li data-testid="text-region-furnas">Furnas</li>
              <li data-testid="text-region-agricola">Agrícola</li>
              <li data-testid="text-region-mata-machado">Mata Machado</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p data-testid="text-contact-whatsapp">WhatsApp: +55 21 98066-9989</p>
              <p data-testid="text-contact-website">Site: tecnok.com.br</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-6 flex flex-col items-center gap-4">
          <Link href="/cadastro-motorista">
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold shadow-lg"
              data-testid="link-driver-register"
            >
              <UserPlus className="w-5 h-5" />
              Cadastrar como Motorista
            </button>
          </Link>
          <p className="text-sm text-muted-foreground">
            &copy; 2024 tecnok. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
