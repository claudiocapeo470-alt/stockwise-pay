import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeliveries, Delivery } from "@/hooks/useDeliveries";
import { useAuth } from "@/contexts/AuthContext";
import { useAutoLock } from "@/hooks/useAutoLock";
import { LockScreen } from "@/components/auth/LockScreen";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Truck, Package, CheckCircle, AlertTriangle, Clock, MapPin, Phone, User, Lock, LogOut } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  assigned: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  problem: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  assigned: "En attente",
  in_progress: "En cours",
  delivered: "Livrée",
  problem: "Problème",
};

export default function LivreurDashboard() {
  const { signOut, memberInfo } = useAuth();
  const memberId = memberInfo?.member_id;
  const { deliveries, updateStatus } = useDeliveries(memberId);
  const [tab, setTab] = useState<'today' | 'history' | 'profile'>('today');
  const [problemDialog, setProblemDialog] = useState<string | null>(null);
  const [problemReason, setProblemReason] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  const handleLock = useCallback(() => setIsLocked(true), []);
  useAutoLock(handleLock);

  const handleUnlock = async (pin: string): Promise<boolean> => {
    if (!memberInfo) return false;
    try {
      const { data } = await supabase.rpc('verify_member_pin', {
        _member_id: memberInfo.member_id,
        _pin: pin,
      });
      if (data === true) {
        setIsLocked(false);
        return true;
      }
    } catch {}
    return false;
  };

  const today = new Date().toDateString();
  const todayDeliveries = deliveries.filter(d => new Date(d.created_at).toDateString() === today && d.status !== 'delivered');
  const historyDeliveries = deliveries.filter(d => d.status === 'delivered' || new Date(d.created_at).toDateString() !== today);

  const handleStart = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ deliveryId: id, status: 'in_progress' });
      toast.success("Livraison démarrée");
    } catch { toast.error("Erreur"); }
  };

  const handleDeliver = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ deliveryId: id, status: 'delivered' });
      toast.success("Livraison effectuée !");
    } catch { toast.error("Erreur"); }
  };

  const handleProblem = async () => {
    if (!problemDialog) return;
    try {
      await updateStatus.mutateAsync({ deliveryId: problemDialog, status: 'problem', problemReason });
      toast.success("Problème signalé");
      setProblemDialog(null);
      setProblemReason("");
    } catch { toast.error("Erreur"); }
  };

  // Lock screen overlay
  if (isLocked && memberInfo) {
    return (
      <LockScreen
        memberName={`${memberInfo.member_first_name} ${memberInfo.member_last_name || ''}`}
        companyName={memberInfo.company_name}
        companyLogo={memberInfo.company_logo_url || undefined}
        onUnlock={handleUnlock}
      />
    );
  }

  const renderDeliveryCard = (d: Delivery, showActions: boolean) => (
    <Card key={d.id} className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold">{d.order?.order_number || '—'}</span>
          <Badge className={STATUS_COLORS[d.status] || ''}>{STATUS_LABELS[d.status] || d.status}</Badge>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{d.order?.customer_name}</div>
          {d.order?.customer_address && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{d.order.customer_address}</div>}
          <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{d.order?.customer_phone}</div>
        </div>
        {d.order?.items && (
          <div className="bg-muted rounded-lg p-2 text-sm space-y-1">
            {(Array.isArray(d.order.items) ? d.order.items : []).map((item: any, i: number) => (
              <div key={i} className="flex justify-between">
                <span>{item.icon || '📦'} {item.name} ×{item.quantity}</span>
                <span className="font-medium">{((item.price || 0) * (item.quantity || 1)).toLocaleString()} F</span>
              </div>
            ))}
            <div className="border-t pt-1 font-bold flex justify-between">
              <span>Total</span><span>{(d.order?.total || 0).toLocaleString()} FCFA</span>
            </div>
          </div>
        )}
        {showActions && d.status === 'assigned' && (
          <div className="flex gap-2">
            <Button className="flex-1 gap-1" onClick={() => handleStart(d.id)}><Truck className="h-4 w-4" /> Démarrer</Button>
            <Button variant="destructive" size="icon" onClick={() => setProblemDialog(d.id)}><AlertTriangle className="h-4 w-4" /></Button>
          </div>
        )}
        {showActions && d.status === 'in_progress' && (
          <div className="flex gap-2">
            <Button className="flex-1 gap-1 bg-green-600 hover:bg-green-700" onClick={() => handleDeliver(d.id)}><CheckCircle className="h-4 w-4" /> Livrée</Button>
            <Button variant="destructive" size="icon" onClick={() => setProblemDialog(d.id)}><AlertTriangle className="h-4 w-4" /></Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Mes livraisons</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleLock} className="text-muted-foreground" title="Verrouiller">
            <Lock className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{memberInfo?.member_first_name || 'Livreur'}</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 pb-20 space-y-3">
        {tab === 'today' && (
          <>
            <h2 className="font-bold text-lg flex items-center gap-2"><Clock className="h-5 w-5" /> Aujourd'hui ({todayDeliveries.length})</h2>
            {todayDeliveries.length === 0 && <p className="text-center text-muted-foreground py-12">Aucune livraison assignée pour aujourd'hui</p>}
            {todayDeliveries.map(d => renderDeliveryCard(d, true))}
          </>
        )}
        {tab === 'history' && (
          <>
            <h2 className="font-bold text-lg">Historique</h2>
            {historyDeliveries.length === 0 && <p className="text-center text-muted-foreground py-12">Aucune livraison passée</p>}
            {historyDeliveries.map(d => renderDeliveryCard(d, false))}
          </>
        )}
        {tab === 'profile' && (
          <div className="space-y-4 pt-8">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <User className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{memberInfo?.member_first_name} {memberInfo?.member_last_name || ''}</h2>
              <p className="text-muted-foreground">{memberInfo?.member_role_name || 'Livreur'}</p>
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full gap-2" onClick={signOut}><LogOut className="h-4 w-4" /> Déconnexion</Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom tabs */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t flex h-16 z-50">
        {[
          { key: 'today' as const, label: "Aujourd'hui", icon: Clock },
          { key: 'history' as const, label: 'Historique', icon: Package },
          { key: 'profile' as const, label: 'Profil', icon: User },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${tab === t.key ? 'text-primary' : 'text-muted-foreground'}`}>
            <t.icon className="h-5 w-5" />
            <span className="text-[10px]">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Problem dialog */}
      <Dialog open={!!problemDialog} onOpenChange={() => setProblemDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Signaler un problème</DialogTitle></DialogHeader>
          <div><Label>Motif</Label><Input value={problemReason} onChange={e => setProblemReason(e.target.value)} placeholder="Client absent, adresse incorrecte..." /></div>
          <DialogFooter><Button variant="destructive" onClick={handleProblem} disabled={!problemReason.trim()}>Signaler</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
