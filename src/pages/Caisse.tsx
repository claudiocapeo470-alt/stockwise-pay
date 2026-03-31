import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";
import { useToast } from "@/hooks/use-toast";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useCompany } from "@/hooks/useCompany";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Search, Plus, Minus, Trash2, ShoppingCart,
  Printer, Lock, MoreHorizontal,
  Home, BarChart3, Settings, Pause,
  Camera, X, User, LogOut,
  CreditCard, Smartphone, DollarSign,
  Menu as MenuIcon, Percent, Hash, StickyNote, DoorOpen, XCircle,
  FileText, ArrowDownCircle, ArrowUpCircle, Package, ImageOff
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { generateCashReportPDF, CashReportPreview } from "@/components/caisse/CashReport";

// ─── Types ──────────────────────────────────────────────
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  icon_emoji: string;
  icon_bg_color: string;
  category: string | null;
  image_url: string | null;
  discount?: number;
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
  "#4F46E5", "#F59E0B", "#8B5CF6", "#EF4444", "#10B981",
  "#F97316", "#EC4899", "#6366F1", "#14B8A6", "#A855F7",
];

function getCategoryColor(cat: string, index: number, categoryColors: Record<string, string>): string {
  return categoryColors[cat] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

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
  // ─── State ──────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [cashInput, setCashInput] = useState("");
  const [showCashModal, setShowCashModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockPin, setLockPin] = useState("");
  const [sessionPin, setSessionPin] = useState<string>('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [heldTickets, setHeldTickets] = useState<HeldTicket[]>([]);
  const [showHeldTickets, setShowHeldTickets] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerStatus, setScannerStatus] = useState<'idle' | 'active' | 'detected' | 'not_found'>('idle');
  const [tableName, setTableName] = useState("Table 1");
  const [mobileView, setMobileView] = useState<'products' | 'ticket'>('products');
  const [orderMode, setOrderMode] = useState<'surplace' | 'emporter' | 'livraison'>('surplace');

  // Cash session
  const [cashSessionOpen, setCashSessionOpen] = useState(false);
  const [showOpenCashModal, setShowOpenCashModal] = useState(true);
  const [openingAmount, setOpeningAmount] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showCloseCashModal, setShowCloseCashModal] = useState(false);
  const [closingAmount, setClosingAmount] = useState("");
  const [closingNotes, setClosingNotes] = useState("");
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

  // Numpad modal
  const [showNumpad, setShowNumpad] = useState(false);
  const [numpadMode, setNumpadMode] = useState<'total' | 'cash'>('total');
  const [numpadValue, setNumpadValue] = useState("");

  // Category colors from DB
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});

  // Mobile sidebar drawer
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  // Mobile command drawer
  const [showMobileCommand, setShowMobileCommand] = useState(false);

  const { products } = useProducts();
  const { addSale } = useSales();
  const { toast } = useToast();
  const { settings } = useCompanySettings();
  const { profile, user, isEmployee, memberInfo } = useAuth();
  const { company } = useCompany();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const barcodeBufferRef = useRef("");
  const barcodeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScanTimeRef = useRef(0);
  const lastScanCodeRef = useRef("");

  // Effective user ID for shared data
  const effectiveUserId = isEmployee ? company?.owner_id : user?.id;

  // ─── Search debounce (200ms) ─────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Load category colors from DB
  useEffect(() => {
    if (!effectiveUserId) return;
    supabase.from('product_categories').select('name, color').eq('user_id', effectiveUserId).then(({ data }) => {
      if (data) {
        const colors: Record<string, string> = {};
        data.forEach(c => { if (c.color) colors[c.name] = c.color; });
        setCategoryColors(colors);
      }
    });
  }, [effectiveUserId]);

  // Check for existing open session on mount and restore state
  useEffect(() => {
    if (!effectiveUserId) return;
    const fetchActiveSession = async () => {
      const { data } = await supabase
        .from('cash_sessions')
        .select('*')
        .eq('user_id', effectiveUserId)
        .eq('status', 'open')
        .order('opened_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setCashSessionOpen(true);
        setCurrentSessionId(data.id);
        setOpeningAmount(String(data.opening_amount));
        setShowOpenCashModal(false);

        // Load existing movements for this session
        const { data: movements } = await supabase
          .from('cash_movements')
          .select('*')
          .eq('session_id', data.id)
          .order('created_at', { ascending: true });
        if (movements) setSessionMovements(movements as CashMovement[]);

        // Recalculate session sales from existing sales
        const { data: sessionSalesData } = await supabase
          .from('sales')
          .select('total_amount, payment_method')
          .eq('user_id', effectiveUserId)
          .gte('created_at', data.opened_at);

        if (sessionSalesData) {
          const totals = sessionSalesData.reduce((acc, sale) => ({
            total: acc.total + (sale.total_amount || 0),
            cash: acc.cash + (sale.payment_method === 'Espèces' ? sale.total_amount : 0),
            mobile: acc.mobile + (sale.payment_method === 'Mobile Money' ? sale.total_amount : 0),
            card: acc.card + (sale.payment_method === 'Carte bancaire' ? sale.total_amount : 0),
          }), { total: 0, cash: 0, mobile: 0, card: 0 });
          setSessionSales(totals);
        }
      } else {
        setCashSessionOpen(false);
        setShowOpenCashModal(true);
      }
    };
    fetchActiveSession();
  }, [effectiveUserId]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => { if (p.category) cats.add(p.category); });
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory) filtered = filtered.filter(p => p.category === selectedCategory);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    return filtered;
  }, [products, selectedCategory, debouncedSearch]);

  // ─── Cart Logic ─────────────────────────────────────────
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

  // ─── Scanner ──────────────────────────────────────────
  const handleScanResult = useCallback((text: string) => {
    if (!text || text.trim().length < 1) return;
    const code = text.trim();
    const now = Date.now();
    if (code === lastScanCodeRef.current && now - lastScanTimeRef.current < 1500) return;
    lastScanTimeRef.current = now;
    lastScanCodeRef.current = code;

    // Search product by: barcode, SKU, name (case-insensitive)
    const found = products.find(p =>
      p.sku === code ||
      p.sku?.toLowerCase() === code.toLowerCase() ||
      p.name?.toLowerCase() === code.toLowerCase()
    );

    if (found) {
      setScannerStatus('detected');
      setCart(prev => {
        const existing = prev.find(i => i.id === found.id);
        if (existing) {
          return prev.map(i => i.id === found.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
          );
        }
        return [...prev, {
          id: found.id, name: found.name, price: found.price,
          quantity: 1, icon_emoji: found.icon_emoji || '📦',
          icon_bg_color: found.icon_bg_color || '#E8EAF0',
          category: found.category || null,
          image_url: found.image_url || null,
        }];
      });
      playBeep();
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      toast({ title: '✅ Produit ajouté', description: found.name });
      setTimeout(() => setScannerStatus('active'), 1500);
    } else {
      setScannerStatus('not_found');
      setNotFoundCode(code);
      setShowProductNotFound(true);
      toast({ title: "Produit non trouvé", description: `Code: ${code}`, variant: "destructive" });
      setTimeout(() => setScannerStatus('idle'), 3000);
    }
  }, [products, toast]);

  // USB/HID barcode scanner + keyboard shortcut scanner
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked || showCashModal || showReceipt ||
          showCustomerModal || showOpenCashModal || showNumpad ||
          showManualScan || showScanner) return;
      // Ignore modifier keys
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // F2 key shortcut to open manual scan
      if (e.key === 'F2') {
        e.preventDefault();
        setShowManualScan(true);
        return;
      }
      // Escape key to close scanner
      if (e.key === 'Escape') {
        if (showScanner) stopScanner();
        if (showManualScan) setShowManualScan(false);
        return;
      }

      if (e.key === 'Enter') {
        const buf = barcodeBufferRef.current.trim();
        // Accept any input of 2+ chars (numbers, text, mixed)
        if (buf.length >= 2) {
          handleScanResult(buf);
          barcodeBufferRef.current = '';
        }
        return;
      }
      // Accept printable characters (numbers, letters, symbols)
      if (e.key.length === 1) {
        barcodeBufferRef.current += e.key;
        if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
        // USB scanners send chars very fast (< 50ms between chars)
        barcodeTimerRef.current = setTimeout(() => {
          barcodeBufferRef.current = '';
        }, 80);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, showCashModal, showReceipt, showCustomerModal,
      showOpenCashModal, showNumpad, showManualScan, showScanner,
      handleScanResult]);

  const startScanner = async () => {
    setShowScanner(true);
    setScannerStatus('idle');
    try {
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setShowScanner(false);
        setScannerStatus('idle');
        setShowManualScan(true);
        toast({ title: "Pas de caméra détectée", description: "Utilisez un lecteur USB ou la saisie manuelle." });
        return;
      }
      const cameraId = devices.find(d =>
        d.label.toLowerCase().includes('back') ||
        d.label.toLowerCase().includes('arrière') ||
        d.label.toLowerCase().includes('rear')
      )?.id || devices[0].id;

      const html5Qrcode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5Qrcode;
      await html5Qrcode.start(
        cameraId,
        {
          fps: 15,
          qrbox: { width: 280, height: 180 },
          aspectRatio: 1.5,
          disableFlip: false,
        },
        (decodedText) => {
          const cleaned = decodedText.trim().replace(/\s+/g, ' ');
          setScannerStatus('detected');
          handleScanResult(cleaned);
          setTimeout(() => setScannerStatus('active'), 1500);
        },
        () => {
          if (scannerStatus !== 'detected') setScannerStatus('active');
        }
      );
      setScannerStatus('active');
    } catch (err: any) {
      console.error('Scanner error:', err);
      setShowScanner(false);
      setScannerStatus('idle');
      setShowManualScan(true);
      toast({ title: "Erreur caméra", description: "Impossible d'accéder à la caméra. Utilisez la saisie manuelle.", variant: "destructive" });
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setShowScanner(false);
    setScannerStatus('idle');
  };

  // ─── Sale Validation ─────────────────────────────────
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
          created_by_member_id: isEmployee && memberInfo?.member_id ? memberInfo.member_id : undefined,
        });
      }
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

  // ─── Held Tickets ─────────────────────────────────────
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

  // ─── Cash Session ─────────────────────────────────────
  const openCashSession = async () => {
    if (!user) return;
    // Check for existing open session first
    const { data: existing } = await supabase
      .from('cash_sessions')
      .select('id')
      .eq('user_id', effectiveUserId)
      .eq('status', 'open')
      .maybeSingle();
    if (existing) {
      setCurrentSessionId(existing.id);
      setCashSessionOpen(true);
      setShowOpenCashModal(false);
      return;
    }
    const amount = parseFloat(openingAmount) || 0;
    const { data, error } = await supabase.from('cash_sessions').insert({ user_id: effectiveUserId, opening_amount: amount, status: 'open' }).select().single();
    if (error) { toast({ title: "Erreur", description: "Impossible d'ouvrir la caisse", variant: "destructive" }); return; }
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
      closed_at: new Date().toISOString(), closing_amount: realAmount, expected_amount: expectedAmount,
      difference: realAmount - expectedAmount, total_sales: sessionSales.total,
      total_cash: sessionSales.cash, total_mobile_money: sessionSales.mobile, total_card: sessionSales.card,
      total_expenses: totalExpenses, total_entries: totalEntries, closing_notes: closingNotes || null, status: 'closed',
    }).eq('id', currentSessionId);
    if (error) { toast({ title: "Erreur", description: "Impossible de fermer la caisse", variant: "destructive" }); return; }
    setCloseReportData({
      companyName, cashierName: isEmployee ? (memberInfo?.member_first_name || 'Caissier') : (profile?.first_name || 'Patron'),
      openedAt: new Date().toLocaleString('fr-FR'), closedAt: new Date().toLocaleString('fr-FR'),
      openingAmount: opening, totalSales: sessionSales.total, totalCash: sessionSales.cash,
      totalMobileMoney: sessionSales.mobile, totalCard: sessionSales.card,
      totalExpenses, totalEntries, expectedAmount, closingAmount: realAmount,
      difference: realAmount - expectedAmount, closingNotes,
    });
    setShowCloseCashModal(false);
    setShowCloseReport(true);
    toast({ title: "✅ Caisse fermée", description: "Session clôturée avec succès" });
  };

  const finalizeClose = () => {
    setCashSessionOpen(false); setCurrentSessionId(null); setShowCloseReport(false);
    setClosingAmount(""); setClosingNotes(""); setCloseReportData(null); setShowOpenCashModal(true);
  };

  // Cash movements
  const addMovement = async () => {
    if (!currentSessionId || !user) return;
    const amount = parseFloat(movementAmount) || 0;
    if (amount <= 0) return;
    const { data, error } = await supabase.from('cash_movements').insert({
      user_id: effectiveUserId, session_id: currentSessionId, type: movementType, amount,
      category: movementCategory || (movementType === 'expense' ? 'Dépense' : 'Entrée'),
      description: movementDescription || null,
    }).select().single();
    if (error) { toast({ title: "Erreur", description: "Impossible d'enregistrer le mouvement", variant: "destructive" }); return; }
    setSessionMovements(prev => [...prev, { id: data.id, type: movementType, amount, category: movementCategory, description: movementDescription, created_at: data.created_at }]);
    setShowMovementModal(false); setMovementAmount(""); setMovementCategory(""); setMovementDescription("");
    toast({ title: movementType === 'entry' ? "💰 Entrée enregistrée" : "💸 Dépense enregistrée", description: `${amount.toLocaleString()} FCFA` });
  };

  // Discounts
  const applyDiscountPercent = () => {
    const pct = parseFloat(discountValue) || 0;
    if (pct <= 0 || pct > 100) return;
    if (selectedItemId) {
      setCart(prev => prev.map(item => item.id === selectedItemId ? { ...item, discount: Math.round(item.price * item.quantity * pct / 100) } : item));
    } else {
      setCart(prev => prev.map(item => ({ ...item, discount: Math.round(item.price * item.quantity * pct / 100) })));
    }
    setShowDiscountPercent(false); setDiscountValue("");
    toast({ title: "Remise appliquée", description: `${pct}% de remise` });
  };

  const applyDiscountAmount = () => {
    const amt = parseFloat(discountValue) || 0;
    if (amt <= 0) return;
    if (selectedItemId) {
      setCart(prev => prev.map(item => item.id === selectedItemId ? { ...item, discount: amt } : item));
    } else {
      const ratio = amt / subtotal;
      setCart(prev => prev.map(item => ({ ...item, discount: Math.round(item.price * item.quantity * ratio) })));
    }
    setShowDiscountAmount(false); setDiscountValue("");
    toast({ title: "Remise appliquée", description: `${amt.toLocaleString()} FCFA de remise` });
  };

  const removeLastItem = () => { if (cart.length === 0) return; setCart(prev => prev.slice(0, -1)); toast({ title: "Dernier article annulé" }); };

  const printReceipt = () => {
    const printWindow = window.open('', '', 'width=320,height=600');
    if (!printWindow) return;
    const receiptContent = `<!DOCTYPE html><html><head><title>Ticket</title><style>@page{size:80mm auto;margin:0}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;width:80mm;padding:8px;background:#fff}.header{text-align:center;margin-bottom:8px}.company-name{font-size:16px;font-weight:bold;text-transform:uppercase}.divider{border-bottom:1px dashed #000;margin:6px 0}.date-row{display:flex;justify-content:space-between;font-size:10px}.item{margin:4px 0}.item-detail{display:flex;justify-content:space-between;font-size:11px;padding-left:8px}.total-section{margin-top:8px;padding-top:8px;border-top:2px solid #000}.total-row{display:flex;justify-content:space-between;font-size:14px;font-weight:bold}.footer{text-align:center;margin-top:12px;font-size:11px}</style></head><body><div class="header"><div class="company-name">${companyName}</div></div><div class="divider"></div><div class="date-row"><span>Date: ${new Date().toLocaleDateString('fr-FR')}</span><span>${new Date().toLocaleTimeString('fr-FR')}</span></div>${customerName ? `<div class="date-row"><span>Client: ${customerName}</span></div>` : ''}<div class="divider"></div>${cart.map(item => `<div class="item"><div>${item.name}</div><div class="item-detail"><span>${item.quantity} x ${item.price.toLocaleString('fr-FR')} FCFA</span><span>${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</span></div>${item.discount ? `<div class="item-detail" style="color:#e74c3c"><span>Remise</span><span>-${item.discount.toLocaleString('fr-FR')} FCFA</span></div>` : ''}</div>`).join('')}<div class="total-section">${totalDiscount > 0 ? `<div style="display:flex;justify-content:space-between;font-size:11px;color:#e74c3c"><span>Total remise</span><span>-${totalDiscount.toLocaleString('fr-FR')} FCFA</span></div>` : ''}<div class="total-row"><span>TOTAL</span><span>${total.toLocaleString('fr-FR')} FCFA</span></div></div><div class="footer"><div>Merci et à bientôt !</div><div style="font-size:9px;color:#666;margin-top:4px">Powered by Stocknix</div></div></body></html>`;
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); printWindow.onafterprint = () => printWindow.close(); };
    setTimeout(() => { setCart([]); setShowReceipt(false); setShowCashModal(false); setCustomerName(""); }, 1000);
  };

  const cashChange = cashInput ? parseFloat(cashInput) - total : 0;

  // Numpad handler
  const handleNumpadKey = (key: string) => {
    if (key === "C") { setNumpadValue(""); return; }
    if (key === "⌫") { setNumpadValue(prev => prev.slice(0, -1)); return; }
    if (key === "OK") {
      if (numpadMode === 'cash') {
        const val = parseFloat(numpadValue);
        if (val >= total) {
          setCashInput(numpadValue);
          setShowNumpad(false);
          setNumpadValue("");
          validateSale("Espèces");
        }
      } else {
        setShowNumpad(false);
        if (cart.length > 0) setShowCashModal(true);
      }
      return;
    }
    setNumpadValue(prev => prev + key);
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ═══════════════════════════════════════════════════════
  // PIN SETUP MODAL
  // ═══════════════════════════════════════════════════════
  if (showPinSetup) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: '#1A1F36' }}>
        <div className="text-center space-y-6 max-w-xs px-4 w-full">
          <Lock className="h-16 w-16 mx-auto" style={{ color: '#6B7280' }} />
          <h2 className="text-xl font-black text-white">Définir un PIN de verrouillage</h2>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Créez un code PIN à 6 chiffres pour verrouiller la caisse</p>
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-4 h-4 rounded-full border-2" style={{ background: lockPin.length > i ? '#4F46E5' : 'transparent', borderColor: lockPin.length > i ? '#4F46E5' : '#6B7280' }} />
            ))}
          </div>
          <input type="password" value={lockPin} onChange={e => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
            setLockPin(val);
            if (val.length === 6) {
              setSessionPin(val);
              setShowPinSetup(false);
              setIsLocked(true);
              setLockPin('');
              toast({ title: "🔒 Caisse verrouillée", description: "PIN défini avec succès" });
            }
          }} className="w-full text-center text-2xl tracking-widest h-14 rounded-xl border focus:outline-none focus:ring-2" style={{ background: '#F0F2F5', border: '1px solid #E8EAF0', color: '#1F2937' }} maxLength={6} inputMode="numeric" pattern="[0-9]*" autoFocus placeholder="• • • • • •" />
          <div className="grid grid-cols-3 gap-3">
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
              <button key={i} disabled={!key} onClick={() => {
                if (key === '⌫') { setLockPin(p => p.slice(0, -1)); }
                else if (key && lockPin.length < 6) {
                  const newPin = lockPin + key;
                  setLockPin(newPin);
                  if (newPin.length === 6) {
                    setSessionPin(newPin);
                    setShowPinSetup(false);
                    setIsLocked(true);
                    setLockPin('');
                    toast({ title: "🔒 Caisse verrouillée", description: "PIN défini avec succès" });
                  }
                }
              }} className="h-14 rounded-xl text-xl font-bold transition-all active:scale-95" style={{ background: key ? '#2A2F4A' : 'transparent', color: key === '⌫' ? '#EF4444' : '#FFFFFF', opacity: key ? 1 : 0 }}>{key}</button>
            ))}
          </div>
          <button onClick={() => { setShowPinSetup(false); setLockPin(''); }} className="text-sm text-white/50 hover:text-white/80">Annuler</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // GUARD: No session open
  // ═══════════════════════════════════════════════════════
  if (!currentSessionId && !showOpenCashModal) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: '#1A1F36' }}>
        <div className="text-center space-y-6 max-w-xs px-4 w-full">
          <Package className="h-16 w-16 mx-auto" style={{ color: '#6B7280' }} />
          <h2 className="text-xl font-black text-white">Caisse non ouverte</h2>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Vous devez ouvrir la caisse avant de pouvoir effectuer des ventes</p>
          <button onClick={() => setShowOpenCashModal(true)} className="w-full h-14 rounded-xl text-white font-bold text-lg" style={{ background: '#4F46E5' }}>Ouvrir la caisse</button>
          <button onClick={() => navigate('/app')} className="text-sm text-white/50 hover:text-white/80">Retour au dashboard</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // LOCK SCREEN
  // ═══════════════════════════════════════════════════════
  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: '#1A1F36' }}>
        <div className="text-center space-y-6 max-w-xs px-4 w-full">
          <Lock className="h-16 w-16 mx-auto" style={{ color: '#6B7280' }} />
          <h2 className="text-xl font-black text-white">Caisse verrouillée</h2>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            Entrez votre code PIN à 6 chiffres
          </p>
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-4 h-4 rounded-full border-2"
                style={{
                  background: lockPin.length > i ? '#4F46E5' : 'transparent',
                  borderColor: lockPin.length > i ? '#4F46E5' : '#6B7280'
                }} />
            ))}
          </div>
          <input
            type="password"
            value={lockPin}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setLockPin(val);
              if (val.length === 6) {
                if (val === sessionPin) {
                  setTimeout(() => { setIsLocked(false); setLockPin(''); }, 200);
                } else {
                  setTimeout(() => { setLockPin(''); }, 500);
                  toast({ title: "❌ PIN incorrect", description: "Veuillez réessayer", variant: "destructive" });
                }
              }
            }}
            className="w-full text-center text-2xl tracking-widest h-14 rounded-xl border focus:outline-none focus:ring-2"
            style={{ background: '#F0F2F5', border: '1px solid #E8EAF0', color: '#1F2937' }}
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus
            placeholder="• • • • • •"
          />
          <div className="grid grid-cols-3 gap-3">
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
              <button
                key={i}
                disabled={!key}
                onClick={() => {
                  if (key === '⌫') {
                    setLockPin(p => p.slice(0, -1));
                  } else if (key && lockPin.length < 6) {
                    const newPin = lockPin + key;
                    setLockPin(newPin);
                    if (newPin.length === 6) {
                      if (newPin === sessionPin) {
                        setTimeout(() => { setIsLocked(false); setLockPin(''); }, 200);
                      } else {
                        setTimeout(() => { setLockPin(''); }, 500);
                        toast({ title: "❌ PIN incorrect", description: "Veuillez réessayer", variant: "destructive" });
                      }
                    }
                  }
                }}
                className="h-14 rounded-xl text-xl font-bold transition-all active:scale-95"
                style={{
                  background: key ? '#2A2F4A' : 'transparent',
                  color: key === '⌫' ? '#EF4444' : '#FFFFFF',
                  opacity: key ? 1 : 0
                }}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // SHARED COMPONENTS (inline)
  // ═══════════════════════════════════════════════════════

  const renderHeader = () => (
    <header className="h-14 flex items-center justify-between px-4 shrink-0" style={{ background: '#1A1F36' }}>
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <span className="text-white font-black text-base tracking-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
          Stocknix POS
        </span>
        {cashSessionOpen && (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" /> Ouverte
          </span>
        )}
      </div>

      {/* Center: Action buttons */}
      <div className="flex items-center gap-1">
        <HeaderBtn icon={<Lock className="h-4 w-4" />} label="Verrouiller" onClick={() => { if (!sessionPin) { setShowPinSetup(true); } else { setIsLocked(true); setLockPin(''); } }} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/70 text-xs font-medium min-h-[44px]" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <MoreHorizontal className="h-4 w-4" /> Actions
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            <DropdownMenuItem onClick={() => { setDiscountValue(""); setShowDiscountPercent(true); }}><Percent className="h-4 w-4 mr-2" /> Remise %</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setDiscountValue(""); setShowDiscountAmount(true); }}><Hash className="h-4 w-4 mr-2" /> Remise montant</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={removeLastItem}><XCircle className="h-4 w-4 mr-2" /> Annuler dernier article</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setItemNote(""); setShowNoteModal(true); }}><StickyNote className="h-4 w-4 mr-2" /> Note interne</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setMovementType('entry'); setShowMovementModal(true); }}><ArrowDownCircle className="h-4 w-4 mr-2 text-[#10B981]" /> Entrée d'argent</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setMovementType('expense'); setShowMovementModal(true); }}><ArrowUpCircle className="h-4 w-4 mr-2 text-[#EF4444]" /> Dépense de caisse</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowMovementsList(true)}><FileText className="h-4 w-4 mr-2" /> Voir mouvements</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowCloseCashModal(true)} className="text-amber-500"><DoorOpen className="h-4 w-4 mr-2" /> Clôturer la caisse</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button onClick={() => setShowHeldTickets(true)}
          className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/70 text-xs font-medium min-h-[44px]"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <Pause className="h-4 w-4" />
          <span className="hidden sm:inline">Tickets</span>
          {heldTickets.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-[10px] text-white flex items-center justify-center font-bold" style={{ background: '#4F46E5' }}>
              {heldTickets.length}
            </span>
          )}
        </button>
      </div>

      {/* Right: Navigation */}
      <div className="flex items-center gap-1">
        <HeaderBtn icon={<Home className="h-4 w-4" />} label="Dashboard" onClick={() => navigate('/app')} />
        <HeaderBtn icon={<BarChart3 className="h-4 w-4" />} label="Stats" onClick={() => navigate('/app/performance')} />
        <HeaderBtn icon={<Settings className="h-4 w-4" />} label="Paramètres" onClick={() => navigate('/app/settings')} />
        <HeaderBtn icon={<Camera className="h-4 w-4" />} label="Scanner" onClick={startScanner} />
      </div>
    </header>
  );

  const renderSidebar = (compact: boolean = false) => (
    <aside className="flex flex-col gap-1.5 p-2 overflow-y-auto shrink-0" style={{
      background: '#FFFFFF', width: compact ? 56 : 88,
      borderRight: '1px solid #E8EAF0'
    }}>
      {/* All categories */}
      <button onClick={() => setSelectedCategory(null)}
        className="flex flex-col items-center justify-center rounded-[10px] min-h-[60px] p-1.5 transition-colors"
        style={{
          background: !selectedCategory ? '#4F46E5' : '#F8F9FB',
          color: !selectedCategory ? '#FFFFFF' : '#6B7280',
        }}>
        <Package className="h-5 w-5" />
        {!compact && <span className="text-[10px] font-semibold mt-1 leading-tight text-center truncate w-full">Tout</span>}
      </button>
      {categories.map((cat, i) => (
        <button key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
          className="flex flex-col items-center justify-center rounded-[10px] min-h-[60px] p-1.5 transition-colors"
          style={{
            background: selectedCategory === cat ? '#4F46E5' : '#F8F9FB',
            color: selectedCategory === cat ? '#FFFFFF' : '#6B7280',
          }}>
          <div className="h-5 w-5 rounded-md flex items-center justify-center text-xs" style={{
            background: selectedCategory === cat ? 'rgba(255,255,255,0.2)' : getCategoryColor(cat, i, categoryColors) + '22',
            color: selectedCategory === cat ? '#fff' : getCategoryColor(cat, i, categoryColors),
          }}>
            {cat.charAt(0).toUpperCase()}
          </div>
          {!compact && (
            <span className="text-[10px] font-semibold mt-1 leading-tight text-center truncate w-full" style={{ maxWidth: 72 }}>
              {cat.length > 8 ? cat.substring(0, 8) : cat}
            </span>
          )}
        </button>
      ))}
    </aside>
  );

  const renderProductGrid = () => (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#F0F2F5' }}>
      {/* Search bar */}
      <div className="px-3 py-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#6B7280' }} />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[10px] border focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
            style={{ background: '#FFFFFF', border: '1px solid #E8EAF0', color: '#1F2937' }}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3" style={{ color: '#E8EAF0' }} />
              <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Aucun produit trouvé</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))' }}>
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product}
                onClick={() => addToCart(product)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderCommandPanel = () => (
    <div className="flex flex-col shrink-0 overflow-hidden" style={{
      width: 300, background: '#FFFFFF', borderLeft: '1px solid #E8EAF0'
    }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid #E8EAF0' }}>
        <div className="flex items-center gap-2">
          <span className="font-black text-base" style={{ color: '#1F2937', fontFamily: 'Nunito, sans-serif' }}>Commande</span>
          {totalItems > 0 && (
            <span className="h-6 min-w-[24px] rounded-full text-[11px] text-white flex items-center justify-center font-bold px-1.5" style={{ background: '#4F46E5' }}>
              {totalItems}
            </span>
          )}
        </div>
        {customerName && <span className="text-xs font-medium" style={{ color: '#4F46E5' }}>{customerName}</span>}
      </div>

      {/* Order mode pills */}
      <div className="flex gap-1 px-3 py-2 shrink-0" style={{ borderBottom: '1px solid #E8EAF0' }}>
        {(['surplace', 'emporter', 'livraison'] as const).map(mode => (
          <button key={mode} onClick={() => setOrderMode(mode)}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
            style={{
              background: orderMode === mode ? '#4F46E5' : '#F8F9FB',
              color: orderMode === mode ? '#FFFFFF' : '#6B7280',
            }}>
            {mode === 'surplace' ? 'Sur place' : mode === 'emporter' ? 'À emporter' : 'Livraison'}
          </button>
        ))}
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {cart.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: '#6B7280' }}>Aucun article</p>
          </div>
        ) : (
          <div className="space-y-1">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-2 py-2 px-1 rounded-lg"
                onClick={() => setSelectedItemId(item.id === selectedItemId ? null : item.id)}
                style={{
                  background: selectedItemId === item.id ? '#EEF2FF' : 'transparent',
                  borderBottom: '1px solid #F0F2F5', cursor: 'pointer'
                }}>
                <span className="h-7 min-w-[28px] rounded-md text-[11px] text-white flex items-center justify-center font-bold" style={{ background: '#4F46E5' }}>
                  {item.quantity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: '#1F2937' }}>{item.name}</p>
                  {item.note && <p className="text-[10px] truncate" style={{ color: '#F59E0B' }}>📝 {item.note}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.discount ? (
                    <div className="text-right">
                      <span className="text-[10px] line-through block" style={{ color: '#EF4444' }}>{(item.price * item.quantity).toLocaleString()}</span>
                      <span className="text-xs font-bold" style={{ color: '#1F2937' }}>{(item.price * item.quantity - item.discount).toLocaleString()} F</span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold" style={{ color: '#1F2937' }}>{(item.price * item.quantity).toLocaleString()} F</span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                    className="h-6 w-6 rounded flex items-center justify-center min-h-[24px]" style={{ color: '#EF4444' }}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total + Actions */}
      <div className="shrink-0 px-3 pb-3 space-y-2" style={{ borderTop: '1px solid #E8EAF0' }}>
        {totalDiscount > 0 && (
          <div className="flex justify-between text-xs pt-2" style={{ color: '#EF4444' }}>
            <span>Remise</span><span>-{totalDiscount.toLocaleString()} F</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-bold" style={{ color: '#6B7280' }}>TOTAL</span>
          <span className="font-black" style={{ color: '#4F46E5', fontSize: 'clamp(20px, 4vw, 32px)', fontFamily: 'Nunito, sans-serif' }}>
            {total.toLocaleString()} F
          </span>
        </div>

        {/* Action buttons row */}
        <div className="flex gap-1.5">
          <ActionBtn label="Client" icon={<User className="h-3.5 w-3.5" />} onClick={() => setShowCustomerModal(true)} />
          <ActionBtn label="Attente" icon={<Pause className="h-3.5 w-3.5" />} onClick={holdTicket} />
          <ActionBtn label="Vider" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setCart([])} color="#EF4444" />
        </div>

        {/* Total + Espèces buttons */}
        <div className="flex gap-2">
          <button onClick={() => { setNumpadMode('total'); setNumpadValue(""); setShowNumpad(true); }}
            className="flex-1 py-3 rounded-xl text-white font-bold text-sm min-h-[48px]"
            style={{ background: '#4F46E5' }}>
            Total
          </button>
          <button onClick={() => { setNumpadMode('cash'); setNumpadValue(""); setShowNumpad(true); }}
            className="flex-1 py-3 rounded-xl text-white font-bold text-sm min-h-[48px]"
            style={{ background: '#10B981' }}>
            Espèces
          </button>
        </div>

        {/* Other payment methods */}
        <div className="flex gap-1.5">
          <button onClick={() => validateSale("Mobile Money")}
            className="flex-1 py-2 rounded-lg text-xs font-semibold min-h-[44px] flex items-center justify-center gap-1"
            style={{ background: '#F59E0B', color: '#fff' }}>
            <Smartphone className="h-3.5 w-3.5" /> Mobile
          </button>
          <button onClick={() => validateSale("Carte bancaire")}
            className="flex-1 py-2 rounded-lg text-xs font-semibold min-h-[44px] flex items-center justify-center gap-1"
            style={{ background: '#3B82F6', color: '#fff' }}>
            <CreditCard className="h-3.5 w-3.5" /> CB
          </button>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // MODALS
  // ═══════════════════════════════════════════════════════
  const renderModals = () => (
    <>
      {/* Numpad Modal */}
      {showNumpad && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => { setShowNumpad(false); setNumpadValue(""); }}>
          <div className="w-full max-w-xs p-5 space-y-4 rounded-[20px]" style={{ background: '#FFFFFF' }} onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <p className="text-xs font-medium" style={{ color: '#6B7280' }}>
                {numpadMode === 'cash' ? 'Montant reçu' : 'Total à payer'}
              </p>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: '#1A1F36' }}>
              <span className="font-black text-white" style={{ fontSize: 32, fontFamily: 'Nunito, sans-serif' }}>
                {numpadValue || total.toLocaleString()} F
              </span>
            </div>
            {numpadMode === 'cash' && numpadValue && parseFloat(numpadValue) >= total && (
              <div className="text-center p-2 rounded-lg" style={{ background: '#ECFDF5' }}>
                <p className="text-[11px]" style={{ color: '#6B7280' }}>Monnaie à rendre</p>
                <p className="text-lg font-black" style={{ color: '#10B981' }}>{(parseFloat(numpadValue) - total).toLocaleString()} F</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(key => (
                <button key={key} onClick={() => handleNumpadKey(key)}
                  className="flex items-center justify-center rounded-xl min-h-[52px] font-bold text-lg transition-all active:scale-95"
                  style={{
                    background: key === '⌫' ? '#FFF0F0' : '#F8F9FB',
                    color: key === '⌫' ? '#EF4444' : '#1F2937',
                    fontFamily: 'Nunito, sans-serif',
                  }}>
                  {key}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setShowNumpad(false); setNumpadValue(""); }}
                className="py-3 rounded-xl font-semibold text-sm min-h-[48px]"
                style={{ background: '#F8F9FB', color: '#6B7280' }}>
                Annuler
              </button>
              <button onClick={() => handleNumpadKey("OK")}
                className="py-3 rounded-xl text-white font-bold text-sm min-h-[48px]"
                style={{ background: '#4F46E5' }}>
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Modal — supports QR, barcode 1D/2D, all formats */}
      {showScanner && (
        <ModalOverlay onClose={stopScanner}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm" style={{ color: '#1F2937' }}>Scanner de produit</h3>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                scannerStatus === 'active'   ? 'bg-green-100 text-green-700' :
                scannerStatus === 'detected' ? 'bg-blue-100 text-blue-700' :
                scannerStatus === 'not_found'? 'bg-red-100 text-red-700' :
                                              'bg-gray-100 text-gray-500'
              }`}>
                {scannerStatus === 'active'    ? '● Caméra active' :
                 scannerStatus === 'detected'  ? '✓ Code détecté' :
                 scannerStatus === 'not_found' ? '✗ Non trouvé' :
                                                '◌ Démarrage...'}
              </span>
              <button onClick={stopScanner} style={{ color: '#6B7280' }}><X className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '4/3' }}>
            <div id="qr-reader" className="w-full h-full" />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)' }} />
              <div className="absolute" style={{ top: '20%', left: '8%', right: '8%', bottom: '20%', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 8 }} />
              <div className="absolute left-[10%] right-[10%] h-0.5 bg-red-500/80 animate-pulse" style={{ top: '40%' }} />
              <div className="absolute w-6 h-6 border-t-2 border-l-2 border-green-400" style={{ top: '18%', left: '6%' }} />
              <div className="absolute w-6 h-6 border-t-2 border-r-2 border-green-400" style={{ top: '18%', right: '6%' }} />
              <div className="absolute w-6 h-6 border-b-2 border-l-2 border-green-400" style={{ bottom: '18%', left: '6%' }} />
              <div className="absolute w-6 h-6 border-b-2 border-r-2 border-green-400" style={{ bottom: '18%', right: '6%' }} />
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <span className="text-[10px] text-white/60 bg-black/30 px-2 py-0.5 rounded">QR Code • Code-barres 1D/2D • EAN • UPC</span>
              </div>
            </div>
            {scannerStatus === 'detected' && (
              <div className="absolute inset-0 bg-green-400/20 rounded-xl animate-pulse pointer-events-none" />
            )}
          </div>
          <p className="text-center text-xs mt-2" style={{ color: '#9CA3AF' }}>Centrez le code dans le cadre • Restez stable</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button onClick={() => { stopScanner(); setShowManualScan(true); }}
              className="py-2.5 rounded-xl text-sm font-medium" style={{ background: '#F8F9FB', color: '#6B7280' }}>
              ⌨ Saisie manuelle
            </button>
            <button onClick={stopScanner}
              className="py-2.5 rounded-xl text-sm font-medium" style={{ background: '#FEE2E2', color: '#EF4444' }}>
              ✕ Fermer
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* Manual scan — accepts barcode, SKU, number, text */}
      {showManualScan && (
        <ModalOverlay onClose={() => setShowManualScan(false)}>
          <h3 className="font-bold text-center mb-1" style={{ color: '#1F2937' }}>Saisie manuelle</h3>
          <p className="text-xs text-center mb-3" style={{ color: '#9CA3AF' }}>Code-barres • SKU • Référence • Numéro</p>
          <input
            value={manualBarcode}
            onChange={e => setManualBarcode(e.target.value)}
            placeholder="Code-barres / SKU / Référence..."
            className="w-full h-12 text-center font-mono text-base rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            style={{ background: '#F8F9FB', border: '1px solid #E8EAF0', color: '#1F2937' }}
            autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            onKeyDown={e => {
              if (e.key === 'Enter' && manualBarcode.trim()) {
                handleScanResult(manualBarcode.trim());
                setManualBarcode('');
                setShowManualScan(false);
              }
              if (e.key === 'Escape') setShowManualScan(false);
            }}
          />
          <p className="text-[10px] text-center mt-1" style={{ color: '#C4C9D4' }}>Appuyez sur Entrée ou cliquez Rechercher</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <ModalBtn label="Annuler" onClick={() => { setShowManualScan(false); setManualBarcode(''); }} />
            <ModalBtn label="Rechercher" primary onClick={() => {
              if (manualBarcode.trim()) {
                handleScanResult(manualBarcode.trim());
                setManualBarcode('');
                setShowManualScan(false);
              }
            }} />
          </div>
        </ModalOverlay>
      )}

      {/* Product Not Found */}
      {showProductNotFound && (
        <ModalOverlay onClose={() => setShowProductNotFound(false)}>
          <h3 className="text-lg font-bold text-center" style={{ color: '#1F2937' }}>Produit non trouvé</h3>
          <p className="text-sm text-center" style={{ color: '#6B7280' }}>Code scanné: <span className="font-mono font-bold" style={{ color: '#1F2937' }}>{notFoundCode}</span></p>
          <div className="grid grid-cols-2 gap-2">
            <ModalBtn label="Fermer" onClick={() => setShowProductNotFound(false)} />
            <ModalBtn label="Créer le produit" primary onClick={() => { setShowProductNotFound(false); navigate('/app/stocks'); }} color="#10B981" />
          </div>
        </ModalOverlay>
      )}

      {/* Cash Modal */}
      {showCashModal && (
        <ModalOverlay onClose={() => setShowCashModal(false)}>
          <h3 className="text-lg font-bold text-center" style={{ color: '#1F2937' }}>Paiement Espèces</h3>
          <div className="text-center">
            <p className="text-sm" style={{ color: '#6B7280' }}>Total à payer</p>
            <p className="font-black" style={{ color: '#4F46E5', fontSize: 28, fontFamily: 'Nunito, sans-serif' }}>{total.toLocaleString()} FCFA</p>
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: '#1F2937' }}>Montant reçu</label>
            <input type="number" value={cashInput} onChange={e => setCashInput(e.target.value)} placeholder="Montant donné..."
              className="mt-1 w-full text-lg h-12 text-center font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
              style={{ background: '#F8F9FB', border: '1px solid #E8EAF0', color: '#1F2937' }}
              autoFocus />
          </div>
          {cashInput && parseFloat(cashInput) >= total && (
            <div className="text-center p-3 rounded-xl" style={{ background: '#ECFDF5' }}>
              <p className="text-sm" style={{ color: '#6B7280' }}>Monnaie à rendre</p>
              <p className="text-2xl font-black" style={{ color: '#10B981' }}>{cashChange.toLocaleString()} FCFA</p>
            </div>
          )}
          {cashInput && parseFloat(cashInput) < total && <p className="text-sm text-center font-medium" style={{ color: '#EF4444' }}>Montant insuffisant</p>}
          <div className="grid grid-cols-2 gap-2">
            <ModalBtn label="Annuler" onClick={() => { setShowCashModal(false); setCashInput(""); }} />
            <ModalBtn label="Confirmer" primary disabled={!cashInput || parseFloat(cashInput) < total || addSale.isPending}
              onClick={() => { validateSale("Espèces"); setCashInput(""); }} />
          </div>
        </ModalOverlay>
      )}

      {/* Receipt */}
      {showReceipt && (
        <ModalOverlay onClose={() => { setCart([]); setShowReceipt(false); setShowCashModal(false); setCustomerName(""); }}>
          <h3 className="text-lg font-bold text-center" style={{ color: '#1F2937' }}>Ticket de caisse</h3>
          <div className="border rounded-xl p-4 space-y-2 font-mono text-sm" style={{ background: '#F8F9FB', borderColor: '#E8EAF0', color: '#1F2937' }}>
            <p className="text-center font-bold">{companyName}</p>
            <p className="text-center text-xs" style={{ color: '#6B7280' }}>{new Date().toLocaleDateString('fr-FR')} — {new Date().toLocaleTimeString('fr-FR')}</p>
            {customerName && <p className="text-center text-xs">Client: {customerName}</p>}
            <div className="border-t border-dashed my-2" style={{ borderColor: '#E8EAF0' }} />
            {cart.map(item => (
              <div key={item.id}>
                <div className="flex justify-between text-xs">
                  <span>{item.name} ×{item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString()} F</span>
                </div>
                {item.discount && <div className="flex justify-between text-[10px]" style={{ color: '#EF4444' }}><span>Remise</span><span>-{item.discount.toLocaleString()} F</span></div>}
              </div>
            ))}
            <div className="border-t border-dashed my-2" style={{ borderColor: '#E8EAF0' }} />
            {totalDiscount > 0 && <div className="flex justify-between text-xs" style={{ color: '#EF4444' }}><span>Remise totale</span><span>-{totalDiscount.toLocaleString()} F</span></div>}
            <div className="flex justify-between font-bold"><span>TOTAL</span><span>{total.toLocaleString()} FCFA</span></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ModalBtn label="Imprimer" primary icon={<Printer className="h-4 w-4" />} onClick={printReceipt} />
            <ModalBtn label="Nouveau ticket" onClick={() => { setCart([]); setShowReceipt(false); setShowCashModal(false); setCustomerName(""); }} />
          </div>
        </ModalOverlay>
      )}

      {/* Customer */}
      {showCustomerModal && (
        <ModalOverlay onClose={() => setShowCustomerModal(false)}>
          <h3 className="text-lg font-bold text-center" style={{ color: '#1F2937' }}>Ajouter un client</h3>
          <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nom du client..."
            className="w-full h-12 text-center rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            style={{ background: '#F8F9FB', border: '1px solid #E8EAF0', color: '#1F2937' }}
            autoFocus />
          <div className="grid grid-cols-2 gap-2">
            <ModalBtn label="Annuler" onClick={() => setShowCustomerModal(false)} />
            <ModalBtn label="Valider" primary onClick={() => { setShowCustomerModal(false); toast({ title: "Client ajouté", description: customerName || "Anonyme" }); }} />
          </div>
        </ModalOverlay>
      )}

      {/* Held Tickets */}
      {showHeldTickets && (
        <ModalOverlay onClose={() => setShowHeldTickets(false)} wide>
          <h3 className="text-lg font-bold text-center" style={{ color: '#1F2937' }}>Tickets en attente ({heldTickets.length})</h3>
          {heldTickets.length === 0 ? (
            <p className="text-center py-4" style={{ color: '#6B7280' }}>Aucun ticket en attente</p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {heldTickets.map(ticket => (
                <button key={ticket.id} onClick={() => resumeTicket(ticket.id)}
                  className="w-full text-left p-3 rounded-xl transition-colors" style={{ background: '#F8F9FB' }}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm" style={{ color: '#1F2937' }}>{ticket.customerName}</span>
                    <span className="font-bold text-sm" style={{ color: '#4F46E5' }}>{ticket.total.toLocaleString()} F</span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{ticket.items.length} article(s) • {ticket.tableName} • {ticket.createdAt.toLocaleTimeString('fr-FR')}</p>
                </button>
              ))}
            </div>
          )}
          <ModalBtn label="Fermer" onClick={() => setShowHeldTickets(false)} />
        </ModalOverlay>
      )}

      {/* Open Cash Session — MANDATORY */}
      {showOpenCashModal && !cashSessionOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-sm p-6 space-y-4 rounded-[20px]" style={{ background: '#FFFFFF' }}>
            <h3 className="text-lg font-bold text-center" style={{ color: '#1F2937' }}>Ouverture de caisse</h3>
            <p className="text-xs text-center" style={{ color: '#6B7280' }}>Vous devez ouvrir la caisse pour commencer à vendre</p>
            <div className="text-center text-[10px]" style={{ color: '#6B7280' }}>
              {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              <br />Caissier: {profile?.first_name || "Manager"}
            </div>
            <div>
              <label className="text-sm font-medium" style={{ color: '#1F2937' }}>Fond de caisse (FCFA)</label>
              <input type="number" value={openingAmount} onChange={e => setOpeningAmount(e.target.value)} placeholder="Montant du fond de caisse..."
                className="mt-1 w-full h-12 text-center font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
                style={{ background: '#F8F9FB', border: '1px solid #E8EAF0', color: '#1F2937' }}
                autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ModalBtn label="← Retour" onClick={() => navigate('/app')} />
              <ModalBtn label="Ouvrir la caisse" primary onClick={openCashSession} color="#10B981" />
            </div>
          </div>
        </div>
      )}

      {/* Close Cash Session */}
      {showCloseCashModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto rounded-[20px]" style={{ background: '#FFFFFF' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-center" style={{ color: '#1F2937' }}>Clôture de caisse</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl" style={{ background: '#F8F9FB' }}>
                <p style={{ color: '#6B7280' }}>Fond de départ</p>
                <p className="font-bold text-lg" style={{ color: '#1F2937' }}>{(parseFloat(openingAmount) || 0).toLocaleString()} F</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: '#ECFDF5' }}>
                <p style={{ color: '#6B7280' }}>Total ventes</p>
                <p className="font-bold text-lg" style={{ color: '#10B981' }}>{sessionSales.total.toLocaleString()} F</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between" style={{ color: '#1F2937' }}><span>Espèces</span><span>{sessionSales.cash.toLocaleString()} F</span></div>
              <div className="flex justify-between" style={{ color: '#1F2937' }}><span>Mobile Money</span><span>{sessionSales.mobile.toLocaleString()} F</span></div>
              <div className="flex justify-between" style={{ color: '#1F2937' }}><span>Carte bancaire</span><span>{sessionSales.card.toLocaleString()} F</span></div>
            </div>
            <div>
              <label className="text-sm font-medium" style={{ color: '#1F2937' }}>Montant compté en caisse (FCFA)</label>
              <input type="number" value={closingAmount} onChange={e => setClosingAmount(e.target.value)} placeholder="Montant réel..."
                className="mt-1 w-full h-12 text-center font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
                style={{ background: '#F8F9FB', border: '1px solid #E8EAF0', color: '#1F2937' }}
                autoFocus />
            </div>
            {closingAmount && (() => {
              const opening = parseFloat(openingAmount) || 0;
              const totalExp = sessionMovements.filter(m => m.type === 'expense').reduce((s, m) => s + m.amount, 0);
              const totalEnt = sessionMovements.filter(m => m.type === 'entry').reduce((s, m) => s + m.amount, 0);
              const expected = opening + sessionSales.cash + totalEnt - totalExp;
              const diff = (parseFloat(closingAmount) || 0) - expected;
              return (
                <div className="p-3 text-center rounded-xl" style={{ background: diff >= 0 ? '#ECFDF5' : '#FEF2F2' }}>
                  <p className="text-xs" style={{ color: '#6B7280' }}>Écart</p>
                  <p className="text-xl font-black" style={{ color: diff >= 0 ? '#10B981' : '#EF4444' }}>
                    {diff >= 0 ? '+' : ''}{diff.toLocaleString()} F
                  </p>
                </div>
              );
            })()}
            <div>
              <label className="text-sm font-medium" style={{ color: '#1F2937' }}>Notes (optionnel)</label>
              <textarea value={closingNotes} onChange={e => setClosingNotes(e.target.value)} placeholder="Commentaire..."
                className="mt-1 w-full h-16 p-3 text-sm rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
                style={{ background: '#F8F9FB', border: '1px solid #E8EAF0', color: '#1F2937' }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ModalBtn label="Annuler" onClick={() => setShowCloseCashModal(false)} />
              <ModalBtn label="Clôturer" primary onClick={closeCashSession} color="#F59E0B" />
            </div>
          </div>
        </div>
      )}

      {/* Close Report */}
      {showCloseReport && closeReportData && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-sm p-6 space-y-4 max-h-[90vh] overflow-y-auto rounded-[20px]" style={{ background: '#FFFFFF' }}>
            <div className="text-xs space-y-1" style={{ color: '#1F2937' }}>
              <CashReportPreview data={closeReportData} />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <ModalBtn label="Export PDF" primary icon={<FileText className="h-4 w-4" />} onClick={() => generateCashReportPDF(closeReportData)} />
              <ModalBtn label="Nouvelle session" primary onClick={finalizeClose} color="#10B981" />
            </div>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovementModal && (
        <ModalOverlay onClose={() => setShowMovementModal(false)}>
          <h3 className="text-lg font-bold text-center" style={{ color: '#1F2937' }}>
            {movementType === 'entry' ? 'Entrée d\'argent' : 'Dépense de caisse'}
          </h3>
          <div>
            <label className="text-sm font-medium" style={{ color: '#1F2937' }}>Montant (FCFA)</label>
            <input type="number" value={movementAmount} onChange={e => setMovementAmount(e.target.value)} placeholder="Montant..."
              className="mt-1 w-full h-12 text-center font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
              style={{ background: '#F8F9FB', border: '1px solid #E8EAF0', color: '#1F2937' }}
              autoFocus />
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: '#1F2937' }}>Catégorie</label>
            <input value={movementCategory} onChange={e => setMovementCategory(e.target.value)}
              placeholder={movementType === 'expense' ? "Ex: Fournitures, Transport..." : "Ex: Apport, Remboursement..."}
              className="mt-1 w-full h-10 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
              style={{ background: '#F8F9FB', border: '1px solid #E8EAF0', color: '#1F2937' }} />
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: '#1F2937' }}>Motif</label>
            <input value={movementDescription} onChange={e => setMovementDescription(e.target.value)} placeholder="Description..."
              className="mt-1 w-full h-10 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
              style={{ background: '#F8F9FB', border: '1px solid #E8EAF0', color: '#1F2937' }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ModalBtn label="Annuler" onClick={() => setShowMovementModal(false)} />
            <ModalBtn label={movementType === 'entry' ? 'Enregistrer entrée' : 'Enregistrer dépense'} primary
              onClick={addMovement} color={movementType === 'entry' ? '#10B981' : '#EF4444'} />
          </div>
        </ModalOverlay>
      )}

      {/* Movements List */}
      {showMovementsList && (
        <ModalOverlay onClose={() => setShowMovementsList(false)} wide>
          <h3 className="text-lg font-bold text-center" style={{ color: '#1F2937' }}>Mouvements de caisse</h3>
          {sessionMovements.length === 0 ? (
            <p className="text-center py-4" style={{ color: '#6B7280' }}>Aucun mouvement</p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {sessionMovements.map(m => (
                <div key={m.id} className="p-3 rounded-xl flex items-center justify-between" style={{ background: '#F8F9FB' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1F2937' }}>{m.category || (m.type === 'entry' ? 'Entrée' : 'Dépense')}</p>
                    {m.description && <p className="text-xs" style={{ color: '#6B7280' }}>{m.description}</p>}
                  </div>
                  <span className="font-bold text-sm" style={{ color: m.type === 'entry' ? '#10B981' : '#EF4444' }}>
                    {m.type === 'entry' ? '+' : '-'}{m.amount.toLocaleString()} F
                  </span>
                </div>
              ))}
            </div>
          )}
          <ModalBtn label="Fermer" onClick={() => setShowMovementsList(false)} />
        </ModalOverlay>
      )}

      {/* Discount % */}
      {showDiscountPercent && (
        <ModalOverlay onClose={() => setShowDiscountPercent(false)}>
          <h3 className="text-lg font-bold text-center" style={{ color: '#1F2937' }}>Remise en pourcentage</h3>
          <p className="text-xs text-center" style={{ color: '#6B7280' }}>{selectedItemId ? "Sur l'article sélectionné" : "Sur tout le ticket"}</p>
          <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder="Pourcentage (ex: 10)..."
            className="w-full h-12 text-center font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            style={{ background: '#F8F9FB', border: '1px solid #E8EAF0', color: '#1F2937' }}
            autoFocus max={100} />
          <div className="grid grid-cols-2 gap-2">
            <ModalBtn label="Annuler" onClick={() => setShowDiscountPercent(false)} />
            <ModalBtn label="Appliquer" primary onClick={applyDiscountPercent} />
          </div>
        </ModalOverlay>
      )}

      {/* Discount Amount */}
      {showDiscountAmount && (
        <ModalOverlay onClose={() => setShowDiscountAmount(false)}>
          <h3 className="text-lg font-bold text-center" style={{ color: '#1F2937' }}>Remise en montant</h3>
          <p className="text-xs text-center" style={{ color: '#6B7280' }}>{selectedItemId ? "Sur l'article sélectionné" : "Sur tout le ticket"}</p>
          <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} placeholder="Montant (FCFA)..."
            className="w-full h-12 text-center font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            style={{ background: '#F8F9FB', border: '1px solid #E8EAF0', color: '#1F2937' }}
            autoFocus />
          <div className="grid grid-cols-2 gap-2">
            <ModalBtn label="Annuler" onClick={() => setShowDiscountAmount(false)} />
            <ModalBtn label="Appliquer" primary onClick={applyDiscountAmount} />
          </div>
        </ModalOverlay>
      )}

      {/* Note */}
      {showNoteModal && (
        <ModalOverlay onClose={() => setShowNoteModal(false)}>
          <h3 className="text-lg font-bold text-center" style={{ color: '#1F2937' }}>Note interne</h3>
          <textarea value={itemNote} onChange={e => setItemNote(e.target.value)} placeholder="Note pour cet article ou le ticket..."
            className="w-full h-24 p-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            style={{ background: '#F8F9FB', border: '1px solid #E8EAF0', color: '#1F2937' }}
            autoFocus />
          <div className="grid grid-cols-2 gap-2">
            <ModalBtn label="Annuler" onClick={() => setShowNoteModal(false)} />
            <ModalBtn label="Enregistrer" primary onClick={() => {
              if (selectedItemId) setCart(prev => prev.map(item => item.id === selectedItemId ? { ...item, note: itemNote } : item));
              setShowNoteModal(false);
              toast({ title: "Note ajoutée" });
            }} />
          </div>
        </ModalOverlay>
      )}
    </>
  );

  // ═══════════════════════════════════════════════════════
  // DESKTOP / TABLET LAYOUT
  // ═══════════════════════════════════════════════════════
  if (!isMobile) {
    const isTablet = typeof window !== 'undefined' && window.innerWidth < 1024;
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#F0F2F5' }}>
        {renderHeader()}
        <div className="flex-1 flex overflow-hidden">
          {renderSidebar(isTablet)}
          {renderProductGrid()}
          {renderCommandPanel()}
        </div>
        {renderModals()}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ═══════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#F0F2F5' }}>
      {/* Mobile Header */}
      <header className="h-14 flex items-center justify-between px-3 shrink-0" style={{ background: '#1A1F36' }}>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/app')} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white/70">
            <Home className="h-5 w-5" />
          </button>
          <span className="text-white font-black text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>POS</span>
          {cashSessionOpen && <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />}
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={startScanner} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white/70">
            <Camera className="h-5 w-5" />
          </button>
          <button onClick={() => setIsLocked(true)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white/70">
            <Lock className="h-5 w-5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white/70">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={holdTicket}>⏸️ Mettre en attente</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowHeldTickets(true)}>🎫 Tickets ({heldTickets.length})</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowCustomerModal(true)}>👤 Client</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/app/performance')}>📊 Statistiques</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/app/settings')}>⚙️ Paramètres</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setDiscountValue(""); setShowDiscountPercent(true); }}>Remise %</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setMovementType('entry'); setShowMovementModal(true); }}>💰 Entrée d'argent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setMovementType('expense'); setShowMovementModal(true); }}>💸 Dépense</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowCloseCashModal(true)} className="text-amber-500">🔒 Clôturer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white" onClick={() => setMobileView(mobileView === 'products' ? 'ticket' : 'products')}>
            {mobileView === 'products' ? (
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full text-[9px] text-white flex items-center justify-center font-bold" style={{ background: '#EF4444' }}>{totalItems}</span>}
              </div>
            ) : (
              <span className="text-xs font-semibold">Produits</span>
            )}
          </button>
        </div>
      </header>

      {mobileView === 'products' ? (
        <>
          {/* Mobile categories horizontal scroll */}
          <div className="px-3 pt-2 pb-1 shrink-0" style={{ background: '#F0F2F5' }}>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#6B7280' }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..."
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-[10px] border focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
                style={{ background: '#FFFFFF', border: '1px solid #E8EAF0', color: '#1F2937' }} />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button onClick={() => setSelectedCategory(null)}
                className="shrink-0 px-3 py-2 text-xs font-semibold rounded-lg min-h-[36px]"
                style={{ background: !selectedCategory ? '#4F46E5' : '#FFFFFF', color: !selectedCategory ? '#fff' : '#6B7280', border: '1px solid #E8EAF0' }}>
                Tout
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                  className="shrink-0 px-3 py-2 text-xs font-semibold rounded-lg min-h-[36px]"
                  style={{ background: selectedCategory === cat ? '#4F46E5' : '#FFFFFF', color: selectedCategory === cat ? '#fff' : '#6B7280', border: '1px solid #E8EAF0' }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile products */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <div className="grid grid-cols-2 gap-2.5" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onClick={() => addToCart(product)} />
              ))}
            </div>
          </div>

          {/* Mobile cart bar */}
          {totalItems > 0 && (
            <button onClick={() => setMobileView('ticket')}
              className="mx-3 mb-3 flex items-center justify-between px-4 py-3.5 rounded-xl text-white min-h-[48px]" style={{ background: '#4F46E5' }}>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm font-bold">{totalItems} article(s)</span>
              </div>
              <span className="text-sm font-black">{total.toLocaleString()} F</span>
            </button>
          )}
        </>
      ) : (
        <>
          {/* Mobile Ticket */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm" style={{ color: '#1F2937' }}>Commande</h3>
                {totalItems > 0 && (
                  <span className="h-5 min-w-[20px] rounded-full text-[10px] text-white flex items-center justify-center font-bold px-1" style={{ background: '#4F46E5' }}>
                    {totalItems}
                  </span>
                )}
              </div>
              <button onClick={() => setCart([])} className="text-xs min-h-[44px] flex items-center" style={{ color: '#EF4444' }}>Vider</button>
            </div>
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2.5 rounded-lg" style={{ borderBottom: '1px solid #E8EAF0' }}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="h-7 min-w-[28px] rounded-md text-[11px] text-white flex items-center justify-center font-bold" style={{ background: '#4F46E5' }}>
                    {item.quantity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#1F2937' }}>{item.name}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>{item.price.toLocaleString()} F × {item.quantity}</p>
                    {item.discount && <p className="text-[10px]" style={{ color: '#EF4444' }}>Remise: -{item.discount.toLocaleString()} F</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => updateQuantity(item.id, -1)} className="h-9 w-9 flex items-center justify-center rounded-lg min-h-[44px] min-w-[44px]" style={{ background: '#F8F9FB' }}>
                    <Minus className="h-3 w-3" style={{ color: '#1F2937' }} />
                  </button>
                  <button onClick={() => updateQuantity(item.id, 1)} className="h-9 w-9 flex items-center justify-center rounded-lg min-h-[44px] min-w-[44px]" style={{ background: '#F8F9FB' }}>
                    <Plus className="h-3 w-3" style={{ color: '#1F2937' }} />
                  </button>
                  <button onClick={() => removeFromCart(item.id)} className="h-9 w-9 flex items-center justify-center min-h-[44px] min-w-[44px]" style={{ color: '#EF4444' }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-sm font-bold ml-1 w-16 text-right" style={{ color: '#1F2937' }}>
                    {(item.price * item.quantity - (item.discount || 0)).toLocaleString()} F
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile total + pay */}
          <div className="shrink-0 px-3 py-3 space-y-2" style={{ borderTop: '1px solid #E8EAF0', background: '#FFFFFF' }}>
            <div className="flex items-center justify-between">
              <span className="font-bold" style={{ color: '#6B7280' }}>TOTAL</span>
              <span className="font-black text-xl" style={{ color: '#4F46E5', fontFamily: 'Nunito, sans-serif' }}>{total.toLocaleString()} F</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => cart.length > 0 && setShowCashModal(true)}
                className="py-3 text-white text-xs font-bold min-h-[48px] rounded-xl" style={{ background: '#10B981' }}>
                Espèces
              </button>
              <button onClick={() => validateSale("Mobile Money")}
                className="py-3 text-white text-xs font-bold min-h-[48px] rounded-xl" style={{ background: '#F59E0B' }}>
                Mobile
              </button>
              <button onClick={() => validateSale("Carte bancaire")}
                className="py-3 text-white text-xs font-bold min-h-[48px] rounded-xl" style={{ background: '#3B82F6' }}>
                CB
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={holdTicket} className="py-2 text-xs font-medium min-h-[44px] rounded-xl" style={{ background: '#F8F9FB', color: '#6B7280' }}>
                ⏸️ En attente
              </button>
              <button onClick={() => setMobileView('products')} className="py-2 text-xs font-medium min-h-[44px] rounded-xl" style={{ background: '#F8F9FB', color: '#6B7280' }}>
                ← Produits
              </button>
            </div>
          </div>
        </>
      )}

      {renderModals()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════

function ModalOverlay({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className={`w-full ${wide ? 'max-w-md' : 'max-w-sm'} p-6 space-y-4 rounded-[20px]`}
        style={{ background: '#FFFFFF' }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ModalBtn({ label, onClick, primary, color, disabled, icon }: {
  label: string; onClick: () => void; primary?: boolean; color?: string; disabled?: boolean; icon?: React.ReactNode;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="py-2.5 rounded-xl text-sm font-semibold min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
      style={{
        background: primary ? (color || '#4F46E5') : '#F8F9FB',
        color: primary ? '#FFFFFF' : '#6B7280',
      }}>
      {icon}{label}
    </button>
  );
}

function HeaderBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} title={label}
      className="flex items-center justify-center h-9 w-9 rounded-lg text-white/70 min-h-[44px] min-w-[44px] transition-colors"
      style={{ background: 'rgba(255,255,255,0.06)' }}>
      {icon}
    </button>
  );
}

function ActionBtn({ label, icon, onClick, color }: { label: string; icon: React.ReactNode; onClick: () => void; color?: string }) {
  return (
    <button onClick={onClick}
      className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-medium min-h-[44px] transition-all active:scale-95"
      style={{ background: '#F8F9FB', color: color || '#6B7280' }}>
      {icon}
      {label}
    </button>
  );
}

function ProductCard({ product, onClick }: { product: any; onClick: () => void }) {
  const isOutOfStock = product.quantity <= 0;
  const hasImage = !!product.image_url;

  return (
    <button onClick={() => !isOutOfStock && onClick()} disabled={isOutOfStock}
      className={`relative text-left rounded-[14px] overflow-hidden transition-all active:scale-[0.97] ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''}`}
      style={{ background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #E8EAF0' }}>
      {/* Image zone */}
      <div className="h-[90px] w-full flex items-center justify-center overflow-hidden" style={{ background: '#F8F9FB' }}>
        {hasImage ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <ImageOff className="h-6 w-6" style={{ color: '#E8EAF0' }} />
            <span className="text-[9px] font-medium" style={{ color: '#6B7280' }}>Photo requise</span>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-2">
        <p className="text-xs font-bold truncate" style={{ color: '#1F2937' }}>{product.name}</p>
        <p className="text-[13px] font-extrabold mt-0.5" style={{ color: '#4F46E5' }}>{product.price.toLocaleString()} F</p>
      </div>
      {/* Badges */}
      {isOutOfStock && (
        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold text-white" style={{ background: '#EF4444' }}>
          Rupture
        </span>
      )}
      {!hasImage && !isOutOfStock && (
        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-semibold" style={{ background: '#FFF7ED', color: '#F59E0B' }}>
          Photo requise
        </span>
      )}
    </button>
  );
}
