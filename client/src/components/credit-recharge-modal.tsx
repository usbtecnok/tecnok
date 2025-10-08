import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, CheckCircle, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface CreditPackage {
  credits: number;
  amount: number;
  discount?: number;
}

const creditPackages: CreditPackage[] = [
  { credits: 10, amount: 10.00 },
  { credits: 30, amount: 25.00, discount: 17 },
  { credits: 50, amount: 40.00, discount: 20 },
];

interface CreditRechargeModalProps {
  open: boolean;
  onClose: () => void;
  driverId: string;
}

export default function CreditRechargeModal({ open, onClose, driverId }: CreditRechargeModalProps) {
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [pixKeyCopied, setPixKeyCopied] = useState(false);

  const pixKey = "07217640881";
  const beneficiary = "Aparecido de Góes";

  const createPurchaseMutation = useMutation({
    mutationFn: async (pkg: CreditPackage) => {
      const response = await apiRequest("POST", `/api/driver/${driverId}/credit-purchase`, {
        credits: pkg.credits,
        amount: pkg.amount
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Solicitação enviada!",
        description: "Seu pedido de créditos foi registrado. Após confirmar o pagamento, seus créditos serão adicionados.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/driver", driverId, "credit-purchases"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao registrar solicitação de créditos.",
        variant: "destructive",
      });
    },
  });

  const handleSelectPackage = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    createPurchaseMutation.mutate(pkg);
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    setPixKeyCopied(true);
    toast({
      title: "Chave Pix copiada!",
      description: "Cole no app do seu banco para fazer o pagamento.",
    });
    setTimeout(() => setPixKeyCopied(false), 3000);
  };

  const handleClose = () => {
    setSelectedPackage(null);
    setPixKeyCopied(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" data-testid="dialog-credit-recharge">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-6 h-6" />
            Comprar Créditos
          </DialogTitle>
        </DialogHeader>

        {!selectedPackage ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Escolha um pacote de créditos. Cada crédito permite aceitar 1 corrida.
            </p>

            <div className="grid gap-3">
              {creditPackages.map((pkg) => (
                <Card
                  key={pkg.credits}
                  className="p-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleSelectPackage(pkg)}
                  data-testid={`card-package-${pkg.credits}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg">{pkg.credits} Corridas</p>
                      {pkg.discount && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {pkg.discount}% de desconto
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">R$ {pkg.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        R$ {(pkg.amount / pkg.credits).toFixed(2)}/corrida
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm text-center mb-2">Você está comprando:</p>
              <p className="text-2xl font-bold text-center">
                {selectedPackage.credits} Corridas
              </p>
              <p className="text-xl font-semibold text-center text-primary mt-1">
                R$ {selectedPackage.amount.toFixed(2)}
              </p>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">Dados para Pagamento via Pix:</h3>
              
              <div>
                <p className="text-sm text-muted-foreground">Beneficiário</p>
                <p className="font-medium">{beneficiary}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Chave Pix (CPF)</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded font-mono">{pixKey}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyPixKey}
                    data-testid="button-copy-pix"
                  >
                    {pixKeyCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Após fazer o pagamento, seus créditos serão adicionados automaticamente pelo administrador.
                </p>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleClose}
              data-testid="button-close-recharge"
            >
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
