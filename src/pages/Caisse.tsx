import { useState, useEffect, useRef, useMemo } from "react";
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
  Printer, Clock, User, Store, DollarSign, CreditCard,
  Pause
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  icon_emoji: string;
  icon_bg_color: string;
  category: string | null;
}

export default function Caisse() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [cashInput, setCashInput] = useState("");
  const [showCashModal, setShowCashModal] = useState(false);

  const { products } = useProducts();
  const { addSale } = useSales();
  const { toast } = useToast();
  const { settings } = useCompanySettings();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  const addToCart = (product: any) => {
    if (product.quantity <= 0) {
      toast({ title: "Rupture de stock", description: `${product.name} n'est plus disponible`, variant: "destructive" });
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, icon_emoji: product.icon_emoji || "📦", icon_bg_color: product.icon_bg_color || "bg-blue", category: product.category }];
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

  const validateSale = async (paymentMethod: string = "Espèces") => {
    if (cart.length === 0) return;
    try {
      for (const item of cart) {
        await addSale.mutateAsync({
          product_id: item.id, quantity: item.quantity, unit_price: item.price,
          total_amount: item.price * item.quantity, paid_amount: item.price * item.quantity,
          customer_name: null, customer_phone: null, sale_date: new Date().toISOString(),
          payment_method: paymentMethod,
        });
      }
      setShowReceipt(true);
      toast({ title: "✅ Vente validée", description: `Paiement ${paymentMethod} — ${total.toLocaleString()} FCFA` });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible d'enregistrer la vente", variant: "destructive" });
    }
  };

  const printReceipt = () => {
    const printWindow = window.open('', '', 'width=320,height=600');
    if (!printWindow) return;
    const receiptContent = `<!DOCTYPE html><html><head><title>Ticket</title><style>@page{size:80mm auto;margin:0}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;width:80mm;padding:8px;background:#fff}.header{text-align:center;margin-bottom:8px}.company-name{font-size:16px;font-weight:bold;text-transform:uppercase}.divider{border-bottom:1px dashed #000;margin:6px 0}.date-row{display:flex;justify-content:space-between;font-size:10px}.item{margin:4px 0}.item-detail{display:flex;justify-content:space-between;font-size:11px;padding-left:8px}.total-section{margin-top:8px;padding-top:8px;border-top:2px solid #000}.total-row{display:flex;justify-content:space-between;font-size:14px;font-weight:bold}.footer{text-align:center;margin-top:12px;font-size:11px}</style></head><body><div class="header"><div class="company-name">${companyName}</div></div><div class="divider"></div><div class="date-row"><span>Date: ${new Date().toLocaleDateString('fr-FR')}</span><span>${new Date().toLocaleTimeString('fr-FR')}</span></div><div class="divider"></div>${cart.map(item => `<div class="item"><div>${item.icon_emoji} ${item.name}</div><div class="item-detail"><span>${item.quantity} x ${item.price.toLocaleString('fr-FR')} FCFA</span><span>${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</span></div></div>`).join('')}<div class="total-section"><div class="total-row"><span>TOTAL</span><span>${total.toLocaleString('fr-FR')} FCFA</span></div></div><div class="footer"><div>Merci et à bientôt !</div><div style="font-size:9px;color:#666;margin-top:4px">Powered by Stocknix</div></div></body></html>`;
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); printWindow.onafterprint = () => printWindow.close(); };
    setTimeout(() => { setCart([]); setShowReceipt(false); setShowCashModal(false); }, 1000);
  };

  const cashChange = cashInput ? parseFloat(cashInput) - total : 0;

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
      {/* TOP BAR */}
      <div className="h-12 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')} className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Retour</span>
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Mode Caisse</span>
            <span className="hidden md:inline text-sm text-muted-foreground">— {companyName}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            {profile?.first_name || 'Caissier'}
          </div>
        </div>
      </div>

      {/* MAIN 3-ZONE LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Categories */}
        {!isMobile && (
          <div className="w-28 flex flex-col shrink-0" style={{ background: 'hsl(var(--card))' }}>
            <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
              <button
                onClick={() => { setSelectedCategory(null); setShowSearch(false); }}
                className={`w-full flex flex-col items-center gap-1 py-3 px-1 text-xs font-medium transition-colors ${
                  selectedCategory === null && !showSearch ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <span className="text-lg">📋</span>
                <span className="truncate w-full text-center">Tout</span>
              </button>
              <button
                onClick={() => { setShowSearch(!showSearch); setSelectedCategory(null); }}
                className={`w-full flex flex-col items-center gap-1 py-3 px-1 text-xs font-medium transition-colors ${
                  showSearch ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                <Search className="h-5 w-5" />
                <span>Recherche</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setShowSearch(false); }}
                  className={`w-full flex flex-col items-center gap-1 py-3 px-1 text-xs font-medium transition-colors ${
                    selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <span className="text-lg">📦</span>
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher un produit..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10" autoFocus />
              </div>
              {isMobile && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  <Button variant={selectedCategory === null ? "secondary" : "outline"} size="sm" className="shrink-0 text-xs" onClick={() => setSelectedCategory(null)}>Tout</Button>
                  {categories.map(cat => (
                    <Button key={cat} variant={selectedCategory === cat ? "secondary" : "outline"} size="sm" className="shrink-0 text-xs" onClick={() => setSelectedCategory(cat)}>📦 {cat}</Button>
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
            ) : (
              <div className={`grid gap-2.5 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {filteredProducts.map(product => {
                  const isOutOfStock = product.quantity <= 0;
                  const isLowStock = product.quantity > 0 && product.quantity <= 5;
                  return (
                    <button
                      key={product.id}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      disabled={isOutOfStock}
                      className={`relative p-4 rounded-2xl border text-left transition-all group ${
                        isOutOfStock
                          ? 'opacity-40 cursor-not-allowed bg-muted border-border'
                          : 'bg-card hover:border-primary/50 hover:-translate-y-[3px] hover:shadow-lg border-border active:scale-95'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-3">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={getIconBgStyle(product.icon_bg_color || 'bg-blue')}>
                          <span className="text-[42px] leading-none">{product.icon_emoji || '📦'}</span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate text-center">{product.name}</p>
                      <p className="text-sm font-extrabold text-primary mt-1 text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
                        {product.price.toLocaleString()} FCFA
                      </p>
                      {isOutOfStock && <Badge variant="destructive" className="absolute top-2 right-2 text-[10px]">Rupture</Badge>}
                      {isLowStock && <Badge className="absolute top-2 right-2 text-[10px] bg-warning text-warning-foreground">Stock bas</Badge>}
                    </button>
                  );
                })}
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
                <span className="text-sm font-semibold">🛒 Ticket en cours</span>
              </div>
              <Badge variant="secondary" className="text-xs">{totalItems} art.</Badge>
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
                  <div key={item.id} className="flex items-center gap-2 p-2 rounded-xl bg-background border border-border">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={getIconBgStyle(item.icon_bg_color)}>
                      <span className="text-lg">{item.icon_emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-xs text-primary font-bold">{item.price.toLocaleString()} F</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                      <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border" />

            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>TOTAL</span>
                <span className="text-2xl font-black" style={{ fontFamily: 'Nunito, sans-serif', color: 'hsl(var(--foreground))' }}>{total.toLocaleString()} <span className="text-xs font-medium">FCFA</span></span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <Button variant="outline" size="sm" className="text-[10px] h-8 gap-1"><User className="h-3 w-3" />Client</Button>
                <Button variant="outline" size="sm" className="text-[10px] h-8 gap-1"><Pause className="h-3 w-3" />Attente</Button>
                <Button variant="outline" size="sm" className="text-[10px] h-8 gap-1" onClick={() => setCart([])}><Trash2 className="h-3 w-3" />Vider</Button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <Button className="h-11 text-sm font-bold gap-2" style={{ background: '#16a34a' }} onClick={() => cart.length > 0 && setShowCashModal(true)} disabled={cart.length === 0}>
                  💵 Espèces
                </Button>
                <Button className="h-11 text-sm font-bold gap-2 bg-primary hover:bg-primary/90" onClick={() => validateSale("Carte bancaire")} disabled={cart.length === 0 || addSale.isPending}>
                  💳 CB
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM */}
      {isMobile && cart.length > 0 && (
        <div className="shrink-0 border-t border-border bg-card p-3 space-y-2">
          <div className="max-h-32 overflow-y-auto space-y-1">
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
            <span className="text-lg font-bold">TOTAL: <span className="text-primary">{total.toLocaleString()} FCFA</span></span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setCart([])}><Trash2 className="h-4 w-4" /></Button>
              <Button size="sm" style={{ background: '#16a34a' }} className="gap-1" onClick={() => setShowCashModal(true)}>💵 Payer</Button>
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
              <Input type="number" value={cashInput} onChange={e => setCashInput(e.target.value)} placeholder="Montant donné par le client..." className="mt-1 text-lg h-12 text-center font-bold" autoFocus />
            </div>
            {cashInput && parseFloat(cashInput) >= total && (
              <div className="text-center p-3 bg-primary/10 rounded-xl">
                <p className="text-sm text-muted-foreground">Monnaie à rendre</p>
                <p className="text-2xl font-black text-primary">{cashChange.toLocaleString()} FCFA</p>
              </div>
            )}
            {cashInput && parseFloat(cashInput) < total && (
              <p className="text-sm text-center text-destructive font-medium">Montant insuffisant</p>
            )}
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
              <div className="border-t border-dashed my-2" />
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span>{item.icon_emoji} {item.name} ×{item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString()} FCFA</span>
                </div>
              ))}
              <div className="border-t border-dashed my-2" />
              <div className="flex justify-between font-bold"><span>TOTAL</span><span>{total.toLocaleString()} FCFA</span></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={printReceipt} className="gap-2"><Printer className="h-4 w-4" /> Imprimer</Button>
              <Button variant="outline" onClick={() => { setCart([]); setShowReceipt(false); setShowCashModal(false); }}>Nouveau ticket</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
