import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useToast } from "@/hooks/use-toast";
import Quagga from "quagga";
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
  const [codeArticle, setCodeArticle] = useState("");
  const { products } = useProducts();
  const { addSale } = useSales();
  const { toast } = useToast();
  const scannerInitialized = useRef(false);

  // Nettoyage de la caméra à la fermeture
  useEffect(() => {
    return () => {
      if (cameraActive && scannerInitialized.current) {
        try {
          Quagga.stop();
          scannerInitialized.current = false;
        } catch (err) {
          console.error("Error stopping Quagga:", err);
        }
      }
    };
  }, [cameraActive]);

  // Scanner USB / Clavier - notification uniquement si produit trouvé
  const handleScannerInput = (code: string) => {
    const product = products.find(p => p.sku === code);
    if (product) {
      addToCart(product);
      toast({
        title: "✅ Produit ajouté",
        description: `${product.name} ajouté au panier`,
      });
    }
    // Pas de notification si produit non trouvé
    setScannerInput("");
  };

  // Activer la caméra pour scanner avec QuaggaJS
  const toggleCamera = async () => {
    if (cameraActive) {
      try {
        Quagga.stop();
        setCameraActive(false);
        scannerInitialized.current = false;
      } catch (err) {
        console.error("Error stopping camera:", err);
      }
      return;
    }

    // Activer la caméra
    setCameraActive(true);
    
    // Attendre que le DOM soit prêt
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.querySelector('#scanner'),
          constraints: {
            facingMode: "environment",
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 }
          },
          area: {
            top: "20%",
            right: "10%",
            left: "10%",
            bottom: "20%"
          }
        },
        frequency: 10,
        decoder: {
          readers: [
            "ean_reader",        // EAN-13
            "ean_8_reader",      // EAN-8
            "code_128_reader",   // Code128
            "code_39_reader",    // Code39
            "upc_reader",        // UPC-A
            "upc_e_reader",      // UPC-E
            "codabar_reader",    // Codabar
            "i2of5_reader"       // Interleaved 2 of 5
          ],
          debug: {
            drawBoundingBox: true,
            showFrequency: true,
            drawScanline: true,
            showPattern: true
          },
          multiple: false
        },
        locate: true,
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: navigator.hardwareConcurrency || 4,
        debug: false
      }, function(err) {
        if (err) {
          console.error("Erreur scanner :", err);
          setCameraActive(false);
          
          let errorMsg = "Impossible d'accéder à la caméra";
          
          if (err.name === "NotAllowedError") {
            errorMsg = "Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur";
          } else if (err.name === "NotFoundError") {
            errorMsg = "Aucune caméra détectée sur cet appareil";
          } else if (err.name === "NotReadableError") {
            errorMsg = "La caméra est déjà utilisée par une autre application";
          } else if (err.name === "OverconstrainedError") {
            errorMsg = "Configuration de caméra non supportée";
          }
          
          toast({
            title: "Erreur caméra",
            description: errorMsg,
            variant: "destructive",
          });
          return;
        }
        
        Quagga.start();
        scannerInitialized.current = true;
        
        toast({
          title: "📷 Caméra activée",
          description: "Pointez vers un code-barres",
        });
      });

      // Détecter les codes-barres - notification uniquement si produit trouvé
      Quagga.onDetected((result) => {
        if (result && result.codeResult && result.codeResult.code) {
          const code = result.codeResult.code.trim();
          setCodeArticle(code);
          
          // Chercher le produit correspondant
          const product = products.find(p => p.sku === code);
          
          if (product) {
            addToCart(product);
            
            toast({
              title: "✅ Code scanné avec succès",
              description: `${product.name} ajouté au panier`,
            });
            
            // Vibration feedback sur mobile
            if (navigator.vibrate) {
              navigator.vibrate(200);
            }
            
            // Arrêter le scanner après détection réussie
            setTimeout(() => {
              Quagga.stop();
              setCameraActive(false);
              scannerInitialized.current = false;
            }, 500);
          }
          // Pas de notification si produit non trouvé - continuer à scanner silencieusement
        }
      });
      
    } catch (err: any) {
      console.error("Error starting camera:", err);
      setCameraActive(false);
      scannerInitialized.current = false;
      
      toast({
        title: "Erreur",
        description: "Impossible de démarrer le scanner",
        variant: "destructive",
      });
    }
  };

  // Ajouter au panier avec animation
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

    // Animation feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
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
        description: "Impression du ticket en cours...",
      });

      // Impression automatique après un court délai
      setTimeout(() => {
        printReceipt();
      }, 500);
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
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6 max-w-7xl mx-auto pb-20 md:pb-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 border-2 border-primary/20 rounded-xl p-4 sm:p-6 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-2">
          🛒 Caisse Tactile
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground text-center">
          Scannez vos produits et validez la vente rapidement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Panneau de scan */}
        <div className="space-y-4">
          <Card className="shadow-md border-2">
            <CardHeader className="pb-4 border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Scan className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Scanner de Produits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {/* Saisie manuelle du code produit avec bouton Valider */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Scan className="h-4 w-4 text-primary" />
                  Code Produit (SKU / Code-Barres)
                </label>
                <div className="flex gap-2">
                  <Input
                    id="scannerInput"
                    value={scannerInput}
                    onChange={(e) => setScannerInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && scannerInput.trim()) {
                        handleScannerInput(scannerInput.trim());
                      }
                    }}
                    placeholder="Saisissez le code du produit..."
                    className="flex-1 text-lg sm:text-xl h-14 sm:h-16 border-2 border-primary/30 focus:border-primary font-mono tracking-wider"
                    autoFocus
                  />
                  <Button
                    onClick={() => {
                      if (scannerInput.trim()) {
                        handleScannerInput(scannerInput.trim());
                      }
                    }}
                    disabled={!scannerInput.trim()}
                    className="h-14 sm:h-16 px-6 sm:px-8 text-base sm:text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                    Valider
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Saisissez le code SKU ou code-barres puis appuyez sur Valider ou Entrée
                </p>
              </div>

              {/* Séparateur */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted-foreground/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-medium">ou</span>
                </div>
              </div>

              {/* Scanner caméra */}
              <Button
                onClick={toggleCamera}
                variant={cameraActive ? "destructive" : "outline"}
                className="w-full h-12 sm:h-14 text-base font-semibold border-2 shadow-sm hover:shadow-md"
                size="lg"
              >
                <Camera className="h-5 w-5 mr-2" />
                {cameraActive ? "Arrêter la Caméra" : "Scanner avec Caméra"}
              </Button>

              {/* Zone de scan caméra QuaggaJS - sans rectangle */}
              {cameraActive && (
                <div className="mt-4 relative">
                  <div className="border-2 border-primary rounded-xl overflow-hidden bg-black shadow-xl">
                    <div
                      id="scanner"
                      className="w-full h-[350px] sm:h-[450px]"
                      style={{ position: 'relative' }}
                    >
                      <canvas className="drawingBuffer" style={{ position: 'absolute', top: 0, left: 0 }}></canvas>
                    </div>
                  </div>
                  <div className="mt-3 text-center bg-muted/50 rounded-lg p-3">
                    <p className="text-sm font-medium text-foreground">
                      📍 Pointez vers le code-barres
                    </p>
                  </div>
                </div>
              )}
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
            <CardContent className="pt-6">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-base font-medium">Panier vide</p>
                  <p className="text-sm mt-1">Scannez des produits pour commencer</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-background border-2 rounded-xl hover:shadow-md transition-all animate-scale-in"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="font-semibold truncate text-base">{item.name}</p>
                        <p className="text-sm text-muted-foreground font-medium mt-0.5">
                          {item.price.toLocaleString()} FCFA × {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-primary mt-1">
                          = {(item.price * item.quantity).toLocaleString()} FCFA
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-10 w-10 border-2 hover:bg-destructive/10 hover:border-destructive transition-all"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Badge variant="secondary" className="min-w-[3rem] text-center text-base font-bold py-2">
                          {item.quantity}
                        </Badge>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-10 w-10 border-2 hover:bg-primary/10 hover:border-primary transition-all"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => removeFromCart(item.id)}
                          className="h-10 w-10 text-destructive border-2 border-destructive/20 hover:bg-destructive hover:text-destructive-foreground transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
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
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border-2 border-primary/30 shadow-lg">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center p-4 bg-background/50 rounded-xl border-2">
                  <span className="text-xl font-bold">TOTAL</span>
                  <span className="text-3xl sm:text-4xl font-bold text-primary">
                    {total.toLocaleString()} <span className="text-lg">FCFA</span>
                  </span>
                </div>
                <Button
                  onClick={validateSale}
                  className="w-full h-16 text-lg font-bold shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
                  size="lg"
                  disabled={addSale.isPending}
                >
                  {addSale.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Validation en cours...
                    </>
                  ) : (
                    <>
                      ✅ Valider la Vente & Imprimer
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Le ticket sera imprimé automatiquement
                </p>
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
