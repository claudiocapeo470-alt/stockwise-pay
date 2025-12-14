import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useToast } from "@/hooks/use-toast";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useAuth } from "@/contexts/AuthContext";
import Quagga from "quagga";
import { Camera, Scan, Plus, Minus, ShoppingCart, Printer, Trash2, Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import stocknixLogo from "@/assets/stocknix-logo-official.png";

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
  const { settings } = useCompanySettings();
  const { profile } = useAuth();
  const scannerInitialized = useRef(false);
  
  // Anti-doublon et cooldown pour le scanner
  const lastScannedCode = useRef<string | null>(null);
  const lastScanTime = useRef<number>(0);
  const scanCooldown = 2000; // 2 secondes de délai entre chaque scan du même code
  const globalCooldown = useRef(false); // Cooldown global après scan réussi

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

      // Détecter les codes-barres avec anti-doublon et cooldown
      Quagga.onDetected((result) => {
        if (result && result.codeResult && result.codeResult.code) {
          const code = result.codeResult.code.trim();
          const currentTime = Date.now();
          
          // Vérifier si en cooldown global (après un scan réussi)
          if (globalCooldown.current) {
            return;
          }
          
          // Vérifier le cooldown pour le même code
          if (code === lastScannedCode.current && (currentTime - lastScanTime.current) < scanCooldown) {
            return; // Ignorer - même code scanné trop rapidement
          }
          
          // Mettre à jour les références
          lastScannedCode.current = code;
          lastScanTime.current = currentTime;
          
          setCodeArticle(code);
          
          // Chercher le produit correspondant
          const product = products.find(p => p.sku === code);
          
          if (product) {
            // Activer le cooldown global
            globalCooldown.current = true;
            
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
              // Réinitialiser le cooldown global après fermeture
              setTimeout(() => {
                globalCooldown.current = false;
                lastScannedCode.current = null;
              }, 1000);
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

  // Nom de l'entreprise
  const companyName = settings?.company_name || profile?.company_name || "Stocknix";
  const companyAddress = settings?.company_address || "";
  const companyCity = settings?.company_city || "";
  const companyPhone = settings?.company_phone || "";
  const companyEmail = settings?.company_email || "";

  // Générer PDF du reçu type POS
  const generateReceiptPDF = () => {
    const doc = new jsPDF({
      format: [80, 220],
      unit: 'mm'
    });

    let y = 8;

    // Logo et en-tête entreprise
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(companyName.toUpperCase(), 40, y, { align: 'center' });
    y += 5;

    if (companyAddress) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(companyAddress, 40, y, { align: 'center' });
      y += 4;
    }
    if (companyCity) {
      doc.text(companyCity, 40, y, { align: 'center' });
      y += 4;
    }
    if (companyPhone) {
      doc.text(`Tél: ${companyPhone}`, 40, y, { align: 'center' });
      y += 4;
    }

    // Ligne de séparation
    y += 2;
    doc.setFontSize(8);
    doc.text('━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 40, y, { align: 'center' });
    y += 5;

    // Date et heure
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 5, y);
    doc.text(`Heure: ${new Date().toLocaleTimeString('fr-FR')}`, 75, y, { align: 'right' });
    y += 5;
    doc.text('━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 40, y, { align: 'center' });
    y += 6;

    // Produits
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    cart.forEach((item) => {
      doc.setFont("helvetica", "normal");
      doc.text(`${item.name}`, 5, y);
      y += 4;
      doc.text(`  ${item.quantity} x ${item.price.toLocaleString('fr-FR')} FCFA`, 5, y);
      doc.text(`${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA`, 75, y, { align: 'right' });
      y += 5;
    });

    // Total
    y += 2;
    doc.text('━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 40, y, { align: 'center' });
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text('TOTAL:', 5, y);
    doc.text(`${total.toLocaleString('fr-FR')} FCFA`, 75, y, { align: 'right' });
    y += 8;

    // Message de remerciement
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text('Merci et à bientôt !', 40, y, { align: 'center' });
    y += 5;
    doc.setFontSize(7);
    doc.text('Powered by Stocknix', 40, y, { align: 'center' });

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

  // Imprimer le reçu automatiquement (ticket POS)
  const printReceipt = () => {
    const printWindow = window.open('', '', 'width=320,height=600');
    if (!printWindow) return;

    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket - ${companyName}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              width: 80mm; 
              padding: 8px;
              background: #fff;
            }
            .header { text-align: center; margin-bottom: 8px; }
            .company-name { font-size: 16px; font-weight: bold; text-transform: uppercase; }
            .company-info { font-size: 10px; color: #444; }
            .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
            .date-row { display: flex; justify-content: space-between; font-size: 10px; }
            .item { margin: 4px 0; }
            .item-name { font-weight: 500; }
            .item-detail { display: flex; justify-content: space-between; font-size: 11px; padding-left: 8px; }
            .total-section { margin-top: 8px; padding-top: 8px; border-top: 2px solid #000; }
            .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; }
            .footer { text-align: center; margin-top: 12px; font-size: 11px; }
            .thank-you { font-style: italic; font-weight: 500; }
            .powered { font-size: 9px; color: #666; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${companyName}</div>
            ${companyAddress ? `<div class="company-info">${companyAddress}</div>` : ''}
            ${companyCity ? `<div class="company-info">${companyCity}</div>` : ''}
            ${companyPhone ? `<div class="company-info">Tél: ${companyPhone}</div>` : ''}
          </div>
          <div class="divider"></div>
          <div class="date-row">
            <span>Date: ${new Date().toLocaleDateString('fr-FR')}</span>
            <span>Heure: ${new Date().toLocaleTimeString('fr-FR')}</span>
          </div>
          <div class="divider"></div>
          ${cart.map(item => `
            <div class="item">
              <div class="item-name">${item.name}</div>
              <div class="item-detail">
                <span>${item.quantity} x ${item.price.toLocaleString('fr-FR')} FCFA</span>
                <span>${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          `).join('')}
          <div class="total-section">
            <div class="total-row">
              <span>TOTAL</span>
              <span>${total.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
          <div class="footer">
            <div class="thank-you">Merci et à bientôt !</div>
            <div class="powered">Powered by Stocknix</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptContent);
    printWindow.document.close();
    
    // Attendre le chargement avant d'imprimer
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };
    
    // Fallback si onload ne fonctionne pas
    setTimeout(() => {
      printWindow.print();
    }, 300);
    
    // Réinitialiser après impression
    setTimeout(() => {
      setCart([]);
      setShowReceipt(false);
    }, 1000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-20 md:pb-6">
      {/* Header avec description */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-muted-foreground">Scannez vos produits et validez la vente rapidement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Panneau de scan */}
        <div className="space-y-4">
          <Card className="shadow-md border-2">
            <CardHeader className="pb-4 border-b bg-muted/30">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Scan className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Scanner de Produits
                </CardTitle>
                {/* Bouton Scanner Caméra dans l'en-tête */}
                <Button
                  onClick={toggleCamera}
                  variant={cameraActive ? "destructive" : "default"}
                  size="sm"
                  className={`h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold shadow-md ${
                    cameraActive 
                      ? 'bg-destructive hover:bg-destructive/90' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  <Camera className="h-4 w-4 mr-1.5" />
                  <span className="hidden xs:inline">{cameraActive ? "Arrêter" : "Scanner"}</span>
                  <span className="xs:hidden">{cameraActive ? "Stop" : "Scan"}</span>
                </Button>
              </div>
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
