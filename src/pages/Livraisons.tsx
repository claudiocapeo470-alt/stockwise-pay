import { useState } from "react";
import { SectionHeading, StickyTop } from "@/components/layout/PageShell";
import { FilterPills } from "@/components/layout/FilterPills";
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
import { ListShell, ListRow, ListAvatar, ListBadge, ListEmpty } from "@/components/layout/MinimalList";
import { PageActionBar } from "@/components/layout/PageActionBar";


const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  unassigned: { label: "Non assignée", color: "bg-muted text-muted-foreground", icon: Package },
  assigned: { label: "Assignée", color: "bg-primary/10 text-primary", icon: UserPlus },
  in_progress: { label: "En cours", color: "bg-warning/10 text-warning", icon: Truck },
  delivered: { label: "Livrée", color: "bg-success/10 text-success", icon: CheckCircle },
  problem: { label: "Problème", color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

function EmptyDeliveries() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <p className="font-semibold text-foreground">Aucune livraison</p>
      <p className="text-sm text-muted-foreground">Les livraisons apparaîtront ici dès qu'une commande sera prête.</p>
    </div>
  );
}

export default function Livraisons() {
  const { deliveries, assignDriver } = useDeliveries();
  const { members } = useTeam();
  const [assignDialog, setAssignDialog] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const drivers = members.filter(m => m.role?.name === 'Livreur' && m.is_active);

  const byStatus = statusFilter === 'all' ? deliveries : deliveries.filter(d => d.status === statusFilter);
  const q = search.trim().toLowerCase();
  const filtered = !q
    ? byStatus
    : byStatus.filter(d =>
        [d.order?.customer_name, d.order?.order_number, d.order?.customer_address,
         d.driver ? `${d.driver.first_name} ${d.driver.last_name || ''}` : '']
          .some(v => (v || '').toLowerCase().includes(q)),
      );


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
    <div className="space-y-5 animate-fade-in">
      <StickyTop>
        {/* 1. Recherche */}
        <PageActionBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher une livraison..."
        />

        {/* 2. Blocs KPI */}
        <div className="stat-scroller" style={{ ["--stat-cols" as any]: 4 }}>
          {[
            { label: "Assignées", value: stats.assigned, bg: "bg-primary/10", color: "text-primary", icon: UserPlus },
            { label: "En cours", value: stats.in_progress, bg: "bg-warning/10", color: "text-warning", icon: Truck },
            { label: "Livrées", value: stats.delivered, bg: "bg-success/10", color: "text-success", icon: CheckCircle },
            { label: "Problèmes", value: stats.problem, bg: "bg-destructive/10", color: "text-destructive", icon: AlertTriangle },
          ].map((s, i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className={`h-10 w-10 ${s.bg} flex items-center justify-center rounded-xl`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold leading-none truncate">{s.value}</p>
                  <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 leading-tight">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 3. Filtres */}
        <FilterPills filters={filters} value={statusFilter} onChange={setStatusFilter} />

      </StickyTop>


      <SectionHeading
        title="Détails des livraisons"
        count={filtered.length}
        className="!mt-4 !mb-3"
      />


      {/* Liste minimaliste unifiée */}
      {filtered.length === 0 ? (
        <ListEmpty
          icon={<Package className="h-6 w-6" />}
          title="Aucune livraison"
          description="Les livraisons apparaîtront ici dès qu'une commande sera prête."
        />
      ) : (
        <ListShell>
          {filtered.map(d => {
            const st = STATUS_MAP[d.status] || STATUS_MAP.unassigned;
            const Icon = st.icon;
            return (
              <ListRow
                key={d.id}
                leading={
                  d.driver ? (
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={d.driver.photo_url || ''} />
                      <AvatarFallback className="text-xs">{d.driver.first_name[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <ListAvatar icon={<Icon className="h-5 w-5" />} tone="primary" />
                  )
                }
                title={d.order?.customer_name || d.order?.order_number || '—'}
                badge={<ListBadge className={st.color}>{st.label}</ListBadge>}
                subtitle={`${d.order?.order_number || '—'}${d.order?.customer_address ? ` · ${d.order.customer_address}` : ''}`}
                meta={d.driver ? `${d.driver.first_name} ${d.driver.last_name || ''}` : 'Non assigné'}
                actions={
                  (d.status === 'unassigned' || d.status === 'problem') ? (
                    <Button size="sm" variant="outline" onClick={() => setAssignDialog(d.id)} className="h-9 rounded-xl gap-1.5">
                      <UserPlus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Assigner</span>
                    </Button>
                  ) : undefined
                }
              />
            );
          })}
        </ListShell>
      )}

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
