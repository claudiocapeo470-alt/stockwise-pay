import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bell, Mail, Send, Users } from "lucide-react";
import { toast } from "sonner";

export default function AdminNotifications() {
  const [notificationType, setNotificationType] = useState<'all' | 'subscribed' | 'specific'>('all');
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [specificEmail, setSpecificEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendNotification = async () => {
    if (!subject || !message) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (notificationType === 'specific' && !specificEmail) {
      toast.error("Veuillez spécifier un email");
      return;
    }

    setSending(true);

    try {
      // Cette fonctionnalité nécessite une edge function pour envoyer des emails
      toast.info("Fonctionnalité en cours de développement", {
        description: "L'envoi de notifications nécessite la configuration d'une edge function avec Resend"
      });
      
      // Simuler un délai
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Réinitialiser le formulaire
      setSubject("");
      setMessage("");
      setSpecificEmail("");
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications & Annonces</h1>
        <p className="text-muted-foreground mt-2">
          Envoyez des notifications et annonces à vos utilisateurs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Envoyer une Annonce
            </CardTitle>
            <CardDescription>
              Créez et envoyez des messages à vos utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Destinataires</Label>
              <RadioGroup value={notificationType} onValueChange={(value: any) => setNotificationType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="cursor-pointer">
                    Tous les utilisateurs
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="subscribed" id="subscribed" />
                  <Label htmlFor="subscribed" className="cursor-pointer">
                    Uniquement les abonnés
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="specific" />
                  <Label htmlFor="specific" className="cursor-pointer">
                    Email spécifique
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {notificationType === 'specific' && (
              <div className="space-y-2">
                <Label htmlFor="specificEmail">Email destinataire</Label>
                <Input
                  id="specificEmail"
                  type="email"
                  placeholder="utilisateur@example.com"
                  value={specificEmail}
                  onChange={(e) => setSpecificEmail(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="subject">Objet</Label>
              <Input
                id="subject"
                placeholder="Titre de votre annonce"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Écrivez votre message ici..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
            </div>

            <Button 
              onClick={handleSendNotification} 
              disabled={sending}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              {sending ? "Envoi en cours..." : "Envoyer la notification"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-600" />
                Types de Notifications
              </CardTitle>
              <CardDescription>
                Différentes façons de communiquer avec vos utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  Email de masse
                </h3>
                <p className="text-sm text-muted-foreground">
                  Envoyez des emails personnalisés à tous vos utilisateurs ou à des segments spécifiques
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Bell className="h-4 w-4" />
                  Notifications push
                </h3>
                <p className="text-sm text-muted-foreground">
                  Alertes instantanées dans l'application pour les annonces importantes
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  Annonces ciblées
                </h3>
                <p className="text-sm text-muted-foreground">
                  Messages spécifiques pour des groupes d'utilisateurs (abonnés, nouveaux, etc.)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historique des Envois</CardTitle>
              <CardDescription>
                Fonctionnalité à venir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>L'historique des notifications sera disponible prochainement</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
