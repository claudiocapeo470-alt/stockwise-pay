import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useToast } from "@/hooks/use-toast";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { getIconBgStyle } from "@/components/stocks/EmojiPicker";
import {
  ArrowLeft, Search, Plus, Minus, Trash2, ShoppingCart,
  Printer, Clock, User, Store, Lock, MoreHorizontal,
  ClipboardList, Home, BarChart3, Settings, Pause,
  Calculator, Delete, Camera, X
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  icon_emoji: string;
  icon_bg_color: string;
  category: string | null;
  image_url: string | null;
}

interface HeldTicket {
  id: string;
  items: CartItem[];
  total: number;
  customerName: string;
  createdAt: Date;
}

export default function Caisse() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [cashInput, setCashInput] = useState("");
  const [showCashModal, setShowCashModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showNumpad, setShowNumpad] = useState(false);
  const [numpadValue, setNumpadValue] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockPin, setLockPin] = useState("");
  const [heldTickets, setHeldTickets] = useState<HeldTicket[]>([]);
  const [showHeldTickets, setShowHeldTickets] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const { products } = useProducts();
  const { addSale } = useSales();
  const { toast } = useToast();
  const { settings } = useCompanySettings();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const barcodeBufferRef = useRef("");
  const barcodeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => { if (p.category) cats.add(p.category); });
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory) filtered = filtered.filter(p => p.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // Group products by category for separators
  const groupedProducts = useMemo(() => {
    if (selectedCategory || searchQuery.trim()) return null;
    const groups: Record<string, typeof products> = {};
    filteredProducts.forEach(p => {
      const cat = p.category || "Sans catégorie";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredProducts, selectedCategory, searchQuery]);

  const addToCart = (product: any) => {
    if (product.quantity <= 0) {
      toast({ title: "Rupture de stock", description: `${product.name} n'est plus disponible`, variant: "destructive" });
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, icon_emoji: product.icon_emoji || "📦", icon_bg_color: product.icon_bg_color || "bg-blue", category: product.category, image_url: product.image_url || null }];
    });
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const companyName = settings?.company_name || profile?.company_name || "Stocknix";

  // USB/HID barcode scanner listener
  useEffect(() => {
    if (isMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked || showCashModal || showReceipt || showCustomerModal) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.key === "Enter" && barcodeBufferRef.current.length >= 4) {
        const code = barcodeBufferRef.current;
        barcodeBufferRef.current = "";
        const found = products.find(p => p.sku === code || p.name.toLowerCase() === code.toLowerCase());
        if (found) {
          addToCart(found);
          toast({ title: "✅ Produit scanné", description: found.name });
        } else {
          toast({ title: "Produit non trouvé", description: `Code: ${code}`, variant: "destructive" });
        }
        return;
      }

      if (e.key.length === 1) {
        barcodeBufferRef.current += e.key;
        if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
        barcodeTimerRef.current = setTimeout(() => { barcodeBufferRef.current = ""; }, 100);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [products, isMobile, isLocked, showCashModal, showReceipt, showCustomerModal]);

  // Mobile camera scanner
  const startScanner = async () => {
    setShowScanner(true);
    try {
      const html5Qrcode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5Qrcode;
      await html5Qrcode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          const found = products.find(p => p.sku === text);
          if (found) {
            addToCart(found);
            toast({ title: "✅ Produit scanné", description: found.name });
          } else {
            toast({ title: "Produit non trouvé", description: `Code: ${text}`, variant: "destructive" });
          }
          stopScanner();
        },
        () => {}
      );
    } catch {
      toast({ title: "Erreur caméra", description: "Impossible d'ouvrir la caméra", variant: "destructive" });
      setShowScanner(false);
    }
  };

  const stopScanner = () => {
    scannerRef.current?.stop().catch(() => {});
    scannerRef.current = null;
    setShowScanner(false);
  };

  const validateSale = async (paymentMethod: string = "Espèces") => {
    if (cart.length === 0) return;
    try {
      for (const item of cart) {
        await addSale.mutateAsync({
          product_id: item.id, quantity: item.quantity, unit_price: item.price,
          total_amount: item.price * item.quantity, paid_amount: item.price * item.quantity,
          customer_name: customerName || null, customer_phone: null, sale_date: new Date().toISOString(),
          payment_method: paymentMethod,
        });
      }
      setShowReceipt(true);
      toast({ title: "✅ Vente validée", description: `Paiement ${paymentMethod} — ${total.toLocaleString()} FCFA` });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer la vente", variant: "destructive" });
    }
  };

  // Hold ticket
  const holdTicket = () => {
    if (cart.length === 0) return;
    const ticket: HeldTicket = {
      id: Date.now().toString(),
      items: [...cart],
      total,
      customerName: customerName || `Ticket #${heldTickets.length + 1}`,
      createdAt: new Date(),
    };
    setHeldTickets(prev => [...prev, ticket]);
    setCart([]);
    setCustomerName("");
    toast({ title: "⏸️ Ticket mis en attente", description: ticket.customerName });
  };

  const resumeTicket = (ticketId: string) => {
    const ticket = heldTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    if (cart.length > 0) holdTicket();
    setCart(ticket.items);
    setCustomerName(ticket.customerName);
    setHeldTickets(prev => prev.filter(t => t.id !== ticketId));
    setShowHeldTickets(false);
  };

  // Numpad
  const handleNumpadKey = (key: string) => {
    if (key === "C") { setNumpadValue(""); return; }
    if (key === "⌫") { setNumpadValue(prev => prev.slice(0, -1)); return; }
    if (key === "OK") {
      const val = parseInt(numpadValue);
      if (selectedItemId && val > 0) {
        setCart(prev => prev.map(item => item.id === selectedItemId ? { ...item, quantity: val } : item));
        toast({ title: "Quantité mise à jour", description: `${val} unité(s)` });
      }
      setNumpadValue("");
      return;
    }
    setNumpadValue(prev => prev + key);
  };

  const printReceipt = () => {
    const printWindow = window.open('', '', 'width=320,height=600');
    if (!printWindow) return;
    const receiptContent = `<!DOCTYPE html><html><head><title>Ticket</title><style>@page{size:80mm auto;margin:0}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;width:80mm;padding:8px;background:#fff}.header{text-align:center;margin-bottom:8px}.company-name{font-size:16px;font-weight:bold;text-transform:uppercase}.divider{border-bottom:1px dashed #000;margin:6px 0}.date-row{display:flex;justify-content:space-between;font-size:10px}.item{margin:4px 0}.item-detail{display:flex;justify-content:space-between;font-size:11px;padding-left:8px}.total-section{margin-top:8px;padding-top:8px;border-top:2px solid #000}.total-row{display:flex;justify-content:space-between;font-size:14px;font-weight:bold}.footer{text-align:center;margin-top:12px;font-size:11px}</style></head><body><div class="header"><div class="company-name">${companyName}</div></div><div class="divider"></div><div class="date-row"><span>Date: ${new Date().toLocaleDateString('fr-FR')}</span><span>${new Date().toLocaleTimeString('fr-FR')}</span></div>${customerName ? `<div class="date-row"><span>Client: ${customerName}</span></div>` : ''}<div class="divider"></div>${cart.map(item => `<div class="item"><div>${item.icon_emoji} ${item.name}</div><div class="item-detail"><span>${item.quantity} x ${item.price.toLocaleString('fr-FR')} FCFA</span><span>${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</span></div></div>`).join('')}<div class="total-section"><div class="total-row"><span>TOTAL</span><span>${total.toLocaleString('fr-FR')} FCFA</span></div></div><div class="footer"><div>Merci et à bientôt !</div><div style="font-size:9px;color:#666;margin-top:4px">Powered by Stocknix</div></div></body></html>`;
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); printWindow.onafterprint = () => printWindow.close(); };
    setTimeout(() => { setCart([]); setShowReceipt(false); setShowCashModal(false); setCustomerName(""); }, 1000);
  };

  const cashChange = cashInput ? parseFloat(cashInput) - total : 0;

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lock screen
  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm px-4">
          <Lock className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-bold">Caisse verrouillée</h2>
          <p className="text-sm text-muted-foreground">Entrez le PIN pour déverrouiller</p>
          <Input type="password" value={lockPin} onChange={e => setLockPin(e.target.value)} placeholder="PIN" className="text-center text-2xl tracking-widest h-14" maxLength={4}
            onKeyDown={e => { if (e.key === "Enter" && lockPin.length >= 4) { setIsLocked(false); setLockPin(""); } }}
          />
          <Button onClick={() => { if (lockPin.length >= 4) { setIsLocked(false); setLockPin(""); } }} className="w-full h-12">Déverrouiller</Button>
        </div>
      </div>
    );
  }

  const ProductTile = ({ product }: { product: any }) => {
    const isOutOfStock = product.quantity <= 0;
    const isLowStock = product.quantity > 0 && product.quantity <= 5;
    return (
      <button
        onClick={() => !isOutOfStock && addToCart(product)}
        disabled={isOutOfStock}
        className={`relative p-3 rounded-2xl border text-left transition-all group ${
          isOutOfStock
            ? 'opacity-40 cursor-not-allowed bg-muted border-border'
            : 'bg-card hover:border-primary/50 hover:-translate-y-[2px] hover:shadow-lg border-border active:scale-95'
        }`}
      >
        <div className="flex items-center justify-center mb-2">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-14 w-14 rounded-xl object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-xl flex items-center justify-center" style={getIconBgStyle(product.icon_bg_color || 'bg-blue')}>
              <span className="text-[36px] leading-none">{product.icon_emoji || '📦'}</span>
            </div>
          )}
        </div>
        <p className="text-xs font-semibold text-foreground truncate text-center">{product.name}</p>
        <p className="text-xs font-extrabold text-primary mt-0.5 text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
          {product.price.toLocaleString()} F
        </p>
        {isOutOfStock && <Badge variant="destructive" className="absolute top-1.5 right-1.5 text-[9px]">Rupture</Badge>}
        {isLowStock && <Badge className="absolute top-1.5 right-1.5 text-[9px] bg-warning text-warning-foreground">Stock bas</Badge>}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
      {/* TOP BAR — SHOPCAiSSE style */}
      <div className="h-12 bg-card border-b border-border flex items-center justify-between px-2 sm:px-4 shrink-0">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')} className="gap-1 text-muted-foreground hover:text-foreground h-8 px-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Retour</span>
          </Button>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <Button variant="ghost" size="sm" className="gap-1 h-8 px-2 text-xs" onClick={() => setIsLocked(true)}>
            <Lock className="h-3.5 w-3.5" /> <span className="hidden md:inline">Verrouiller</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 h-8 px-2 text-xs">
                <MoreHorizontal className="h-3.5 w-3.5" /> <span className="hidden md:inline">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setCart([])}>🗑️ Vider le ticket</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { if (cart.length > 0) holdTicket(); }}>⏸️ Mettre en attente</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowCustomerModal(true)}>👤 Ajouter client</DropdownMenuItem>
              {isMobile && <DropdownMenuItem onClick={startScanner}>📷 Scanner un produit</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="sm" className="gap-1 h-8 px-2 text-xs relative" onClick={() => setShowHeldTickets(true)}>
            <ClipboardList className="h-3.5 w-3.5" /> <span className="hidden md:inline">Tickets</span>
            {heldTickets.length > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[9px] text-white flex items-center justify-center font-bold">{heldTickets.length}</span>}
          </Button>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="default" size="sm" className="gap-1 h-8 px-2 sm:px-3 text-xs">
            <Home className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Ma Caisse</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 h-8 px-2 text-xs" onClick={() => navigate('/app/performance')}>
            <BarChart3 className="h-3.5 w-3.5" /> <span className="hidden md:inline">Stats</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 h-8 px-2 text-xs" onClick={() => navigate('/app/settings')}>
            <Settings className="h-3.5 w-3.5" /> <span className="hidden md:inline">Réglages</span>
          </Button>
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground ml-2">
            <Clock className="h-3.5 w-3.5" />
            {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Categories */}
        {!isMobile && (
          <div className="w-24 flex flex-col shrink-0 border-r border-border" style={{ background: 'hsl(var(--card))' }}>
            <div className="flex-1 overflow-y-auto py-1 space-y-0.5">
              <button onClick={() => setShowSearch(!showSearch)} className={`w-full flex flex-col items-center gap-0.5 py-2.5 px-1 text-[10px] font-medium transition-colors ${showSearch ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
                <Search className="h-4 w-4" />
                <span>Recherche</span>
              </button>
              <button onClick={() => { setSelectedCategory(null); setShowSearch(false); }}
                className={`w-full flex flex-col items-center gap-0.5 py-2.5 px-1 text-[10px] font-medium transition-colors ${selectedCategory === null && !showSearch ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
                <span className="text-base">📋</span>
                <span>Tout</span>
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => { setSelectedCategory(cat); setShowSearch(false); }}
                  className={`w-full flex flex-col items-center gap-0.5 py-2.5 px-1 text-[10px] font-medium transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
                  <span className="text-base">📦</span>
                  <span className="truncate w-full text-center">{cat}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CENTER: Products Grid */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'hsl(var(--muted) / 0.3)' }}>
          {(isMobile || showSearch) && (
            <div className="p-3 border-b border-border bg-card">
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" autoFocus />
                </div>
                {isMobile && (
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={startScanner}>
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isMobile && (
                <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                  <Button variant={selectedCategory === null ? "secondary" : "outline"} size="sm" className="shrink-0 text-[10px] h-7" onClick={() => setSelectedCategory(null)}>Tout</Button>
                  {categories.map(cat => (
                    <Button key={cat} variant={selectedCategory === cat ? "secondary" : "outline"} size="sm" className="shrink-0 text-[10px] h-7" onClick={() => setSelectedCategory(cat)}>{cat}</Button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3">
            {filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun produit trouvé</p>
                </div>
              </div>
            ) : groupedProducts ? (
              // Show with category separators
              <div className="space-y-4">
                {groupedProducts.map(([cat, prods]) => (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{cat}</span>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] text-muted-foreground">{prods.length}</span>
                    </div>
                    <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
                      {prods.map(product => <ProductTile key={product.id} product={product} />)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
                {filteredProducts.map(product => <ProductTile key={product.id} product={product} />)}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Ticket Panel */}
        {!isMobile && (
          <div className="w-72 bg-card border-l border-border flex flex-col shrink-0">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Ticket</span>
                {customerName && <span className="text-xs text-muted-foreground">— {customerName}</span>}
              </div>
              <Badge variant="secondary" className="text-xs">{totalItems}</Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">Aucun article</p>
                  </div>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} onClick={() => setSelectedItemId(item.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-colors cursor-pointer ${selectedItemId === item.id ? 'border-primary bg-primary/5' : 'bg-background border-border'}`}>
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="h-8 w-8 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={getIconBgStyle(item.icon_bg_color)}>
                        <span className="text-lg">{item.icon_emoji}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-xs text-primary font-bold">{item.price.toLocaleString()} F</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}><Minus className="h-3 w-3" /></Button>
                      <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}><Plus className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border" />

            {/* Action buttons row */}
            <div className="p-2">
              <div className="grid grid-cols-3 gap-1 mb-2">
                <Button variant="outline" size="sm" className="text-[9px] h-8 gap-0.5 px-1" onClick={() => setShowCustomerModal(true)}>
                  <User className="h-3 w-3" />Ajouter Client
                </Button>
                <Button variant="outline" size="sm" className="text-[9px] h-8 gap-0.5 px-1" onClick={holdTicket} disabled={cart.length === 0}>
                  <Pause className="h-3 w-3" />Mettre en attente
                </Button>
                <Button variant="outline" size="sm" className="text-[9px] h-8 gap-0.5 px-1" onClick={() => setCart([])}>
                  <Trash2 className="h-3 w-3" />Vider
                </Button>
              </div>
            </div>

            {/* Total + Payment */}
            <div className="p-3 space-y-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">TOTAL</span>
                <span className="text-xl font-black" style={{ fontFamily: 'Nunito, sans-serif' }}>{total.toLocaleString()} <span className="text-[10px] font-medium">FCFA</span></span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <Button className="h-10 text-sm font-bold gap-1" style={{ background: '#16a34a' }} onClick={() => cart.length > 0 && setShowCashModal(true)} disabled={cart.length === 0}>
                  💵 Espèces
                </Button>
                <Button className="h-10 text-sm font-bold gap-1 bg-primary hover:bg-primary/90" onClick={() => validateSale("Carte bancaire")} disabled={cart.length === 0 || addSale.isPending}>
                  💳 CB
                </Button>
              </div>

              {/* Numpad toggle */}
              <button onClick={() => setShowNumpad(!showNumpad)} className="w-full text-center text-[10px] text-muted-foreground hover:text-foreground transition-colors py-1">
                <Calculator className="h-3 w-3 inline mr-1" />
                {showNumpad ? "Masquer" : "Afficher"} le clavier numérique
              </button>
            </div>

            {/* Numpad */}
            {showNumpad && (
              <div className="border-t border-border p-2">
                <div className="text-center mb-1">
                  <span className="text-lg font-mono font-bold">{numpadValue || "0"}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {["7","8","9","C","4","5","6","⌫","1","2","3","OK","0","00",",",""].map((key, i) => (
                    key ? (
                      <Button key={i} variant={key === "OK" ? "default" : key === "C" ? "destructive" : "outline"} size="sm" className="h-8 text-xs font-bold" onClick={() => handleNumpadKey(key)}>
                        {key === "⌫" ? <Delete className="h-3 w-3" /> : key}
                      </Button>
                    ) : <div key={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM */}
      {isMobile && cart.length > 0 && (
        <div className="shrink-0 border-t border-border bg-card p-3 space-y-2">
          <div className="max-h-28 overflow-y-auto space-y-1">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="truncate flex-1">{item.icon_emoji} {item.name} × {item.quantity}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                  <span className="font-bold text-primary ml-1">{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold">TOTAL: <span className="text-primary">{total.toLocaleString()} F</span></span>
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="h-8 px-2" onClick={holdTicket}><Pause className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => setCart([])}><Trash2 className="h-3.5 w-3.5" /></Button>
              <Button size="sm" style={{ background: '#16a34a' }} className="gap-1 h-8" onClick={() => setShowCashModal(true)}>💵 Payer</Button>
            </div>
          </div>
        </div>
      )}

      {/* CASH MODAL */}
      {showCashModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setShowCashModal(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-center">💵 Paiement Espèces</h3>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total à payer</p>
              <p className="text-3xl font-black text-primary">{total.toLocaleString()} FCFA</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Montant reçu</label>
              <Input type="number" value={cashInput} onChange={e => setCashInput(e.target.value)} placeholder="Montant donné..." className="mt-1 text-lg h-12 text-center font-bold" autoFocus />
            </div>
            {cashInput && parseFloat(cashInput) >= total && (
              <div className="text-center p-3 bg-primary/10 rounded-xl">
                <p className="text-sm text-muted-foreground">Monnaie à rendre</p>
                <p className="text-2xl font-black text-primary">{cashChange.toLocaleString()} FCFA</p>
              </div>
            )}
            {cashInput && parseFloat(cashInput) < total && <p className="text-sm text-center text-destructive font-medium">Montant insuffisant</p>}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => { setShowCashModal(false); setCashInput(""); }}>Annuler</Button>
              <Button className="bg-primary" disabled={!cashInput || parseFloat(cashInput) < total || addSale.isPending} onClick={() => { validateSale("Espèces"); setCashInput(""); }}>
                {addSale.isPending ? "..." : "✅ Confirmer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {showReceipt && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-center">🧾 Ticket de caisse</h3>
            <div className="border rounded-xl p-4 bg-background space-y-2 font-mono text-sm">
              <p className="text-center font-bold">{companyName}</p>
              <p className="text-center text-xs text-muted-foreground">{new Date().toLocaleDateString('fr-FR')} — {new Date().toLocaleTimeString('fr-FR')}</p>
              {customerName && <p className="text-center text-xs">Client: {customerName}</p>}
              <div className="border-t border-dashed my-2" />
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span>{item.icon_emoji} {item.name} ×{item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString()} F</span>
                </div>
              ))}
              <div className="border-t border-dashed my-2" />
              <div className="flex justify-between font-bold"><span>TOTAL</span><span>{total.toLocaleString()} FCFA</span></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={printReceipt} className="gap-2"><Printer className="h-4 w-4" /> Imprimer</Button>
              <Button variant="outline" onClick={() => { setCart([]); setShowReceipt(false); setShowCashModal(false); setCustomerName(""); }}>Nouveau ticket</Button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER NAME MODAL */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setShowCustomerModal(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-center">👤 Ajouter un client</h3>
            <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nom du client..." className="h-12 text-center" autoFocus />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setShowCustomerModal(false)}>Annuler</Button>
              <Button onClick={() => { setShowCustomerModal(false); toast({ title: "Client ajouté", description: customerName || "Anonyme" }); }}>✅ Valider</Button>
            </div>
          </div>
        </div>
      )}

      {/* HELD TICKETS MODAL */}
      {showHeldTickets && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setShowHeldTickets(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-center">🎫 Tickets en attente ({heldTickets.length})</h3>
            {heldTickets.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Aucun ticket en attente</p>
            ) : (
              <div className="space-y-2">
                {heldTickets.map(ticket => (
                  <div key={ticket.id} className="p-3 rounded-xl border border-border bg-background flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{ticket.customerName}</p>
                      <p className="text-xs text-muted-foreground">{ticket.items.length} articles — {ticket.total.toLocaleString()} FCFA</p>
                      <p className="text-[10px] text-muted-foreground">{ticket.createdAt.toLocaleTimeString('fr-FR')}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="default" onClick={() => resumeTicket(ticket.id)}>Reprendre</Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setHeldTickets(prev => prev.filter(t => t.id !== ticket.id))}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full" onClick={() => setShowHeldTickets(false)}>Fermer</Button>
          </div>
        </div>
      )}

      {/* SCANNER MODAL */}
      {showScanner && (
        <div className="fixed inset-0 z-[70] bg-black flex flex-col">
          <div className="flex items-center justify-between p-4">
            <span className="text-white font-bold">📷 Scanner un code-barres</span>
            <Button variant="ghost" size="icon" onClick={stopScanner} className="text-white"><X className="h-5 w-5" /></Button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div id="qr-reader" className="w-full max-w-sm" />
          </div>
        </div>
      )}
    </div>
  );
}
