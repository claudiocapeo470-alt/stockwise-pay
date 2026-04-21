import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDeliveries } from "@/hooks/useDeliveries";
import { useTeam } from "@/hooks/useTeam";
import { toast } from "sonner";
import { Truck, Package, CheckCircle, AlertTriangle, UserPlus } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  unassigned: { label: "Non assignée", color: "bg-muted text-muted-foreground", icon: Package },
  assigned: { label: "Assignée", color: "bg-primary/10 text-primary", icon: UserPlus },
  in_progress: { label: "En cours", color: "bg-warning/10 text-warning", icon: Truck },
  delivered: { label: "Livrée", color: "bg-success/10 text-success", icon: CheckCircle },
  problem: { label: "Problème", color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

export default function Livraisons() {
  const { deliveries, assignDriver } = useDeliveries();
  const { members } = useTeam();
  const [assignDialog, setAssignDialog] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const drivers = members.filter(m => m.role?.name === 'Livreur' && m.is_active);

  const filtered = statusFilter === 'all' ? deliveries : deliveries.filter(d => d.status === statusFilter);

  const stats = {
    assigned: deliveries.filter(d => d.status === 'assigned').length,
    in_progress: deliveries.filter(d => d.status === 'in_progress').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    problem: deliveries.filter(d => d.status === 'problem').length,
  };

  const filters = [
    { key: "all", label: "Toutes" },
    { key: "unassigned", label: "Non assignées" },
    { key: "assigned", label: "Assignées" },
    { key: "in_progress", label: "En cours" },
    { key: "delivered", label: "Livrées" },
    { key: "problem", label: "Problèmes" },
  ];

  const handleAssign = async () => {
    if (!assignDialog || !selectedDriver) return;
    try {
      await assignDriver.mutateAsync({ deliveryId: assignDialog, driverMemberId: selectedDriver });
      toast.success("Livreur assigné");
      setAssignDialog(null);
      setSelectedDriver("");
    } catch { toast.error("Erreur"); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header large */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Livraisons</h1>
          <p className="text-sm text-muted-foreground">
            {deliveries.length} commande{deliveries.length > 1 ? 's' : ''} suivie{deliveries.length > 1 ? 's' : ''} · {drivers.length} livreur{drivers.length > 1 ? 's' : ''} actif{drivers.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Assignées", value: stats.assigned, bg: "bg-primary/10", color: "text-primary", icon: UserPlus },
          { label: "En cours", value: stats.in_progress, bg: "bg-warning/10", color: "text-warning", icon: Truck },
          { label: "Livrées", value: stats.delivered, bg: "bg-success/10", color: "text-success", icon: CheckCircle },
          { label: "Problèmes", value: stats.problem, bg: "bg-destructive/10", color: "text-destructive", icon: AlertTriangle },
        ].map((s, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-10 w-10 ${s.bg} flex items-center justify-center rounded-xl`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar pills */}
      <div className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                statusFilter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table desktop */}
      <Card className="hidden md:block border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border/60">
              <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Commande</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Client</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Livreur</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Statut</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(d => {
              const st = STATUS_MAP[d.status] || STATUS_MAP.unassigned;
              return (
                <TableRow key={d.id} className="border-border/40 hover:bg-muted/20">
                  <TableCell className="font-mono text-sm py-4">{d.order?.order_number || '—'}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-foreground">{d.order?.customer_name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{d.order?.customer_address || ''}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {d.driver ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7"><AvatarImage src={d.driver.photo_url || ''} /><AvatarFallback className="text-xs">{d.driver.first_name[0]}</AvatarFallback></Avatar>
                        <span className="text-sm">{d.driver.first_name} {d.driver.last_name || ''}</span>
                      </div>
                    ) : <span className="text-muted-foreground text-sm">Non assigné</span>}
                  </TableCell>
                  <TableCell><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span></TableCell>
                  <TableCell className="text-right">
                    {(d.status === 'unassigned' || d.status === 'problem') && (
                      <Button size="sm" variant="outline" onClick={() => setAssignDialog(d.id)} className="gap-1">
                        <UserPlus className="h-3.5 w-3.5" /> Assigner
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Aucune livraison</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map(d => {
          const st = STATUS_MAP[d.status] || STATUS_MAP.unassigned;
          return (
            <Card key={d.id} className="border-border/60">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">{d.order?.order_number || '—'}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                </div>
                <p className="font-semibold">{d.order?.customer_name || '—'}</p>
                {d.driver && <p className="text-sm text-muted-foreground">🚚 {d.driver.first_name} {d.driver.last_name || ''}</p>}
                {(d.status === 'unassigned' || d.status === 'problem') && (
                  <Button size="sm" variant="outline" className="w-full gap-1" onClick={() => setAssignDialog(d.id)}>
                    <UserPlus className="h-3.5 w-3.5" /> Assigner un livreur
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Aucune livraison</p>}
      </div>

      {/* Assign dialog */}
      <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assigner un livreur</DialogTitle></DialogHeader>
          <Select value={selectedDriver} onValueChange={setSelectedDriver}>
            <SelectTrigger><SelectValue placeholder="Choisir un livreur" /></SelectTrigger>
            <SelectContent>
              {drivers.map(d => (
                <SelectItem key={d.id} value={d.id}>
                  {d.first_name} {d.last_name || ''} — {deliveries.filter(del => del.driver_member_id === d.id && ['assigned', 'in_progress'].includes(del.status)).length} en cours
                </SelectItem>
              ))}
              {drivers.length === 0 && <SelectItem value="" disabled>Aucun livreur actif</SelectItem>}
            </SelectContent>
          </Select>
          <DialogFooter><Button onClick={handleAssign} disabled={!selectedDriver}>Assigner</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
