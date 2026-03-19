import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function FAQ() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      category: "Général",
      questions: [
        {
          q: "Qu'est-ce que Stocknix ?",
          a: "Stocknix est un logiciel SaaS complet de gestion de stock, caisse, facturation, paiements et analytics conçu pour les PME, TPE, boutiques et supermarchés en Côte d'Ivoire."
        },
        {
          q: "Qui peut utiliser Stocknix ?",
          a: "Stocknix est idéal pour les boutiques, magasins, supermarchés, pharmacies, commerces électroniques, grossistes et toute PME/TPE ayant besoin de gérer son stock et ses ventes."
        },
        {
          q: "Stocknix fonctionne-t-il hors ligne ?",
          a: "Stocknix nécessite une connexion internet pour synchroniser les données en temps réel et garantir la sécurité de vos informations."
        }
      ]
    },
    {
      category: "Tarifs & Paiement",
      questions: [
        {
          q: "Combien coûte Stocknix ?",
          a: "Nous proposons un plan Gratuit pour démarrer, un plan Business à 25.000 XOF/mois et un plan PRO à 50.000 XOF/mois avec toutes les fonctionnalités avancées."
        },
        {
          q: "Quels moyens de paiement acceptez-vous ?",
          a: "Nous acceptons Mobile Money (Orange, MTN, Moov), cartes bancaires et virements bancaires en Francs CFA (XOF)."
        },
        {
          q: "Puis-je essayer avant de payer ?",
          a: "Oui ! Le plan Starter est gratuit et le plan Business offre 14 jours d'essai gratuit sans carte bancaire requise."
        },
        {
          q: "Y a-t-il des frais cachés ?",
          a: "Non, nos tarifs sont transparents. Vous ne payez que l'abonnement mensuel affiché, sans frais cachés."
        }
      ]
    },
    {
      category: "Fonctionnalités",
      questions: [
        {
          q: "Comment fonctionne la gestion de stock ?",
          a: "Stocknix suit votre inventaire en temps réel, vous alerte des stocks bas, permet d'importer/exporter vos produits et de scanner les code-barres pour un ajout rapide."
        },
        {
          q: "Puis-je créer des factures ?",
          a: "Oui, vous pouvez créer des factures et devis professionnels personnalisés avec votre logo et les exporter en PDF."
        },
        {
          q: "Le scanner code-barres fonctionne-t-il avec ma caméra ?",
          a: "Oui, Stocknix utilise la caméra de votre appareil pour scanner les code-barres. Vous pouvez aussi utiliser un lecteur code-barres USB."
        },
        {
          q: "Puis-je gérer plusieurs utilisateurs ?",
          a: "Oui, selon votre plan vous pouvez ajouter plusieurs utilisateurs avec des permissions personnalisées."
        },
        {
          q: "Les rapports analytics sont-ils disponibles ?",
          a: "Oui, Stocknix génère des rapports détaillés avec graphiques interactifs, prévisions intelligentes et analyses de performance."
        }
      ]
    },
    {
      category: "Technique",
      questions: [
        {
          q: "Sur quels appareils Stocknix fonctionne-t-il ?",
          a: "Stocknix est une application web accessible depuis n'importe quel navigateur : PC, Mac, tablettes et smartphones."
        },
        {
          q: "Mes données sont-elles sécurisées ?",
          a: "Oui, toutes vos données sont chiffrées et sauvegardées quotidiennement sur des serveurs sécurisés. Nous respectons les normes de sécurité internationales."
        },
        {
          q: "Puis-je exporter mes données ?",
          a: "Oui, vous pouvez exporter toutes vos données (produits, ventes, clients) en Excel, CSV ou PDF à tout moment."
        },
        {
          q: "Proposez-vous une API ?",
          a: "Oui, le plan PRO inclut un accès complet à notre API pour intégrer Stocknix avec vos autres outils."
        }
      ]
    },
    {
      category: "Support",
      questions: [
        {
          q: "Comment contacter le support ?",
          a: "Vous pouvez nous contacter par email à support@www.stocknix.com ou par téléphone. Le support prioritaire est disponible pour les plans payants."
        },
        {
          q: "Y a-t-il une formation disponible ?",
          a: "Oui, nous proposons des tutoriels vidéo, une documentation complète et une formation personnalisée pour le plan PRO."
        },
        {
          q: "Le support est-il en français ?",
          a: "Oui, tout notre support est en français et assuré par une équipe basée en Côte d'Ivoire."
        },
        {
          q: "Quel est le délai de réponse du support ?",
          a: "Plan Gratuit : 48h, Plan Business : 24h, Plan PRO : support 24/7 avec réponse sous 4h."
        }
      ]
    },
    {
      category: "Migration & Démarrage",
      questions: [
        {
          q: "Comment migrer depuis mon ancien système ?",
          a: "Nous proposons un import Excel/CSV de vos produits existants. Pour les plans Business et PRO, notre équipe peut vous accompagner dans la migration."
        },
        {
          q: "Combien de temps faut-il pour démarrer ?",
          a: "Vous pouvez commencer à utiliser Stocknix en moins de 10 minutes après votre inscription."
        },
        {
          q: "Puis-je annuler mon abonnement ?",
          a: "Oui, vous pouvez annuler votre abonnement à tout moment depuis vos paramètres, sans frais d'annulation."
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq =>
        faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <nav className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Retour
            </Button>
            <Button onClick={() => navigate('/auth')}>
              Connexion
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6">
        <div className="container mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold">
            Questions <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Fréquentes</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trouvez rapidement les réponses à vos questions
          </p>
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher une question..."
                className="pl-10 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          {filteredFaqs.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Aucune question ne correspond à votre recherche.</p>
            </Card>
          ) : (
            <div className="space-y-12">
              {filteredFaqs.map((category, catIndex) => (
                <div key={catIndex} className="space-y-6">
                  <h2 className="text-2xl font-bold text-primary">{category.category}</h2>
                  <div className="space-y-4">
                    {category.questions.map((faq, faqIndex) => (
                      <Card key={faqIndex} className="p-6 hover:shadow-lg transition-all">
                        <h3 className="font-semibold text-lg mb-3">{faq.q}</h3>
                        <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-muted-foreground">
            Notre équipe est là pour vous aider
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="outline">
              support@www.stocknix.com
            </Button>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-accent"
              onClick={() => navigate('/auth')}
            >
              Essayer Stocknix
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 Stocknix par DESCHNIX. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
