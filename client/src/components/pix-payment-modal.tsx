import { Copy, CheckCircle, Wallet, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PixPaymentModalProps {
  open: boolean;
  onClose: () => void;
  rideDetails: {
    id: string;
    origin: string;
    destination: string;
    price: string;
    passengerName?: string;
  };
}

export default function PixPaymentModal({ open, onClose, rideDetails }: PixPaymentModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{ qrCode: string; pixPayload: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cash">("pix");

  const handleClose = async () => {
    // Save payment method before closing
    try {
      await apiRequest("PATCH", `/api/rides/${rideDetails.id}/payment-method`, {
        paymentMethod
      });
    } catch (error) {
      console.error("Error saving payment method:", error);
    }
    onClose();
  };

  const pixRecipient = {
    name: "Aparecido de Góes",
    cpf: "072.176.408-81",
    cpfRaw: "07217640881",
  };

  const priceValue = rideDetails.price.replace('R$', '').trim().replace(',', '.');

  useEffect(() => {
    if (open && paymentMethod === "pix") {
      apiRequest("POST", "/api/payments/pix-qrcode", {
        amount: priceValue,
        description: `Corrida ${rideDetails.id.slice(0, 8)}`
      }).then(res => res.json())
        .then((data: any) => setQrCodeData(data))
        .catch((err) => {
          console.error("Error fetching QR Code:", err);
          toast({
            title: "Erro ao gerar QR Code",
            description: "Tente novamente",
            variant: "destructive"
          });
        });
    }
  }, [open, paymentMethod, priceValue, rideDetails.id, toast]);


  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(pixRecipient.cpfRaw);
    setCopied(true);
    toast({
      title: "Chave Pix copiada!",
      description: "Cole no app do seu banco para fazer o pagamento.",
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyPixPayload = (payload: string) => {
    navigator.clipboard.writeText(payload);
    toast({
      title: "Código Pix Copia e Cola copiado!",
      description: "Cole no app do seu banco para fazer o pagamento automático.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" data-testid="modal-pix-payment">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="text-green-500 w-6 h-6" />
            Corrida Finalizada!
          </DialogTitle>
          <DialogDescription>
            Escolha a forma de pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Detalhes da Corrida</h3>
            <div className="space-y-1 text-sm">
              <p data-testid="text-pix-ride-id">
                <span className="text-muted-foreground">ID:</span> #{rideDetails.id.slice(0, 8)}
              </p>
              <p data-testid="text-pix-origin">
                <span className="text-muted-foreground">De:</span> {rideDetails.origin}
              </p>
              <p data-testid="text-pix-destination">
                <span className="text-muted-foreground">Para:</span> {rideDetails.destination}
              </p>
              <p data-testid="text-pix-price" className="font-bold text-lg text-primary pt-2">
                Valor: {rideDetails.price}
              </p>
            </div>
          </div>

          <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "pix" | "cash")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pix" data-testid="tab-payment-pix">
                <QrCode className="w-4 h-4 mr-2" />
                Pix
              </TabsTrigger>
              <TabsTrigger value="cash" data-testid="tab-payment-cash">
                <Wallet className="w-4 h-4 mr-2" />
                Dinheiro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pix" className="space-y-4 mt-4">
              {qrCodeData && (
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <img 
                      src={qrCodeData.qrCode} 
                      alt="QR Code Pix" 
                      className="w-48 h-48"
                      data-testid="img-qr-code-pix"
                    />
                  </div>
                  <Button
                    onClick={() => handleCopyPixPayload(qrCodeData.pixPayload)}
                    variant="outline"
                    className="w-full"
                    data-testid="button-copy-pix-payload"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código Pix Copia e Cola
                  </Button>
                </div>
              )}

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border-2 border-green-200 dark:border-green-800">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">💰</span>
                  Ou use a Chave Pix
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Beneficiário</p>
                    <p data-testid="text-pix-recipient" className="font-medium">{pixRecipient.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground text-xs">Chave Pix (CPF)</p>
                    <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded border">
                      <p data-testid="text-pix-key" className="font-mono font-medium">{pixRecipient.cpf}</p>
                      <Button
                        data-testid="button-copy-pix"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyPixKey}
                        className="h-8"
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cash" className="space-y-4 mt-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  Pagamento em Dinheiro
                </h3>
                <p className="text-sm text-muted-foreground">
                  Você receberá <strong>{rideDetails.price}</strong> em dinheiro do passageiro.
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Taxa da Plataforma
                </h3>
                <p className="text-sm text-muted-foreground">
                  A taxa de <strong>R$ 1,00</strong> será automaticamente deduzida do seu saldo na plataforma.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Você não precisa fazer nenhum pagamento agora. A taxa será descontada quando você solicitar o saque dos seus ganhos.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            data-testid="button-close-pix-modal"
            onClick={handleClose}
            className="w-full"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
