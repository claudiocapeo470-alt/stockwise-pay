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
  Printer, Clock, User, Lock, MoreHorizontal,
  ClipboardList, Home, BarChart3, Settings, Pause,
  Delete, Camera, X, QrCode, HelpCircle, LogOut,
  ChevronRight, CreditCard, Smartphone, DollarSign,
  Menu as MenuIcon, Percent, Hash, StickyNote, DoorOpen, XCircle,
  FileText, Wallet, ArrowDownCircle, ArrowUpCircle
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { generateCashReportPDF, CashReportPreview } from "@/components/caisse/CashReport";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  icon_emoji: string;
  icon_bg_color: string;
  category: string | null;
  image_url: string | null;
  discount?: number; // discount amount on this item
  note?: string;
}

interface HeldTicket {
  id: string;
  items: CartItem[];
  total: number;
  customerName: string;
  tableName: string;
  createdAt: Date;
}

interface CashMovement {
  id: string;
  type: 'entry' | 'expense';
  amount: number;
  category: string;
  description: string;
  created_at: string;
}

const DEFAULT_COLORS = [
  "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444", "#10B981",
  "#F97316", "#EC4899", "#6366F1", "#14B8A6", "#A855F7",
  "#F43F5E", "#22C55E", "#0EA5E9", "#E11D48"
];

