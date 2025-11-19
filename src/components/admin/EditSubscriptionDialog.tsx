import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: {
    id: string;
    email: string;
    subscribed: boolean;
    subscription_end: string | null;
    amount: number;
  };
  onSuccess: () => void;
}

export function EditSubscriptionDialog({ open, onOpenChange, subscription, onSuccess }: EditSubscriptionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subscribed: subscription.subscribed,
    subscriptionEnd: subscription.subscription_end ? new Date(subscription.subscription_end).toISOString().split('T')[0] : "",
    amount: subscription.amount,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-update-subscription', {
        body: {
          subscriptionId: subscription.id,
          subscribed: formData.subscribed,
          subscriptionEnd: formData.subscriptionEnd ? new Date(formData.subscriptionEnd).toISOString() : null,
          amount: formData.amount,
        }
      });

      if (error) throw error;

      toast.success("Abonnement mis à jour avec succès");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const extendSubscription = (months: number) => {
    const currentEnd = formData.subscriptionEnd ? new Date(formData.subscriptionEnd) : new Date();
    currentEnd.setMonth(currentEnd.getMonth() + months);
    setFormData({ ...formData, subscriptionEnd: currentEnd.toISOString().split('T')[0] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'abonnement</DialogTitle>
          <DialogDescription>
            Modifiez l'abonnement de {subscription.email}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="subscribed">Abonnement actif</Label>
            <Switch
              id="subscribed"
              checked={formData.subscribed}
              onCheckedChange={(checked) => setFormData({ ...formData, subscribed: checked })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subscriptionEnd">Date d'expiration</Label>
            <Input
              id="subscriptionEnd"
              type="date"
              value={formData.subscriptionEnd}
              onChange={(e) => setFormData({ ...formData, subscriptionEnd: e.target.value })}
            />
            <div className="flex gap-2 mt-2">
              <Button type="button" size="sm" variant="outline" onClick={() => extendSubscription(1)}>
                +1 mois
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => extendSubscription(3)}>
                +3 mois
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => extendSubscription(12)}>
                +1 an
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Montant (XOF)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
              min="0"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
