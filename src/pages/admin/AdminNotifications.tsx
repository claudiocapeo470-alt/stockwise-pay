import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useSendMassEmail } from "@/hooks/useAdmin";

export default function AdminNotifications() {
  const [type, setType] = useState<'all' | 'subscribed' | 'specific'>('all');
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const sendMutation = useSendMassEmail();

  const handleSend = () => {
    if (!subject || !message) return toast.error("Remplir tous les champs");
    sendMutation.mutate(
      { subject, message, notificationType: type, specificEmail: email },
      {
        onSuccess: () => {
          setSubject("");
          setMessage("");
          setEmail("");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Notifications & Annonces</h1>

      <Card>
        <CardHeader><CardTitle>Envoyer une Notification</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Destinataires</Label>
            <RadioGroup value={type} onValueChange={(v: any) => setType(v)}>
              <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="all" /><Label htmlFor="all">Tous</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="subscribed" id="subscribed" /><Label htmlFor="subscribed">Abonnés</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="specific" id="specific" /><Label htmlFor="specific">Email spécifique</Label></div>
            </RadioGroup>
          </div>
          {type === 'specific' && <Input placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />}
          <Input placeholder="Objet" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} />
          <Button onClick={handleSend} disabled={sendMutation.isPending}>
            {sendMutation.isPending ? "Envoi..." : "Envoyer"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