function getCategoryColor(cat: string, index: number, categoryColors: Record<string, string>): string {
  return categoryColors[cat] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

// Beep sound for scanner
function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1200;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
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
  const [numpadValue, setNumpadValue] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockPin, setLockPin] = useState("");
  const [heldTickets, setHeldTickets] = useState<HeldTicket[]>([]);
  const [showHeldTickets, setShowHeldTickets] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerStatus, setScannerStatus] = useState<'idle' | 'active' | 'detected' | 'not_found'>('idle');
  const [tableName, setTableName] = useState("Table 1");
  const [couverts, setCouverts] = useState(2);
  const [mobileView, setMobileView] = useState<'products' | 'ticket'>('products');

  // Cash session
  const [cashSessionOpen, setCashSessionOpen] = useState(false);
  const [showOpenCashModal, setShowOpenCashModal] = useState(true); // mandatory on load
  const [openingAmount, setOpeningAmount] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showCloseCashModal, setShowCloseCashModal] = useState(false);
  const [closingAmount, setClosingAmount] = useState("");
  const [closingNotes, setClosingNotes] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [closingMobile, setClosingMobile] = useState("");
  const [closingCard, setClosingCard] = useState("");
  const [showCloseReport, setShowCloseReport] = useState(false);
  const [closeReportData, setCloseReportData] = useState<any>(null);

  // Cash movements
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<'entry' | 'expense'>('entry');
  const [movementAmount, setMovementAmount] = useState("");
  const [movementCategory, setMovementCategory] = useState("");
  const [movementDescription, setMovementDescription] = useState("");
  const [sessionMovements, setSessionMovements] = useState<CashMovement[]>([]);
  const [showMovementsList, setShowMovementsList] = useState(false);

  // Session sales tracking
  const [sessionSales, setSessionSales] = useState({ total: 0, cash: 0, mobile: 0, card: 0 });

  // Discount modals
  const [showDiscountPercent, setShowDiscountPercent] = useState(false);
  const [showDiscountAmount, setShowDiscountAmount] = useState(false);
  const [discountValue, setDiscountValue] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [itemNote, setItemNote] = useState("");

  // Scanner fallback
  const [showManualScan, setShowManualScan] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");

  // Product not found
  const [showProductNotFound, setShowProductNotFound] = useState(false);
  const [notFoundCode, setNotFoundCode] = useState("");

  // Category colors from DB
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});

  const { products } = useProducts();
  const { addSale } = useSales();
  const { toast } = useToast();
  const { settings } = useCompanySettings();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const barcodeBufferRef = useRef("");
  const barcodeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScanTimeRef = useRef(0);
  const lastScanCodeRef = useRef("");

  // Load category colors from DB
  useEffect(() => {
    if (!user) return;
    supabase.from('product_categories').select('name, color').eq('user_id', user.id).then(({ data }) => {
      if (data) {
        const colors: Record<string, string> = {};
        data.forEach(c => { if (c.color) colors[c.name] = c.color; });
        setCategoryColors(colors);
      }
    });
  }, [user]);

  // Check for existing open session on mount
  useEffect(() => {
    if (!user) return;
    supabase.from('cash_sessions').select('*').eq('user_id', user.id).eq('status', 'open').order('opened_at', { ascending: false }).limit(1).then(({ data }) => {
      if (data && data.length > 0) {
        setCashSessionOpen(true);
        setCurrentSessionId(data[0].id);
        setOpeningAmount(String(data[0].opening_amount));
        setShowOpenCashModal(false);
      }
    });
  }, [user]);

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

  const addToCart = useCallback((product: any) => {
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
  }, [toast]);

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + (item.discount || 0), 0);
  const total = subtotal - totalDiscount;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const companyName = settings?.company_name || profile?.company_name || "Stocknix";

  // Anti-double-scan: 1.5s cooldown
  const handleScanResult = useCallback((code: string) => {
    const now = Date.now();
    if (code === lastScanCodeRef.current && now - lastScanTimeRef.current < 1500) return;
    lastScanTimeRef.current = now;
    lastScanCodeRef.current = code;

    const found = products.find(p => p.sku === code || p.name.toLowerCase() === code.toLowerCase());
    if (found) {
      addToCart(found);
      playBeep();
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setScannerStatus('detected');
      toast({ title: "✅ Produit scanné", description: found.name });
      setTimeout(() => setScannerStatus('active'), 1500);
    } else {
      setScannerStatus('not_found');
      setNotFoundCode(code);
      setShowProductNotFound(true);
      toast({ title: "Produit non trouvé", description: `Code: ${code}`, variant: "destructive" });
      setTimeout(() => setScannerStatus('active'), 2000);
    }
  }, [products, addToCart, toast]);

  // USB/HID barcode scanner listener
  useEffect(() => {
    if (isMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked || showCashModal || showReceipt || showCustomerModal || showOpenCashModal) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.key === "Enter" && barcodeBufferRef.current.length >= 4) {
        const code = barcodeBufferRef.current;
        barcodeBufferRef.current = "";
        handleScanResult(code);
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
  }, [products, isMobile, isLocked, showCashModal, showReceipt, showCustomerModal, showOpenCashModal, handleScanResult]);

  // Mobile camera scanner
  const startScanner = async () => {
    setShowScanner(true);
    setScannerStatus('active');
    try {
      const html5Qrcode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5Qrcode;
      await html5Qrcode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          handleScanResult(text);
        },
        () => {}
      );
    } catch {
      toast({ title: "Erreur caméra", description: "Impossible d'ouvrir la caméra. Utilisez la saisie manuelle.", variant: "destructive" });
      setShowScanner(false);
      setShowManualScan(true);
    }
  };

  const stopScanner = () => {
    scannerRef.current?.stop().catch(() => {});
    scannerRef.current = null;
    setShowScanner(false);
    setScannerStatus('idle');
  };

  const validateSale = async (paymentMethod: string = "Espèces") => {
    if (cart.length === 0) return;
    if (!cashSessionOpen) {
      toast({ title: "Caisse fermée", description: "Veuillez ouvrir la caisse avant de valider une vente", variant: "destructive" });
      setShowOpenCashModal(true);
      return;
    }
    try {
      for (const item of cart) {
        const itemTotal = item.price * item.quantity - (item.discount || 0);
        await addSale.mutateAsync({
          product_id: item.id, quantity: item.quantity, unit_price: item.price,
          total_amount: itemTotal, paid_amount: itemTotal,
          customer_name: customerName || null, customer_phone: null, sale_date: new Date().toISOString(),
          payment_method: paymentMethod,
        });
      }

      // Track session sales
      setSessionSales(prev => ({
        total: prev.total + total,
        cash: prev.cash + (paymentMethod === "Espèces" ? total : 0),
        mobile: prev.mobile + (paymentMethod === "Mobile Money" ? total : 0),
        card: prev.card + (paymentMethod === "Carte bancaire" ? total : 0),
      }));

      setShowReceipt(true);
      toast({ title: "✅ Vente validée", description: `Paiement ${paymentMethod} — ${total.toLocaleString()} FCFA` });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer la vente", variant: "destructive" });
    }
  };

  const holdTicket = () => {
    if (cart.length === 0) return;
    const ticket: HeldTicket = {
      id: Date.now().toString(), items: [...cart], total,
      customerName: customerName || `Ticket #${heldTickets.length + 1}`,
      tableName, createdAt: new Date(),
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
    setTableName(ticket.tableName);
    setHeldTickets(prev => prev.filter(t => t.id !== ticketId));
    setShowHeldTickets(false);
  };

  // Numpad
  const handleNumpadKey = (key: string) => {
    if (key === "C") { setNumpadValue(""); return; }
    if (key === "<") { setNumpadValue(prev => prev.slice(0, -1)); return; }
    if (key === "×") { setNumpadValue(""); return; }
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

  // Cash session management
  const openCashSession = async () => {
    if (!user) return;
    const amount = parseFloat(openingAmount) || 0;
    const { data, error } = await supabase.from('cash_sessions').insert({
      user_id: user.id, opening_amount: amount, status: 'open'
    }).select().single();
    if (error) {
      toast({ title: "Erreur", description: "Impossible d'ouvrir la caisse", variant: "destructive" });
      return;
    }
    setCurrentSessionId(data.id);
    setCashSessionOpen(true);
    setShowOpenCashModal(false);
    setSessionSales({ total: 0, cash: 0, mobile: 0, card: 0 });
    setSessionMovements([]);
    toast({ title: "✅ Caisse ouverte", description: `Fond de caisse: ${amount.toLocaleString()} FCFA` });
  };

  const closeCashSession = async () => {
    if (!currentSessionId) return;
    const opening = parseFloat(openingAmount) || 0;
    const totalExpenses = sessionMovements.filter(m => m.type === 'expense').reduce((s, m) => s + m.amount, 0);
    const totalEntries = sessionMovements.filter(m => m.type === 'entry').reduce((s, m) => s + m.amount, 0);
    const expectedAmount = opening + sessionSales.cash + totalEntries - totalExpenses;
    const realAmount = parseFloat(closingAmount) || 0;

    const { error } = await supabase.from('cash_sessions').update({
      closed_at: new Date().toISOString(),
      closing_amount: realAmount,
      expected_amount: expectedAmount,
      difference: realAmount - expectedAmount,
      total_sales: sessionSales.total,
      total_cash: sessionSales.cash,
      total_mobile_money: sessionSales.mobile,
      total_card: sessionSales.card,
      total_expenses: totalExpenses,
      total_entries: totalEntries,
      closing_notes: closingNotes || null,
      status: 'closed',
    }).eq('id', currentSessionId);

    if (error) {
      toast({ title: "Erreur", description: "Impossible de fermer la caisse", variant: "destructive" });
      return;
    }

    const reportData = {
      companyName,
      cashierName: profile?.first_name || "Manager",
      openedAt: new Date().toLocaleString('fr-FR'),
      closedAt: new Date().toLocaleString('fr-FR'),
      openingAmount: opening,
      totalSales: sessionSales.total,
      totalCash: sessionSales.cash,
      totalMobileMoney: sessionSales.mobile,
      totalCard: sessionSales.card,
      totalExpenses,
      totalEntries,
      expectedAmount,
      closingAmount: realAmount,
      difference: realAmount - expectedAmount,
      closingNotes,
    };

    setCloseReportData(reportData);
    setShowCloseCashModal(false);
    setShowCloseReport(true);
    toast({ title: "✅ Caisse fermée", description: "Session clôturée avec succès" });
  };

  const finalizeClose = () => {
    setCashSessionOpen(false);
    setCurrentSessionId(null);
    setShowCloseReport(false);
    setClosingAmount("");
    setClosingNotes("");
    setCloseReportData(null);
    setShowOpenCashModal(true);
  };

  // Cash movements
  const addMovement = async () => {
    if (!currentSessionId || !user) return;
    const amount = parseFloat(movementAmount) || 0;
    if (amount <= 0) return;

    const { data, error } = await supabase.from('cash_movements').insert({
      user_id: user.id,
      session_id: currentSessionId,
      type: movementType,
      amount,
      category: movementCategory || (movementType === 'expense' ? 'Dépense' : 'Entrée'),
      description: movementDescription || null,
    }).select().single();

    if (error) {
      toast({ title: "Erreur", description: "Impossible d'enregistrer le mouvement", variant: "destructive" });
      return;
    }

    setSessionMovements(prev => [...prev, {
      id: data.id, type: movementType, amount, category: movementCategory, description: movementDescription, created_at: data.created_at
    }]);

    setShowMovementModal(false);
    setMovementAmount("");
    setMovementCategory("");
    setMovementDescription("");
    toast({
      title: movementType === 'entry' ? "💰 Entrée enregistrée" : "💸 Dépense enregistrée",
      description: `${amount.toLocaleString()} FCFA`
    });
  };

  // Apply discount
  const applyDiscountPercent = () => {
    const pct = parseFloat(discountValue) || 0;
    if (pct <= 0 || pct > 100) return;
    if (selectedItemId) {
      setCart(prev => prev.map(item => item.id === selectedItemId ? { ...item, discount: Math.round(item.price * item.quantity * pct / 100) } : item));
    } else {
      // Apply to whole cart
      setCart(prev => prev.map(item => ({ ...item, discount: Math.round(item.price * item.quantity * pct / 100) })));
    }
    setShowDiscountPercent(false);
    setDiscountValue("");
    toast({ title: "Remise appliquée", description: `${pct}% de remise` });
  };

  const applyDiscountAmount = () => {
    const amt = parseFloat(discountValue) || 0;
    if (amt <= 0) return;
    if (selectedItemId) {
      setCart(prev => prev.map(item => item.id === selectedItemId ? { ...item, discount: amt } : item));
    } else {
      // Distribute proportionally
      const ratio = amt / subtotal;
      setCart(prev => prev.map(item => ({ ...item, discount: Math.round(item.price * item.quantity * ratio) })));
    }
    setShowDiscountAmount(false);
    setDiscountValue("");
    toast({ title: "Remise appliquée", description: `${amt.toLocaleString()} FCFA de remise` });
  };

  // Remove last item
  const removeLastItem = () => {
    if (cart.length === 0) return;
    setCart(prev => prev.slice(0, -1));
    toast({ title: "Dernier article annulé" });
  };

  const printReceipt = () => {
    const printWindow = window.open('', '', 'width=320,height=600');
    if (!printWindow) return;
    const receiptContent = `<!DOCTYPE html><html><head><title>Ticket</title><style>@page{size:80mm auto;margin:0}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;width:80mm;padding:8px;background:#fff}.header{text-align:center;margin-bottom:8px}.company-name{font-size:16px;font-weight:bold;text-transform:uppercase}.divider{border-bottom:1px dashed #000;margin:6px 0}.date-row{display:flex;justify-content:space-between;font-size:10px}.item{margin:4px 0}.item-detail{display:flex;justify-content:space-between;font-size:11px;padding-left:8px}.total-section{margin-top:8px;padding-top:8px;border-top:2px solid #000}.total-row{display:flex;justify-content:space-between;font-size:14px;font-weight:bold}.footer{text-align:center;margin-top:12px;font-size:11px}</style></head><body><div class="header"><div class="company-name">${companyName}</div></div><div class="divider"></div><div class="date-row"><span>Date: ${new Date().toLocaleDateString('fr-FR')}</span><span>${new Date().toLocaleTimeString('fr-FR')}</span></div>${customerName ? `<div class="date-row"><span>Client: ${customerName}</span></div>` : ''}<div class="divider"></div>${cart.map(item => `<div class="item"><div>${item.icon_emoji} ${item.name}</div><div class="item-detail"><span>${item.quantity} x ${item.price.toLocaleString('fr-FR')} FCFA</span><span>${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</span></div>${item.discount ? `<div class="item-detail" style="color:#e74c3c"><span>Remise</span><span>-${item.discount.toLocaleString('fr-FR')} FCFA</span></div>` : ''}</div>`).join('')}<div class="total-section">${totalDiscount > 0 ? `<div style="display:flex;justify-content:space-between;font-size:11px;color:#e74c3c"><span>Total remise</span><span>-${totalDiscount.toLocaleString('fr-FR')} FCFA</span></div>` : ''}<div class="total-row"><span>TOTAL</span><span>${total.toLocaleString('fr-FR')} FCFA</span></div></div><div class="footer"><div>Merci et à bientôt !</div><div style="font-size:9px;color:#666;margin-top:4px">Powered by Stocknix</div></div></body></html>`;
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
      <div className="fixed inset-0 z-[100] bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm px-4">
          <Lock className="h-16 w-16 mx-auto text-gray-400" />
          <h2 className="text-xl font-bold text-white">Caisse verrouillée</h2>
          <p className="text-sm text-gray-400">Entrez le PIN pour déverrouiller</p>
          <Input type="password" value={lockPin} onChange={e => setLockPin(e.target.value)} placeholder="PIN"
            className="text-center text-2xl tracking-widest h-14 bg-[#2d2d44] border-[#3d3d5c] text-white" maxLength={4}
            onKeyDown={e => { if (e.key === "Enter" && lockPin.length >= 4) { setIsLocked(false); setLockPin(""); } }}
          />
          <Button onClick={() => { if (lockPin.length >= 4) { setIsLocked(false); setLockPin(""); } }} className="w-full h-12">Déverrouiller</Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // DESKTOP LAYOUT — 3 COLONNES STYLE POS RÉFÉRENCE
  // ═══════════════════════════════════════════════════════════
  if (!isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#1a1a2e' }}>
        {/* TOP HEADER BAR */}
        <div className="h-10 flex items-center justify-between px-3 shrink-0" style={{ background: '#12122a', borderBottom: '1px solid #2d2d44' }}>
          <div className="flex items-center gap-3 text-gray-300 text-xs">
            <span>{currentTime.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
            <span className="text-gray-600">|</span>
            <span>{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            {cashSessionOpen && (
              <span className="flex items-center gap-1 text-green-400 text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" /> Caisse ouverte
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsLocked(true)} className="text-gray-400 hover:text-white transition-colors" title="Verrouiller">
              <Lock className="h-4 w-4" />
            </button>
            <span className="text-gray-300 text-xs font-medium">{profile?.first_name || "Manager"}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <MenuIcon className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1e1e3a] border-[#2d2d44] text-white">
                <DropdownMenuItem onClick={() => navigate('/app')} className="hover:bg-white/10 cursor-pointer">
                  <Home className="h-4 w-4 mr-2" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/performance')} className="hover:bg-white/10 cursor-pointer">
                  <BarChart3 className="h-4 w-4 mr-2" /> Statistiques
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/settings')} className="hover:bg-white/10 cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" /> Paramètres
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* MAIN 3-COLUMN LAYOUT */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* ════════ COLONNE GAUCHE — TICKET + NUMPAD (35%) ════════ */}
          <div className="flex flex-col shrink-0" style={{ width: '35%', background: '#1e1e3a', borderRight: '1px solid #2d2d44' }}>
            
            {/* Couverts + Table header */}
            <div className="flex items-center gap-0 text-xs shrink-0" style={{ borderBottom: '1px solid #2d2d44' }}>
              <div className="flex items-center gap-1 px-2 py-1.5" style={{ borderRight: '1px solid #2d2d44' }}>
                <button onClick={() => setCouverts(Math.max(1, couverts - 1))} className="text-gray-400 hover:text-white h-6 w-6 flex items-center justify-center">−</button>
                <span className="text-gray-300 mx-1">{couverts} couverts</span>
                <button onClick={() => setCouverts(couverts + 1)} className="text-gray-400 hover:text-white h-6 w-6 flex items-center justify-center">+</button>
              </div>
              <div className="flex items-center gap-1 px-2 py-1.5 flex-1">
                <span className="text-gray-400">Table</span>
                <button onClick={() => { const n = prompt("Numéro de table:", tableName); if (n) setTableName(n); }}
                  className="text-gray-400 hover:text-white h-5 w-5 flex items-center justify-center">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Table Name / Manager */}
            <div className="flex items-center gap-2 px-3 py-2 shrink-0" style={{ borderBottom: '1px solid #2d2d44' }}>
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-white text-sm font-medium">{tableName} / {profile?.first_name || "Manager"}</span>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-2 py-1">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-sm">Aucun article</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {cart.map((item) => (
                    <button key={item.id} onClick={() => setSelectedItemId(item.id)}
                      className={`w-full text-left px-2 py-1.5 flex items-center justify-between transition-colors ${
                        selectedItemId === item.id ? 'bg-blue-600/30' : 'hover:bg-white/5'
                      }`}>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-white text-xs font-medium w-5 text-center">{item.quantity}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-200 text-xs truncate block">{item.name}</span>
                          {item.note && <span className="text-yellow-400 text-[9px] truncate block">📝 {item.note}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-gray-400 text-xs">{item.price.toLocaleString()}</span>
                        {item.discount ? (
                          <div className="text-right">
                            <span className="text-red-400 text-[9px] line-through block">{(item.price * item.quantity).toLocaleString()}</span>
                            <span className="text-white text-xs font-semibold">{(item.price * item.quantity - item.discount).toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="text-white text-xs font-semibold">{(item.price * item.quantity).toLocaleString()}</span>
                        )}
                        <ChevronRight className="h-3 w-3 text-gray-500" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Discount line */}
            {totalDiscount > 0 && (
              <div className="px-3 py-1 flex justify-between shrink-0 text-red-400 text-xs" style={{ borderTop: '1px solid #2d2d44' }}>
                <span>Remise totale</span>
                <span>-{totalDiscount.toLocaleString()} F</span>
              </div>
            )}

            {/* TOTAL */}
            <div className="flex items-center justify-between px-3 py-2 shrink-0" style={{ borderTop: '1px solid #2d2d44' }}>
              <span className="text-white text-lg font-bold">TOTAL</span>
              <div className="flex items-center gap-2">
                <span className="text-white text-lg font-bold">{total.toLocaleString()} F</span>
              </div>
            </div>

            {/* Numpad display */}
            {numpadValue && (
              <div className="px-3 py-1 text-right shrink-0" style={{ borderTop: '1px solid #2d2d44' }}>
                <span className="text-blue-400 text-lg font-mono font-bold">{numpadValue}</span>
              </div>
            )}

            {/* NUMPAD */}
            <div className="grid grid-cols-4 gap-[1px] shrink-0" style={{ background: '#2d2d44' }}>
              <NumpadBtn label="C" color="#EF4444" onClick={() => handleNumpadKey("C")} />
              <NumpadBtn label="." onClick={() => handleNumpadKey(".")} />
              <NumpadBtn label="<" onClick={() => handleNumpadKey("<")} />
              <NumpadBtn label="NOM TABLE" color="#3B82F6" small onClick={() => {
                const name = prompt("Nom de la table:", tableName);
                if (name) setTableName(name);
              }} />
              
              <NumpadBtn label="7" onClick={() => handleNumpadKey("7")} />
              <NumpadBtn label="8" onClick={() => handleNumpadKey("8")} />
              <NumpadBtn label="9" onClick={() => handleNumpadKey("9")} />
              {/* ACTIONS dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center font-bold text-[10px] tracking-wide text-white transition-all active:scale-95"
                    style={{ background: '#3B82F6', padding: '12px 4px' }}>
                    ACTIONS
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1e1e3a] border-[#2d2d44] text-white w-56">
                  <DropdownMenuItem onClick={() => { setDiscountValue(""); setShowDiscountPercent(true); }} className="hover:bg-white/10 cursor-pointer">
                    <Percent className="h-4 w-4 mr-2" /> Remise %
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setDiscountValue(""); setShowDiscountAmount(true); }} className="hover:bg-white/10 cursor-pointer">
                    <Hash className="h-4 w-4 mr-2" /> Remise montant
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#2d2d44]" />
                  <DropdownMenuItem onClick={removeLastItem} className="hover:bg-white/10 cursor-pointer">
                    <XCircle className="h-4 w-4 mr-2" /> Annuler dernier article
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setItemNote(""); setShowNoteModal(true); }} className="hover:bg-white/10 cursor-pointer">
                    <StickyNote className="h-4 w-4 mr-2" /> Note interne
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#2d2d44]" />
                  <DropdownMenuItem onClick={() => { setMovementType('entry'); setShowMovementModal(true); }} className="hover:bg-white/10 cursor-pointer">
                    <ArrowDownCircle className="h-4 w-4 mr-2 text-green-400" /> Entrée d'argent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setMovementType('expense'); setShowMovementModal(true); }} className="hover:bg-white/10 cursor-pointer">
                    <ArrowUpCircle className="h-4 w-4 mr-2 text-red-400" /> Dépense de caisse
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowMovementsList(true)} className="hover:bg-white/10 cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" /> Voir mouvements
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#2d2d44]" />
                  <DropdownMenuItem onClick={() => setShowCloseCashModal(true)} className="hover:bg-white/10 cursor-pointer text-yellow-400">
                    <DoorOpen className="h-4 w-4 mr-2" /> Clôturer la caisse
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <NumpadBtn label="4" onClick={() => handleNumpadKey("4")} />
              <NumpadBtn label="5" onClick={() => handleNumpadKey("5")} />
              <NumpadBtn label="6" onClick={() => handleNumpadKey("6")} />
              <NumpadBtn label="TABLE" color="#3B82F6" small onClick={() => {
                const name = prompt("Numéro de table:", tableName);
                if (name) setTableName(name);
              }} />
              
              <NumpadBtn label="1" onClick={() => handleNumpadKey("1")} />
              <NumpadBtn label="2" onClick={() => handleNumpadKey("2")} />
              <NumpadBtn label="3" onClick={() => handleNumpadKey("3")} />
              <NumpadBtn label="PAYER" color="#F59E0B" small onClick={() => {
                if (cart.length > 0) setShowCashModal(true);
              }} />
              
              <NumpadBtn label="00" onClick={() => handleNumpadKey("00")} />
              <NumpadBtn label="0" onClick={() => handleNumpadKey("0")} />
              <NumpadBtn label="×" onClick={() => handleNumpadKey("×")} />
              <NumpadBtn label="EN COMPTE" color="#22C55E" small onClick={() => {
                if (cart.length > 0) validateSale("Crédit");
              }} />
            </div>
          </div>

          {/* ════════ COLONNE CENTRALE — CATÉGORIES (15%) ════════ */}
          <div className="flex flex-col shrink-0 overflow-y-auto" style={{ width: '15%', background: '#1a1a2e', borderRight: '1px solid #2d2d44' }}>
            <button onClick={() => { setSelectedCategory(null); setShowSearch(false); }}
              className={`w-full text-left px-3 py-3 text-sm font-medium transition-colors ${
                !selectedCategory ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}>
              Tout
              <div className="h-[3px] mt-1 rounded-full" style={{ background: '#6366F1' }} />
            </button>
            {categories.map((cat, i) => (
              <button key={cat} onClick={() => { setSelectedCategory(cat); setShowSearch(false); }}
                className={`w-full text-left px-3 py-3 text-sm font-medium transition-colors ${
                  selectedCategory === cat ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}>
                {cat}
                <div className="h-[3px] mt-1 rounded-full" style={{ background: getCategoryColor(cat, i, categoryColors) }} />
              </button>
            ))}
          </div>

          {/* ════════ COLONNE DROITE — GRILLE PRODUITS (50%) ════════ */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#1e1e3a' }}>
            {/* Search bar */}
            {showSearch && (
              <div className="px-3 py-2 shrink-0" style={{ borderBottom: '1px solid #2d2d44' }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un produit..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[#2d2d44] border-0 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredProducts.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-sm text-gray-500">Aucun produit trouvé</p>
                  </div>
                </div>
              ) : groupedProducts ? (
                <div className="space-y-4">
                  {groupedProducts.map(([cat, prods], catIdx) => (
                    <div key={cat}>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <div className="h-3 w-3 rounded-sm" style={{ background: getCategoryColor(cat, catIdx, categoryColors) }} />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{cat}</span>
                        <div className="flex-1 h-px" style={{ background: '#2d2d44' }} />
                        <span className="text-[10px] text-gray-600">{prods.length}</span>
                      </div>
                      <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-1">
                        {prods.map(product => (
                          <ProductTilePOS key={product.id} product={product} catColor={getCategoryColor(cat, catIdx, categoryColors)} onClick={() => addToCart(product)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-1">
                  {filteredProducts.map((product, i) => (
                    <ProductTilePOS key={product.id} product={product}
                      catColor={getCategoryColor(product.category || "", i, categoryColors)}
                      onClick={() => addToCart(product)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM BAR — 6 boutons */}
        <div className="h-10 flex items-center justify-around shrink-0" style={{ background: '#12122a', borderTop: '1px solid #2d2d44' }}>
          <BottomBarBtn icon={<ClipboardList className="h-4 w-4" />} label="TICKETS" onClick={() => setShowHeldTickets(true)} badge={heldTickets.length} />
          <BottomBarBtn icon={<User className="h-4 w-4" />} label="CLIENTS" onClick={() => setShowCustomerModal(true)} />
          <BottomBarBtn icon={<QrCode className="h-4 w-4" />} label="QR CODE" onClick={startScanner} />
          <BottomBarBtn icon={<Search className="h-4 w-4" />} label="RECHERCHER" onClick={() => setShowSearch(!showSearch)} />
          <BottomBarBtn icon={<HelpCircle className="h-4 w-4" />} label="AIDE" onClick={() => toast({ title: "Aide", description: "Scanner USB actif. Scannez un code-barres ou utilisez le pavé numérique pour saisir les quantités." })} />
          <BottomBarBtn icon={<LogOut className="h-4 w-4" />} label="SORTIE" onClick={() => navigate('/app')} />
        </div>

        {/* MODALS */}
        {renderModals()}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#1a1a2e' }}>
      {/* Mobile Header */}
      <div className="h-11 flex items-center justify-between px-3 shrink-0" style={{ background: '#12122a', borderBottom: '1px solid #2d2d44' }}>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/app')} className="text-gray-400 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-white text-sm font-semibold">Caisse</span>
          {cashSessionOpen && <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={startScanner} className="text-gray-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Camera className="h-4 w-4" />
          </button>
          <button onClick={() => setIsLocked(true)} className="text-gray-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Lock className="h-4 w-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1e1e3a] border-[#2d2d44] text-white">
              <DropdownMenuItem onClick={holdTicket} className="hover:bg-white/10 cursor-pointer">⏸️ Mettre en attente</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowHeldTickets(true)} className="hover:bg-white/10 cursor-pointer">🎫 Tickets ({heldTickets.length})</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowCustomerModal(true)} className="hover:bg-white/10 cursor-pointer">👤 Client</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2d2d44]" />
              <DropdownMenuItem onClick={() => { setDiscountValue(""); setShowDiscountPercent(true); }} className="hover:bg-white/10 cursor-pointer">Remise %</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setMovementType('entry'); setShowMovementModal(true); }} className="hover:bg-white/10 cursor-pointer">💰 Entrée d'argent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setMovementType('expense'); setShowMovementModal(true); }} className="hover:bg-white/10 cursor-pointer">💸 Dépense</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2d2d44]" />
              <DropdownMenuItem onClick={() => setShowCloseCashModal(true)} className="hover:bg-white/10 cursor-pointer text-yellow-400">🔒 Clôturer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button className="text-gray-300 min-h-[44px] min-w-[44px] flex items-center justify-center" onClick={() => setMobileView(mobileView === 'products' ? 'ticket' : 'products')}>
            {mobileView === 'products' ? (
              <div className="relative">
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-[9px] text-white flex items-center justify-center">{totalItems}</span>}
              </div>
            ) : (
              <span className="text-xs">Produits</span>
            )}
          </button>
        </div>
      </div>

      {mobileView === 'products' ? (
        <>
          {/* Mobile search + categories */}
          <div className="px-3 pt-2 pb-1 shrink-0" style={{ background: '#1a1a2e' }}>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#2d2d44] border-0 text-white placeholder-gray-500 focus:outline-none" />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button onClick={() => setSelectedCategory(null)}
                className={`shrink-0 px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-[#2d2d44] text-gray-400'}`}>
                Tout
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px] ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-[#2d2d44] text-gray-400'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Products Grid */}
          <div className="flex-1 overflow-y-auto p-2">
            {groupedProducts ? (
              <div className="space-y-4">
                {groupedProducts.map(([cat, prods], catIdx) => (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <div className="h-3 w-3 rounded-sm" style={{ background: getCategoryColor(cat, catIdx, categoryColors) }} />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{cat}</span>
                      <div className="flex-1 h-px" style={{ background: '#2d2d44' }} />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {prods.map(product => (
                        <ProductTilePOS key={product.id} product={product} catColor={getCategoryColor(cat, catIdx, categoryColors)} onClick={() => addToCart(product)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {filteredProducts.map((product, i) => (
                  <ProductTilePOS key={product.id} product={product} catColor={getCategoryColor(product.category || "", i, categoryColors)} onClick={() => addToCart(product)} />
                ))}
              </div>
            )}
          </div>

          {/* Mobile cart summary bar */}
          {totalItems > 0 && (
            <button onClick={() => setMobileView('ticket')}
              className="mx-2 mb-2 flex items-center justify-between px-4 py-3 text-white min-h-[48px]" style={{ background: '#3B82F6' }}>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm font-bold">{totalItems} article(s)</span>
              </div>
              <span className="text-sm font-bold">{total.toLocaleString()} F</span>
            </button>
          )}
        </>
      ) : (
        <>
          {/* Mobile Ticket View */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">🧾 Ticket en cours</h3>
              <button onClick={() => setCart([])} className="text-gray-500 text-xs hover:text-red-400 min-h-[44px] flex items-center">Vider</button>
            </div>
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #2d2d44' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{item.name}</p>
                  <p className="text-gray-400 text-xs">{item.price.toLocaleString()} F × {item.quantity}</p>
                  {item.discount && <p className="text-red-400 text-[10px]">Remise: -{item.discount.toLocaleString()} F</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => updateQuantity(item.id, -1)} className="h-9 w-9 flex items-center justify-center bg-[#2d2d44] text-white"><Minus className="h-3 w-3" /></button>
                  <span className="text-white text-sm font-bold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="h-9 w-9 flex items-center justify-center bg-[#2d2d44] text-white"><Plus className="h-3 w-3" /></button>
                  <button onClick={() => removeFromCart(item.id)} className="h-9 w-9 flex items-center justify-center text-red-400 ml-1"><Trash2 className="h-3 w-3" /></button>
                  <span className="text-white text-sm font-semibold ml-2 w-16 text-right">{(item.price * item.quantity - (item.discount || 0)).toLocaleString()} F</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Total + Pay buttons */}
          <div className="shrink-0 px-3 py-3 space-y-2" style={{ borderTop: '1px solid #2d2d44', background: '#12122a' }}>
            <div className="flex items-center justify-between">
              <span className="text-white text-lg font-bold">TOTAL</span>
              <span className="text-white text-xl font-black">{total.toLocaleString()} F</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => cart.length > 0 && setShowCashModal(true)} className="py-3 text-white text-xs font-bold min-h-[48px]" style={{ background: '#22C55E' }}>💵 Espèces</button>
              <button onClick={() => validateSale("Mobile Money")} className="py-3 text-white text-xs font-bold min-h-[48px]" style={{ background: '#F59E0B' }}>📱 Mobile</button>
              <button onClick={() => validateSale("Carte bancaire")} className="py-3 text-white text-xs font-bold min-h-[48px]" style={{ background: '#3B82F6' }}>💳 CB</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={holdTicket} className="py-2 text-gray-300 text-xs font-medium min-h-[44px]" style={{ background: '#2d2d44' }}>⏸️ En attente</button>
              <button onClick={() => setMobileView('products')} className="py-2 text-gray-300 text-xs font-medium min-h-[44px]" style={{ background: '#2d2d44' }}>← Produits</button>
            </div>
          </div>
        </>
      )}

      {/* MODALS */}
      {renderModals()}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // SHARED MODALS
  // ═══════════════════════════════════════════════════════════
  function renderModals() {
    return (
      <>
        {/* Scanner Modal with overlay guide */}
        {showScanner && (
          <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-[#1e1e3a] border border-[#2d2d44] w-full max-w-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">📷 Scanner</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    scannerStatus === 'active' ? 'bg-green-500/20 text-green-400' :
                    scannerStatus === 'detected' ? 'bg-blue-500/20 text-blue-400' :
                    scannerStatus === 'not_found' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {scannerStatus === 'active' ? '🟢 Caméra active' :
                     scannerStatus === 'detected' ? '✅ Code détecté' :
                     scannerStatus === 'not_found' ? '❌ Non trouvé' : 'En attente'}
                  </span>
                  <button onClick={stopScanner} className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="relative">
                <div id="qr-reader" className="w-full aspect-square overflow-hidden bg-black" />
                {/* Laser guide overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-white/30" />
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-red-500/70 animate-pulse" />
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-green-400" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-green-400" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-green-400" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-green-400" />
                </div>
              </div>
              <p className="text-gray-400 text-xs text-center">Pointez la caméra vers un code-barres ou QR code</p>
              <button onClick={() => { stopScanner(); setShowManualScan(true); }}
                className="w-full py-2 text-xs text-gray-300 hover:text-white" style={{ background: '#2d2d44' }}>
                Saisie manuelle du code
              </button>
            </div>
          </div>
        )}

        {/* Manual Scan Fallback */}
        {showManualScan && (
          <ModalOverlay onClose={() => setShowManualScan(false)}>
            <h3 className="text-lg font-bold text-center text-white">🔢 Saisie manuelle</h3>
            <p className="text-gray-400 text-xs text-center">Entrez le code-barres ou SKU du produit</p>
            <input value={manualBarcode} onChange={e => setManualBarcode(e.target.value)}
              placeholder="Code-barres / SKU..."
              className="w-full h-12 text-center font-mono text-lg bg-[#2d2d44] border border-[#3d3d5c] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus onKeyDown={e => { if (e.key === 'Enter') { handleScanResult(manualBarcode); setManualBarcode(""); setShowManualScan(false); }}} />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowManualScan(false)} className="py-2.5 text-gray-300 text-sm" style={{ background: '#2d2d44' }}>Annuler</button>
              <button onClick={() => { handleScanResult(manualBarcode); setManualBarcode(""); setShowManualScan(false); }}
                className="py-2.5 text-white text-sm font-bold" style={{ background: '#3B82F6' }}>Rechercher</button>
            </div>
          </ModalOverlay>
        )}

        {/* Product Not Found */}
        {showProductNotFound && (
          <ModalOverlay onClose={() => setShowProductNotFound(false)}>
            <h3 className="text-lg font-bold text-center text-white">❌ Produit non trouvé</h3>
            <p className="text-gray-400 text-sm text-center">Code scanné: <span className="text-white font-mono">{notFoundCode}</span></p>
            <p className="text-gray-500 text-xs text-center">Ce code ne correspond à aucun produit enregistré.</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowProductNotFound(false)} className="py-2.5 text-gray-300 text-sm" style={{ background: '#2d2d44' }}>Fermer</button>
              <button onClick={() => { setShowProductNotFound(false); navigate('/app/stocks'); }}
                className="py-2.5 text-white text-sm font-bold" style={{ background: '#22C55E' }}>Créer le produit</button>
            </div>
          </ModalOverlay>
        )}

        {/* Cash Modal */}
        {showCashModal && (
          <ModalOverlay onClose={() => setShowCashModal(false)}>
            <h3 className="text-lg font-bold text-center text-white">💵 Paiement Espèces</h3>
            <div className="text-center">
              <p className="text-sm text-gray-400">Total à payer</p>
              <p className="text-3xl font-black text-blue-400">{total.toLocaleString()} FCFA</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Montant reçu</label>
              <input type="number" value={cashInput} onChange={e => setCashInput(e.target.value)}
                placeholder="Montant donné..."
                className="mt-1 w-full text-lg h-12 text-center font-bold bg-[#2d2d44] border border-[#3d3d5c] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus />
            </div>
            {cashInput && parseFloat(cashInput) >= total && (
              <div className="text-center p-3 bg-blue-600/20">
                <p className="text-sm text-gray-400">Monnaie à rendre</p>
                <p className="text-2xl font-black text-green-400">{cashChange.toLocaleString()} FCFA</p>
              </div>
            )}
            {cashInput && parseFloat(cashInput) < total && <p className="text-sm text-center text-red-400 font-medium">Montant insuffisant</p>}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setShowCashModal(false); setCashInput(""); }} className="py-2.5 text-gray-300 text-sm" style={{ background: '#2d2d44' }}>Annuler</button>
              <button disabled={!cashInput || parseFloat(cashInput) < total || addSale.isPending}
                onClick={() => { validateSale("Espèces"); setCashInput(""); }}
                className="py-2.5 text-white text-sm font-bold disabled:opacity-50" style={{ background: '#3B82F6' }}>
                ✅ Confirmer
              </button>
            </div>
          </ModalOverlay>
        )}

        {/* Receipt Modal */}
        {showReceipt && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4">
            <div className="bg-[#1e1e3a] border border-[#2d2d44] w-full max-w-sm p-6 space-y-4">
              <h3 className="text-lg font-bold text-center text-white">🧾 Ticket de caisse</h3>
              <div className="border border-[#2d2d44] p-4 bg-[#12122a] space-y-2 font-mono text-sm text-gray-300">
                <p className="text-center font-bold text-white">{companyName}</p>
                <p className="text-center text-xs text-gray-500">{new Date().toLocaleDateString('fr-FR')} — {new Date().toLocaleTimeString('fr-FR')}</p>
                {customerName && <p className="text-center text-xs">Client: {customerName}</p>}
                <div className="border-t border-dashed border-gray-600 my-2" />
                {cart.map(item => (
                  <div key={item.id}>
                    <div className="flex justify-between text-xs">
                      <span>{item.icon_emoji} {item.name} ×{item.quantity}</span>
                      <span>{(item.price * item.quantity).toLocaleString()} F</span>
                    </div>
                    {item.discount && (
                      <div className="flex justify-between text-[10px] text-red-400">
                        <span>  Remise</span>
                        <span>-{item.discount.toLocaleString()} F</span>
                      </div>
                    )}
                  </div>
                ))}
                <div className="border-t border-dashed border-gray-600 my-2" />
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-xs text-red-400"><span>Total remise</span><span>-{totalDiscount.toLocaleString()} F</span></div>
                )}
                <div className="flex justify-between font-bold text-white"><span>TOTAL</span><span>{total.toLocaleString()} FCFA</span></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={printReceipt} className="py-2.5 text-white text-sm font-bold flex items-center justify-center gap-2" style={{ background: '#3B82F6' }}>
                  <Printer className="h-4 w-4" /> Imprimer
                </button>
                <button onClick={() => { setCart([]); setShowReceipt(false); setShowCashModal(false); setCustomerName(""); }}
                  className="py-2.5 text-gray-300 text-sm font-medium" style={{ background: '#2d2d44' }}>Nouveau ticket</button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Modal */}
        {showCustomerModal && (
          <ModalOverlay onClose={() => setShowCustomerModal(false)}>
            <h3 className="text-lg font-bold text-center text-white">👤 Ajouter un client</h3>
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nom du client..."
              className="w-full h-12 text-center bg-[#2d2d44] border border-[#3d3d5c] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowCustomerModal(false)} className="py-2.5 text-gray-300 text-sm" style={{ background: '#2d2d44' }}>Annuler</button>
              <button onClick={() => { setShowCustomerModal(false); toast({ title: "Client ajouté", description: customerName || "Anonyme" }); }}
                className="py-2.5 text-white text-sm font-bold" style={{ background: '#3B82F6' }}>✅ Valider</button>
            </div>
          </ModalOverlay>
        )}

        {/* Held Tickets Modal */}
        {showHeldTickets && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setShowHeldTickets(false)}>
            <div className="bg-[#1e1e3a] border border-[#2d2d44] w-full max-w-md p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-center text-white">🎫 Tickets en attente ({heldTickets.length})</h3>
              {heldTickets.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Aucun ticket en attente</p>
              ) : (
                <div className="space-y-2">
                  {heldTickets.map(ticket => (
                    <button key={ticket.id} onClick={() => resumeTicket(ticket.id)}
                      className="w-full text-left p-3 hover:bg-white/5 transition-colors" style={{ background: '#2d2d44' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium text-sm">{ticket.customerName}</span>
                        <span className="text-blue-400 font-bold text-sm">{ticket.total.toLocaleString()} F</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{ticket.items.length} article(s) • {ticket.tableName} • {ticket.createdAt.toLocaleTimeString('fr-FR')}</p>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => setShowHeldTickets(false)} className="w-full py-2 text-gray-300 text-sm" style={{ background: '#2d2d44' }}>Fermer</button>
            </div>
          </div>
        )}

        {/* Open Cash Session Modal — MANDATORY */}
        {showOpenCashModal && !cashSessionOpen && (
          <div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-[#1e1e3a] border border-[#2d2d44] w-full max-w-sm p-6 space-y-4">
              <h3 className="text-lg font-bold text-center text-white">💰 Ouverture de caisse</h3>
              <p className="text-gray-400 text-xs text-center">Vous devez ouvrir la caisse pour commencer à vendre</p>
              <div className="text-center text-gray-500 text-[10px]">
                {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                <br />Caissier: {profile?.first_name || "Manager"}
              </div>
              <div>
                <label className="text-sm text-gray-300">Fond de caisse (FCFA)</label>
                <input type="number" value={openingAmount} onChange={e => setOpeningAmount(e.target.value)}
                  placeholder="Montant du fond de caisse..."
                  className="mt-1 w-full h-12 text-center font-bold bg-[#2d2d44] border border-[#3d3d5c] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => navigate('/app')} className="py-2.5 text-gray-300 text-sm" style={{ background: '#2d2d44' }}>
                  ← Retour
                </button>
                <button onClick={openCashSession} className="py-2.5 text-white text-sm font-bold" style={{ background: '#22C55E' }}>
                  Ouvrir la caisse
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Close Cash Session Modal */}
        {showCloseCashModal && (
          <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#1e1e3a] border border-[#2d2d44] w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-center text-white">🔒 Clôture de caisse</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#2d2d44]">
                  <p className="text-gray-400">Fond de départ</p>
                  <p className="text-white font-bold text-lg">{(parseFloat(openingAmount) || 0).toLocaleString()} F</p>
                </div>
                <div className="p-3 bg-[#2d2d44]">
                  <p className="text-gray-400">Total ventes</p>
                  <p className="text-green-400 font-bold text-lg">{sessionSales.total.toLocaleString()} F</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-300"><span>💵 Espèces</span><span>{sessionSales.cash.toLocaleString()} F</span></div>
                <div className="flex justify-between text-gray-300"><span>📱 Mobile Money</span><span>{sessionSales.mobile.toLocaleString()} F</span></div>
                <div className="flex justify-between text-gray-300"><span>💳 Carte bancaire</span><span>{sessionSales.card.toLocaleString()} F</span></div>
              </div>
              <div>
                <label className="text-sm text-gray-300">Montant compté en caisse (FCFA)</label>
                <input type="number" value={closingAmount} onChange={e => setClosingAmount(e.target.value)}
                  placeholder="Montant réel en caisse..."
                  className="mt-1 w-full h-12 text-center font-bold bg-[#2d2d44] border border-[#3d3d5c] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus />
              </div>
              {closingAmount && (() => {
                const opening = parseFloat(openingAmount) || 0;
                const totalExp = sessionMovements.filter(m => m.type === 'expense').reduce((s, m) => s + m.amount, 0);
                const totalEnt = sessionMovements.filter(m => m.type === 'entry').reduce((s, m) => s + m.amount, 0);
                const expected = opening + sessionSales.cash + totalEnt - totalExp;
                const real = parseFloat(closingAmount) || 0;
                const diff = real - expected;
                return (
                  <div className={`p-3 text-center ${diff >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <p className="text-xs text-gray-400">Écart</p>
                    <p className={`text-xl font-black ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {diff >= 0 ? '+' : ''}{diff.toLocaleString()} F
                    </p>
                  </div>
                );
              })()}
              <div>
                <label className="text-sm text-gray-300">Notes (optionnel)</label>
                <textarea value={closingNotes} onChange={e => setClosingNotes(e.target.value)}
                  placeholder="Commentaire de clôture..."
                  className="mt-1 w-full h-16 p-2 text-sm bg-[#2d2d44] border border-[#3d3d5c] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setShowCloseCashModal(false)} className="py-2.5 text-gray-300 text-sm" style={{ background: '#2d2d44' }}>Annuler</button>
                <button onClick={closeCashSession} className="py-2.5 text-white text-sm font-bold" style={{ background: '#F59E0B' }}>Clôturer</button>
              </div>
            </div>
          </div>
        )}

        {/* Close Report */}
        {showCloseReport && closeReportData && (
          <div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-[#1e1e3a] border border-[#2d2d44] w-full max-w-sm p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <CashReportPreview data={closeReportData} />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button onClick={() => generateCashReportPDF(closeReportData)}
                  className="py-2.5 text-white text-sm font-bold flex items-center justify-center gap-2" style={{ background: '#3B82F6' }}>
                  <FileText className="h-4 w-4" /> Export PDF
                </button>
                <button onClick={finalizeClose} className="py-2.5 text-white text-sm font-bold" style={{ background: '#22C55E' }}>
                  Nouvelle session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cash Movement Modal */}
        {showMovementModal && (
          <ModalOverlay onClose={() => setShowMovementModal(false)}>
            <h3 className="text-lg font-bold text-center text-white">
              {movementType === 'entry' ? '💰 Entrée d\'argent' : '💸 Dépense de caisse'}
            </h3>
            <div>
              <label className="text-sm text-gray-300">Montant (FCFA)</label>
              <input type="number" value={movementAmount} onChange={e => setMovementAmount(e.target.value)}
                placeholder="Montant..."
                className="mt-1 w-full h-12 text-center font-bold bg-[#2d2d44] border border-[#3d3d5c] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus />
            </div>
            <div>
              <label className="text-sm text-gray-300">Catégorie</label>
              <input value={movementCategory} onChange={e => setMovementCategory(e.target.value)}
                placeholder={movementType === 'expense' ? "Ex: Fournitures, Transport..." : "Ex: Apport, Remboursement..."}
                className="mt-1 w-full h-10 px-3 bg-[#2d2d44] border border-[#3d3d5c] text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Motif</label>
              <input value={movementDescription} onChange={e => setMovementDescription(e.target.value)}
                placeholder="Description..."
                className="mt-1 w-full h-10 px-3 bg-[#2d2d44] border border-[#3d3d5c] text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowMovementModal(false)} className="py-2.5 text-gray-300 text-sm" style={{ background: '#2d2d44' }}>Annuler</button>
              <button onClick={addMovement}
                className="py-2.5 text-white text-sm font-bold"
                style={{ background: movementType === 'entry' ? '#22C55E' : '#EF4444' }}>
                {movementType === 'entry' ? '✅ Enregistrer entrée' : '✅ Enregistrer dépense'}
              </button>
            </div>
          </ModalOverlay>
        )}

        {/* Movements List */}
        {showMovementsList && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setShowMovementsList(false)}>
            <div className="bg-[#1e1e3a] border border-[#2d2d44] w-full max-w-md p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-center text-white">📋 Mouvements de caisse</h3>
              {sessionMovements.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Aucun mouvement</p>
              ) : (
                <div className="space-y-2">
                  {sessionMovements.map(m => (
                    <div key={m.id} className="p-3 flex items-center justify-between" style={{ background: '#2d2d44' }}>
                      <div>
                        <p className="text-white text-sm">{m.type === 'entry' ? '💰' : '💸'} {m.category || (m.type === 'entry' ? 'Entrée' : 'Dépense')}</p>
                        {m.description && <p className="text-gray-400 text-xs">{m.description}</p>}
                      </div>
                      <span className={`font-bold text-sm ${m.type === 'entry' ? 'text-green-400' : 'text-red-400'}`}>
                        {m.type === 'entry' ? '+' : '-'}{m.amount.toLocaleString()} F
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setShowMovementsList(false)} className="w-full py-2 text-gray-300 text-sm" style={{ background: '#2d2d44' }}>Fermer</button>
            </div>
          </div>
        )}

        {/* Discount % Modal */}
        {showDiscountPercent && (
          <ModalOverlay onClose={() => setShowDiscountPercent(false)}>
            <h3 className="text-lg font-bold text-center text-white">% Remise en pourcentage</h3>
            <p className="text-gray-400 text-xs text-center">{selectedItemId ? "Sur l'article sélectionné" : "Sur tout le ticket"}</p>
            <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)}
              placeholder="Pourcentage (ex: 10)..."
              className="w-full h-12 text-center font-bold bg-[#2d2d44] border border-[#3d3d5c] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus max={100} />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowDiscountPercent(false)} className="py-2.5 text-gray-300 text-sm" style={{ background: '#2d2d44' }}>Annuler</button>
              <button onClick={applyDiscountPercent} className="py-2.5 text-white text-sm font-bold" style={{ background: '#3B82F6' }}>Appliquer</button>
            </div>
          </ModalOverlay>
        )}

        {/* Discount Amount Modal */}
        {showDiscountAmount && (
          <ModalOverlay onClose={() => setShowDiscountAmount(false)}>
            <h3 className="text-lg font-bold text-center text-white"># Remise en montant</h3>
            <p className="text-gray-400 text-xs text-center">{selectedItemId ? "Sur l'article sélectionné" : "Sur tout le ticket"}</p>
            <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)}
              placeholder="Montant (FCFA)..."
              className="w-full h-12 text-center font-bold bg-[#2d2d44] border border-[#3d3d5c] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowDiscountAmount(false)} className="py-2.5 text-gray-300 text-sm" style={{ background: '#2d2d44' }}>Annuler</button>
              <button onClick={applyDiscountAmount} className="py-2.5 text-white text-sm font-bold" style={{ background: '#3B82F6' }}>Appliquer</button>
            </div>
          </ModalOverlay>
        )}

        {/* Note Modal */}
        {showNoteModal && (
          <ModalOverlay onClose={() => setShowNoteModal(false)}>
            <h3 className="text-lg font-bold text-center text-white">📝 Note interne</h3>
            <textarea value={itemNote} onChange={e => setItemNote(e.target.value)}
              placeholder="Note pour cet article ou le ticket..."
              className="w-full h-24 p-3 bg-[#2d2d44] border border-[#3d3d5c] text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              autoFocus />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShowNoteModal(false)} className="py-2.5 text-gray-300 text-sm" style={{ background: '#2d2d44' }}>Annuler</button>
              <button onClick={() => {
                if (selectedItemId) {
                  setCart(prev => prev.map(item => item.id === selectedItemId ? { ...item, note: itemNote } : item));
                }
                setShowNoteModal(false);
                toast({ title: "Note ajoutée" });
              }} className="py-2.5 text-white text-sm font-bold" style={{ background: '#3B82F6' }}>Enregistrer</button>
            </div>
          </ModalOverlay>
        )}
      </>
    );
  }
}

// ═══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1e1e3a] border border-[#2d2d44] w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ProductTilePOS({ product, catColor, onClick }: { product: any; catColor: string; onClick: () => void }) {
  const isOutOfStock = product.quantity <= 0;
  return (
    <button onClick={() => !isOutOfStock && onClick()} disabled={isOutOfStock}
      className={`relative text-left transition-all group ${isOutOfStock ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 active:scale-[0.98]'}`}
      style={{ background: '#2d2d44', minHeight: '80px' }}>
      {product.image_url ? (
        <div className="absolute inset-0">
          <img src={product.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.2))' }} />
        </div>
      ) : null}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-3">
        {!product.image_url && <span className="text-2xl mb-1">{product.icon_emoji || '📦'}</span>}
        <span className="text-white text-sm font-semibold text-center leading-tight">{product.name}</span>
        <span className="text-gray-300 text-xs mt-0.5">{product.price.toLocaleString()} F</span>
      </div>
      {/* Colored category bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: catColor }} />
      {isOutOfStock && (
        <div className="absolute top-1 right-1 px-1.5 py-0.5 text-[9px] font-bold text-white" style={{ background: '#EF4444' }}>Rupture</div>
      )}
    </button>
  );
}

function NumpadBtn({ label, color, small, onClick }: { label: string; color?: string; small?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex items-center justify-center font-bold transition-all active:scale-95 min-h-[44px] ${small ? 'text-[10px] tracking-wide' : 'text-xl'}`}
      style={{
        background: color || '#2d2d44',
        color: color ? '#fff' : '#e5e5e5',
        padding: small ? '12px 4px' : '14px 4px',
      }}>
      {label}
    </button>
  );
}

function BottomBarBtn({ icon, label, onClick, badge }: { icon: React.ReactNode; label: string; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1 text-gray-400 hover:text-white transition-colors relative min-h-[40px]">
      {icon}
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
      {badge && badge > 0 ? (
        <span className="absolute -top-0.5 left-2 h-4 w-4 rounded-full bg-red-500 text-[9px] text-white flex items-center justify-center font-bold">{badge}</span>
      ) : null}
    </button>
  );
}
