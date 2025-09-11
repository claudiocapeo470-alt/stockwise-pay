import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MentionsLegales() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Mentions Légales</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Informations sur l'éditeur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Dénomination sociale</h3>
                <p>RICH MIND</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Activité</h3>
                <p>Édition et fourniture de logiciel de gestion d'entreprise (SaaS)</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Adresse de contact</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:support@ulrichdeschampkossonou.com" className="text-primary hover:underline">
                    support@ulrichdeschampkossonou.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+2250710224023" className="text-primary hover:underline">
                    +225 07 10 22 40 23
                  </a>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Directeur de publication</h3>
                <p>RICH MIND</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Hébergement</h3>
                <p>Nom de l'hébergeur : GestionPro<br />
                Site web de l'hébergeur : gestionpro.space</p>
              </div>
            </CardContent>
          </Card>

          {/* Conditions d'utilisation */}
          <Card>
            <CardHeader>
              <CardTitle>Conditions d'utilisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Objet</h3>
                <p>
                  GestionPro est une solution SaaS (Software as a Service) de gestion d'entreprise 
                  permettant aux PME de gérer leurs stocks, ventes, paiements et générer des rapports. 
                  L'utilisation de ce service implique l'acceptation pleine et entière des présentes 
                  conditions générales d'utilisation.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Accès au service</h3>
                <p>
                  L'accès au service est réservé aux utilisateurs disposant d'un compte valide. 
                  L'utilisateur s'engage à fournir des informations exactes lors de son inscription 
                  et à maintenir la confidentialité de ses identifiants de connexion.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Utilisation du service</h3>
                <p>
                  L'utilisateur s'engage à utiliser le service dans le respect des lois en vigueur 
                  et des présentes conditions. Il est interdit d'utiliser le service à des fins 
                  illégales ou de porter atteinte aux droits de tiers.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitation de responsabilité */}
          <Card>
            <CardHeader>
              <CardTitle>Limitation de responsabilité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Disponibilité du service</h3>
                <p>
                  RICH MIND s'efforce d'assurer une disponibilité continue du service, mais ne peut 
                  garantir un accès ininterrompu. La responsabilité de RICH MIND ne saurait être 
                  engagée en cas d'interruption temporaire du service pour maintenance, mise à jour 
                  ou défaillance technique.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Utilisation des données</h3>
                <p>
                  L'utilisateur reste responsable de l'exactitude des données qu'il saisit dans 
                  l'application. RICH MIND ne peut être tenu responsable des erreurs de gestion 
                  résultant de données incorrectes saisies par l'utilisateur.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Limitation de responsabilité</h3>
                <p>
                  En aucun cas, RICH MIND ne pourra être tenu responsable des dommages directs ou 
                  indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le service, 
                  y compris la perte de données, de profits ou d'opportunités commerciales.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Propriété intellectuelle */}
          <Card>
            <CardHeader>
              <CardTitle>Propriété intellectuelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Droits de RICH MIND</h3>
                <p>
                  Tous les éléments de l'application GestionPro (textes, images, logos, marques, 
                  structure, design, etc.) sont protégés par les droits de propriété intellectuelle 
                  et appartiennent exclusivement à RICH MIND ou à ses partenaires.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Licence d'utilisation</h3>
                <p>
                  RICH MIND concède à l'utilisateur une licence d'utilisation non exclusive, 
                  non cessible et révocable du service, strictement limitée aux besoins de 
                  gestion de son entreprise.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Interdictions</h3>
                <p>
                  Il est strictement interdit de reproduire, représenter, modifier, adapter, 
                  distribuer ou commercialiser tout ou partie de l'application sans autorisation 
                  expresse de RICH MIND.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Données utilisateur</h3>
                <p>
                  L'utilisateur conserve tous les droits sur les données qu'il saisit dans 
                  l'application. RICH MIND s'engage à ne pas exploiter ces données à des fins 
                  commerciales et à en assurer la confidentialité.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Protection des données personnelles */}
          <Card>
            <CardHeader>
              <CardTitle>Protection des données personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Collecte des données</h3>
                <p>
                  RICH MIND collecte et traite les données personnelles nécessaires au 
                  fonctionnement du service : informations de compte, données d'utilisation, 
                  et données saisies par l'utilisateur dans le cadre de la gestion de son entreprise.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Finalités du traitement</h3>
                <p>
                  Les données personnelles sont traitées pour : la création et gestion des comptes 
                  utilisateurs, la fourniture du service de gestion d'entreprise, l'amélioration 
                  du service, et le support technique.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Base légale</h3>
                <p>
                  Le traitement des données personnelles est fondé sur l'exécution du contrat 
                  de service et l'intérêt légitime de RICH MIND à fournir et améliorer ses services.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Droits des utilisateurs</h3>
                <p>
                  Conformément à la réglementation en vigueur, l'utilisateur dispose des droits 
                  d'accès, de rectification, d'effacement, de portabilité et d'opposition concernant 
                  ses données personnelles. Pour exercer ces droits, contacter : 
                  support@ulrichdeschampkossonou.com
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Conservation des données</h3>
                <p>
                  Les données personnelles sont conservées pendant la durée nécessaire aux 
                  finalités pour lesquelles elles sont traitées, et au maximum 3 ans après 
                  la fermeture du compte utilisateur.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Sécurité</h3>
                <p>
                  RICH MIND met en œuvre des mesures techniques et organisationnelles appropriées 
                  pour assurer la sécurité des données personnelles et prévenir leur divulgation 
                  non autorisée.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies et technologies similaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Utilisation des cookies</h3>
                <p>
                  L'application utilise des cookies techniques nécessaires au fonctionnement 
                  du service (authentification, préférences utilisateur) et des cookies 
                  d'analyse pour améliorer l'expérience utilisateur.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Gestion des cookies</h3>
                <p>
                  L'utilisateur peut configurer son navigateur pour refuser les cookies, 
                  mais cela peut affecter le fonctionnement de l'application.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Droit applicable */}
          <Card>
            <CardHeader>
              <CardTitle>Droit applicable et juridiction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Droit applicable</h3>
                <p>
                  Les présentes mentions légales et conditions d'utilisation sont régies 
                  par le droit ivoirien.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Résolution des litiges</h3>
                <p>
                  En cas de litige, les parties s'efforceront de trouver une solution amiable. 
                  À défaut, les tribunaux compétents de Côte d'Ivoire seront seuls compétents.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Pour toute question concernant ces mentions légales ou l'utilisation du service :
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:support@ulrichdeschampkossonou.com" className="text-primary hover:underline">
                    support@ulrichdeschampkossonou.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+2250710224023" className="text-primary hover:underline">
                    +225 07 10 22 40 23
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}