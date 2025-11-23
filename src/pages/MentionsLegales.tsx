import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function MentionsLegales() {
  const navigate = useNavigate();

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
        <div className="container mx-auto text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold">
            Mentions <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Légales</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Informations légales et conditions d'utilisation de Stocknix
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl space-y-8">
          
          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4">1. Éditeur du Site</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Le site <strong className="text-foreground">stocknix.space</strong> est édité par <strong className="text-foreground">DESCHNIX</strong>, 
                société spécialisée dans le développement de solutions logicielles SaaS pour la gestion commerciale et d'inventaire.
              </p>
              <p>
                <strong className="text-foreground">Raison sociale :</strong> DESCHNIX
              </p>
              <p>
                <strong className="text-foreground">Directeur de la publication :</strong> Ulrich Deschamp KOSSONOU
              </p>
              <p>
                <strong className="text-foreground">Siège social :</strong> Côte d'Ivoire
              </p>
              <p>
                <strong className="text-foreground">Email :</strong> support@stocknix.space
              </p>
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4">2. Hébergement</h2>
            <p className="text-muted-foreground leading-relaxed">
              Le site est hébergé par <strong className="text-foreground">Lovable</strong>, plateforme cloud spécialisée dans l'hébergement d'applications web modernes.
            </p>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4">3. Propriété Intellectuelle</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                L'ensemble des contenus présents sur le site <strong className="text-foreground">stocknix.space</strong> (textes, images, logos, graphismes, interface, code source, etc.) 
                est la propriété exclusive de <strong className="text-foreground">DESCHNIX</strong>, sauf mention contraire.
              </p>
              <p>
                Le nom <strong className="text-foreground">STOCKNIX</strong>, le logo avec les chevrons orientés vers le bas et le check blanc, 
                ainsi que l'identité visuelle complète sont des marques déposées de DESCHNIX.
              </p>
              <p>
                Toute reproduction, distribution, modification, exploitation commerciale ou utilisation sans autorisation écrite préalable est strictement interdite 
                et constitue une contrefaçon sanctionnée par les lois en vigueur en Côte d'Ivoire et les conventions internationales.
              </p>
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4">4. Données Personnelles (RGPD)</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                DESCHNIX s'engage à protéger vos données personnelles conformément aux réglementations en vigueur en Côte d'Ivoire 
                et aux principes du RGPD (Règlement Général sur la Protection des Données).
              </p>
              <p>
                Les données collectées via <strong className="text-foreground">Stocknix</strong> sont utilisées uniquement pour :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>La gestion de votre compte utilisateur</li>
                <li>L'amélioration de nos services</li>
                <li>L'envoi de notifications relatives à votre abonnement</li>
                <li>Le support technique</li>
              </ul>
              <p>
                Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. 
                Pour exercer ces droits, contactez-nous à : <strong className="text-foreground">support@stocknix.space</strong>
              </p>
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4">5. Cookies et Traceurs</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Le site <strong className="text-foreground">stocknix.space</strong> utilise des cookies pour améliorer l'expérience utilisateur, 
                analyser le trafic et personnaliser le contenu.
              </p>
              <p>
                Types de cookies utilisés :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cookies essentiels (authentification, session)</li>
                <li>Cookies de performance (analyse du trafic)</li>
                <li>Cookies fonctionnels (préférences utilisateur)</li>
              </ul>
              <p>
                Vous pouvez configurer votre navigateur pour refuser les cookies non essentiels. 
                En poursuivant votre navigation, vous acceptez l'utilisation de ces cookies.
              </p>
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4">6. Responsabilité et Limitations</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                DESCHNIX met tout en œuvre pour assurer la fiabilité, la sécurité et la disponibilité permanente du service <strong className="text-foreground">Stocknix</strong>.
              </p>
              <p>
                Cependant, DESCHNIX ne peut être tenu responsable :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Des interruptions temporaires du service pour maintenance ou raisons techniques</li>
                <li>Des erreurs ou pertes de données résultant d'une utilisation inappropriée</li>
                <li>Des dommages indirects liés à l'utilisation du logiciel</li>
                <li>Des problèmes de connexion internet de l'utilisateur</li>
              </ul>
              <p>
                L'utilisateur est seul responsable de la sauvegarde régulière de ses données et de la sécurité de ses identifiants de connexion.
              </p>
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4">7. Conditions d'Utilisation</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                En utilisant <strong className="text-foreground">Stocknix</strong>, vous acceptez de :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Utiliser le service conformément aux lois en vigueur</li>
                <li>Ne pas tenter de pirater, détourner ou perturber le service</li>
                <li>Ne pas partager vos identifiants de connexion</li>
                <li>Respecter les droits de propriété intellectuelle</li>
                <li>Fournir des informations exactes lors de votre inscription</li>
              </ul>
              <p>
                Toute utilisation abusive ou frauduleuse peut entraîner la suspension immédiate du compte sans préavis ni remboursement.
              </p>
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4">8. Modifications des Mentions Légales</h2>
            <p className="text-muted-foreground leading-relaxed">
              DESCHNIX se réserve le droit de modifier ces mentions légales à tout moment. 
              Les modifications entrent en vigueur dès leur publication sur le site. 
              Il est recommandé de consulter régulièrement cette page.
            </p>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-4">9. Droit Applicable et Juridiction</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Les présentes mentions légales sont régies par le droit ivoirien.
              </p>
              <p>
                En cas de litige, et après tentative de résolution amiable, 
                les tribunaux compétents de Côte d'Ivoire seront seuls compétents.
              </p>
            </div>
          </Card>

          <Card className="p-6 sm:p-8 bg-muted/30">
            <h2 className="text-2xl font-bold mb-4">Contact</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                Pour toute question concernant ces mentions légales, contactez-nous :
              </p>
              <p className="font-semibold text-foreground">
                Email : support@stocknix.space
              </p>
              <p className="font-semibold text-foreground">
                Site : <a href="https://stocknix.space" className="text-primary hover:underline">https://stocknix.space</a>
              </p>
            </div>
          </Card>

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
