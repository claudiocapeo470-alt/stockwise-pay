import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOnlineStore, useStoreReviews } from "@/hooks/useOnlineStore";
import { toast } from "sonner";
import { Star, Check, X, Trash2 } from "lucide-react";

export default function StoreReviews() {
  const { store } = useOnlineStore();
  const { reviews, toggleApproval, deleteReview } = useStoreReviews(store?.id);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const handleApprove = async (id: string, approved: boolean) => {
    try { await toggleApproval.mutateAsync({ reviewId: id, approved }); toast.success(approved ? "Avis approuvé" : "Avis masqué"); } catch { toast.error("Erreur"); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteReview.mutateAsync(id); toast.success("Avis supprimé"); } catch { toast.error("Erreur"); }
  };

  const toggleExpand = (id: string) => {
    setExpandedReviews(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  if (!store) return <div className="text-center py-16"><p className="text-muted-foreground">Configurez d'abord votre boutique</p></div>;

  const Stars = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => <Star key={i} className={`h-4 w-4 ${i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">⭐ Avis clients</h1>

      {/* Desktop table */}
      <Card className="hidden md:block">
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
                <TableCell><Stars rating={r.rating} /></TableCell>
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

      {/* Mobile cards */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
        {reviews.map((r: any) => {
          const isExpanded = expandedReviews.has(r.id);
          const comment = r.comment || '';
          const isTruncatable = comment.length > 80;
          return (
            <Card key={r.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{r.customer_name}</p>
                  <Badge variant={r.is_approved ? "default" : "secondary"} className="text-xs">
                    {r.is_approved ? "Approuvé" : "En attente"}
                  </Badge>
                </div>
                <Stars rating={r.rating} />
                {comment && (
                  <div>
                    <p className={`text-sm text-muted-foreground ${!isExpanded && isTruncatable ? 'line-clamp-2' : ''}`}>
                      {comment}
                    </p>
                    {isTruncatable && (
                      <button onClick={() => toggleExpand(r.id)} className="text-xs text-primary mt-1">
                        {isExpanded ? 'Voir moins' : 'Voir plus'}
                      </button>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => handleApprove(r.id, !r.is_approved)}>
                    {r.is_approved ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                    {r.is_approved ? "Masquer" : "Approuver"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {reviews.length === 0 && <p className="text-center py-8 text-muted-foreground col-span-full">Aucun avis</p>}
      </div>
    </div>
  );
}
