import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegales() {
  return (
    <LegalPage
      eyebrow="Informations"
      title="Mentions *légales.*"
      updated="25 octobre 2026"
      sections={[
        {
          id: "editeur",
          title: "Éditeur du site",
          body: (
            <>
              <p>
                Le site <strong>Unamed Canapé.</strong> est édité dans le cadre d&apos;un projet étudiant par{" "}
                <strong>Robin Machard</strong> et <strong>Marc</strong>.
              </p>
              <p>Directeur de la publication : Robin Machard. Contact : contact@unamedcanape.fr (adresse de démonstration).</p>
            </>
          ),
        },
        {
          id: "hebergement",
          title: "Hébergement",
          body: (
            <>
              <p>
                Site hébergé par <strong>Vercel Inc.</strong>, 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis —
                vercel.com.
              </p>
              <p>
                Base de données et authentification : <strong>Supabase Inc.</strong>, San Francisco, États-Unis —
                supabase.com.
              </p>
            </>
          ),
        },
        {
          id: "propriete",
          title: "Propriété intellectuelle",
          body: (
            <>
              <p>
                Le nom, le logo, les textes et la mise en page du site sont la propriété de leurs auteurs. Toute reproduction
                sans autorisation est interdite.
              </p>
              <p>
                Les photographies des produits proviennent des fiches de nos fournisseurs et sont utilisées à des fins
                pédagogiques d&apos;illustration.
              </p>
            </>
          ),
        },
        {
          id: "donnees",
          title: "Données personnelles",
          body: (
            <>
              <p>
                Nous collectons uniquement les données nécessaires au service : identité et e-mail (compte client),
                adresses de livraison, commandes, contenu du panier, inscriptions à la lettre d&apos;information,
                pages produits consultées et échanges avec le Concierge.
              </p>
              <p>
                Ces données sont protégées par des règles d&apos;accès en base : chaque client ne voit que ses propres
                informations ; seule l&apos;administration du site accède aux statistiques globales.
              </p>
              <p>
                Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos
                données. Vos informations sont modifiables à tout moment depuis{" "}
                <Link href="/compte" className="link-underline text-ink">votre espace client</Link> ; pour toute autre
                demande, écrivez à l&apos;adresse de contact ci-dessus.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies",
          body: (
            <p>
              Le site n&apos;utilise que des cookies techniques : maintien de votre connexion, conservation du panier
              pendant 30 jours sans compte et identifiant de visite anonyme servant aux statistiques internes. Aucun cookie
              publicitaire ni traceur tiers.
            </p>
          ),
        },
        {
          id: "ia",
          title: "Le Concierge",
          body: (
            <p>
              Le conseiller du site s&apos;appuie sur un modèle d&apos;intelligence artificielle (Claude, Anthropic). Ses
              recommandations sont indicatives ; vérifiez les dimensions et les caractéristiques sur la fiche de chaque
              pièce avant de commander.
            </p>
          ),
        },
      ]}
    />
  );
}
