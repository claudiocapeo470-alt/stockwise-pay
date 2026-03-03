import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOnlineStore, useStoreReviews } from "@/hooks/useOnlineStore";
import { toast } from "sonner";
import { Star, Check, X, Trash2 } from "lucide-react";

export default function StoreReviews() {
  const { store } = useOnlineStore();
  const { reviews, toggleApproval, deleteReview } = useStoreReviews(store?.id);

  const handleApprove = async (id: string, approved: boolean) => {
    try { await toggleApproval.mutateAsync({ reviewId: id, approved }); toast.success(approved ? "Avis approuvé" : "Avis masqué"); } catch { toast.error("Erreur"); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteReview.mutateAsync(id); toast.success("Avis supprimé"); } catch { toast.error("Erreur"); }
  };

  if (!store) return <div className="text-center py-16"><p className="text-muted-foreground">Configurez d'abord votre boutique</p></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">⭐ Avis clients</h1>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.customer_name}</TableCell>
                <TableCell><div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className={`h-4 w-4 ${i <= r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />)}</div></TableCell>
                <TableCell className="max-w-xs truncate">{r.comment || '—'}</TableCell>
                <TableCell><Badge variant={r.is_approved ? "default" : "secondary"}>{r.is_approved ? "Approuvé" : "En attente"}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleApprove(r.id, !r.is_approved)}>{r.is_approved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}</Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {reviews.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun avis</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
