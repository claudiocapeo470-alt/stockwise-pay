import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useToast } from "@/hooks/use-toast";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, Scan, Plus, Minus, ShoppingCart, Printer, Trash2, Download, FileText } from "lucide-react";
import jsPDF from "jspdf";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string | null;
}

export default function Caisse() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [scannerInput, setScannerInput] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const { products } = useProducts();
  const { addSale } = useSales();
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  // Nettoyage de la caméra à la fermeture
  useEffect(() => {
    return () => {
      if (scannerRef.current && cameraActive) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [cameraActive]);

  // Scanner USB / Clavier
  const handleScannerInput = (code: string) => {
    const product = products.find(p => p.sku === code);
    if (product) {
      addToCart(product);
      toast({
        title: "✅ Produit ajouté",
        description: `${product.name} ajouté au panier`,
      });
    } else {
      toast({
        title: "❌ Produit non reconnu",
        description: "Code-barres introuvable",
        variant: "destructive",
      });
    }
    setScannerInput("");
  };

  // Activer la caméra pour scanner
  const toggleCamera = async () => {
    if (!readerRef.current) return;

    if (cameraActive && scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setCameraActive(false);
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping camera:", err);
      }
    } else {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          formatsToSupport: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] // Tous les formats de codes-barres
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            const code = decodedText.trim();
            const product = products.find(p => p.sku === code);
            
            if (product) {
              addToCart(product);
              toast({
                title: "✅ Produit scanné",
                description: `${product.name} ajouté au panier`,
              });
              
              // Vibration feedback sur mobile
              if (navigator.vibrate) {
                navigator.vibrate(200);
              }
            } else {
              toast({
                title: "❌ Produit non reconnu",
                description: `Code: ${code}`,
                variant: "destructive",
              });
            }
          },
          (errorMessage) => {
            // Ignorer les erreurs de scan en cours
          }
        );
        
        setCameraActive(true);
        toast({
          title: "📷 Caméra activée",
          description: "Scannez un code-barres",
        });
      } catch (err: any) {
        console.error("Error starting camera:", err);
        let errorMsg = "Impossible d'accéder à la caméra";
        
        if (err.name === "NotAllowedError") {
          errorMsg = "Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur";
        } else if (err.name === "NotFoundError") {
          errorMsg = "Aucune caméra détectée sur cet appareil";
        } else if (err.name === "NotReadableError") {
          errorMsg = "La caméra est déjà utilisée par une autre application";
        }
        
        toast({
          title: "Erreur caméra",
          description: errorMsg,
          variant: "destructive",
        });
        scannerRef.current = null;
      }
    }
  };

  // Ajouter au panier
  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        sku: product.sku,
      }];
    });
  };

  // Modifier quantité
  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      );
      return updated.filter(item => item.quantity > 0);
    });
  };

  // Supprimer du panier
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calculer le total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Générer PDF du reçu
  const generateReceiptPDF = () => {
    const doc = new jsPDF({
      format: [80, 200],
      unit: 'mm'
    });

    doc.setFontSize(14);
    doc.text('SIGR SUPERMARCHÉ', 40, 10, { align: 'center' });
    doc.setFontSize(8);
    doc.text('─────────────────────────────', 40, 15, { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleString('fr-FR')}`, 5, 20);
    doc.text('─────────────────────────────', 40, 25, { align: 'center' });

    let y = 30;
    cart.forEach((item) => {
      doc.setFontSize(9);
      doc.text(`${item.name} x${item.quantity}`, 5, y);
      doc.text(`${(item.price * item.quantity).toLocaleString()} FCFA`, 65, y, { align: 'right' });
      y += 5;
    });

    doc.text('─────────────────────────────', 40, y, { align: 'center' });
    y += 5;
    doc.setFontSize(11);
    doc.text(`TOTAL: ${total.toLocaleString()} FCFA`, 65, y, { align: 'right' });
    y += 10;
    doc.setFontSize(8);
    doc.text('Merci pour votre achat 🙏', 40, y, { align: 'center' });
    doc.text('À bientôt !', 40, y + 5, { align: 'center' });

    return doc;
  };

  // Télécharger le reçu en PDF
  const downloadReceiptPDF = () => {
    const doc = generateReceiptPDF();
    const fileName = `recu_${new Date().toISOString().slice(0, 10)}_${Date.now()}.pdf`;
    doc.save(fileName);
    toast({
      title: "✅ PDF téléchargé",
      description: "Le reçu a été téléchargé avec succès",
    });
  };

  // Valider la vente
  const validateSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits avant de valider",
        variant: "destructive",
      });
      return;
    }

    try {
      // Enregistrer chaque produit comme une vente
      for (const item of cart) {
        await addSale.mutateAsync({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_amount: item.price * item.quantity,
          paid_amount: item.price * item.quantity,
          customer_name: null,
          customer_phone: null,
          sale_date: new Date().toISOString(),
          payment_method: "Espèces",
        });
      }

      setShowReceipt(true);
      
      toast({
        title: "✅ Vente validée",
        description: "Stock mis à jour automatiquement",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la vente",
        variant: "destructive",
      });
    }
  };

  // Imprimer le reçu
  const printReceipt = () => {
    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return;

    const receiptContent = `
      <html>
        <head>
          <title>Reçu - SIGR SUPERMARCHÉ</title>
          <style>
            body { font-family: monospace; font-size: 12px; width: 300px; margin: 0 auto; padding: 10px; }
            h3 { text-align: center; margin: 10px 0; }
            .line { border-bottom: 1px dashed #000; margin: 5px 0; }
            .item { display: flex; justify-content: space-between; margin: 3px 0; }
            .total { font-weight: bold; font-size: 14px; text-align: right; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h3>🧾 SIGR SUPERMARCHÉ</h3>
          <div class="line"></div>
          <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
          <div class="line"></div>
          ${cart.map(item => `
            <div class="item">
              <span>${item.name} x${item.quantity}</span>
              <span>${(item.price * item.quantity).toLocaleString()} FCFA</span>
            </div>
          `).join('')}
          <div class="line"></div>
          <div class="total">TOTAL: ${total.toLocaleString()} FCFA</div>
          <div class="footer">
            <p>Merci pour votre achat 🙏</p>
            <p>À bientôt !</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
    
    // Réinitialiser après impression
    setTimeout(() => {
      setCart([]);
      setShowReceipt(false);
    }, 500);
  };

  return (
    <div className="space-y-4 p-2 sm:p-4 md:p-6 max-w-7xl mx-auto pb-20 md:pb-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-2 border-blue-200 dark:border-blue-800/40 rounded-lg p-3 sm:p-4 md:p-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-100 text-center">
          🛒 Caisse Tactile
        </h2>
        <p className="text-sm sm:text-base text-blue-700 dark:text-blue-300 text-center mt-2">
          Scannez vos produits et validez la vente
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Panneau de scan */}
        <div className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Scan className="h-4 w-4 sm:h-5 sm:w-5" />
                Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Scanner USB/Clavier */}
              <div>
                <label className="text-xs sm:text-sm font-medium mb-2 block">
                  Scanner code-barres
                </label>
                <Input
                  id="scannerInput"
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && scannerInput.trim()) {
                      handleScannerInput(scannerInput.trim());
                    }
                  }}
                  placeholder="Scannez un produit..."
                  className="text-base sm:text-lg h-12 sm:h-14"
                  autoFocus
                />
              </div>

              {/* Scanner caméra */}
              <div>
                <Button
                  onClick={toggleCamera}
                  variant={cameraActive ? "destructive" : "outline"}
                  className="w-full h-12 sm:h-14 text-base"
                  size="lg"
                >
                  <Camera className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                  {cameraActive ? "Arrêter la caméra" : "Scanner avec caméra"}
                </Button>
                <div
                  id="reader"
                  ref={readerRef}
                  className={`mt-4 rounded-lg overflow-hidden ${!cameraActive ? 'hidden' : ''}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panneau panier */}
        <div className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                Panier ({cart.length})
              </CardTitle>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCart([])}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Panier vide</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3 max-h-[50vh] overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-medium truncate text-sm sm:text-base">{item.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {item.price.toLocaleString()} FCFA × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-8 w-8 sm:h-9 sm:w-9 touch-manipulation"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Badge variant="secondary" className="min-w-[2rem] sm:min-w-[2.5rem] text-center text-sm">
                          {item.quantity}
                        </Badge>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-8 w-8 sm:h-9 sm:w-9 touch-manipulation"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8 sm:h-9 sm:w-9 text-destructive touch-manipulation"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total et validation */}
          {cart.length > 0 && (
            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-2 border-green-200 dark:border-green-800/40">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <span className="text-lg sm:text-xl font-semibold">TOTAL</span>
                  <span className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                    {total.toLocaleString()} FCFA
                  </span>
                </div>
                <Button
                  onClick={validateSale}
                  className="w-full bg-green-600 hover:bg-green-700 h-12 sm:h-14 text-base sm:text-lg touch-manipulation"
                  size="lg"
                  disabled={addSale.isPending}
                >
                  ✅ Valider la vente
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reçu */}
      {showReceipt && (
        <Card className="max-w-md mx-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg sm:text-xl">🧾 Reçu de vente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="border-t border-b py-3">
              <h3 className="text-center font-bold text-base sm:text-lg">SIGR SUPERMARCHÉ</h3>
              <p className="text-center text-xs sm:text-sm text-muted-foreground">
                {new Date().toLocaleString('fr-FR')}
              </p>
            </div>
            <div className="space-y-2 font-mono text-xs sm:text-sm">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString()} FCFA</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-base sm:text-lg font-bold">
                <span>TOTAL</span>
                <span>{total.toLocaleString()} FCFA</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <Button
                onClick={printReceipt}
                className="w-full h-11 sm:h-12 touch-manipulation"
                size="lg"
              >
                <Printer className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Imprimer
              </Button>
              <Button
                onClick={downloadReceiptPDF}
                variant="outline"
                className="w-full h-11 sm:h-12 touch-manipulation"
                size="lg"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Télécharger PDF
              </Button>
            </div>
            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4">
              Merci pour votre achat 🙏
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
