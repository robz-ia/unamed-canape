import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Conditions générales de vente" };

export default function CGV() {
  return (
    <LegalPage
      eyebrow="Conditions générales de vente"
      title="Acheter *en confiance.*"
      updated="25 octobre 2026"
      sections={[
        {
          id: "objet",
          title: "Objet",
          body: (
            <p>
              Les présentes conditions régissent les ventes de canapés, fauteuils et convertibles proposées sur le site
              Unamed Canapé. Toute commande implique leur acceptation.
            </p>
          ),
        },
        {
          id: "produits",
          title: "Produits et configurations",
          body: (
            <p>
              Chaque pièce est proposée en une ou plusieurs configurations (format, longueur, coloris, garnissage). Les
              photographies et dimensions indiquées sur la fiche correspondent à la configuration sélectionnée ; de
              légères variations de teinte peuvent exister selon les écrans et les lots de tissu.
            </p>
          ),
        },
        {
          id: "prix",
          title: "Prix",
          body: (
            <>
              <p>Les prix sont indiqués en euros, toutes taxes comprises, pour la configuration choisie.</p>
              <p>
                <strong>Livraison et installation sont offertes dès 1 500 €</strong> d&apos;achat ; en dessous, elles sont
                facturées 149 €. Les codes promotionnels s&apos;appliquent avant le calcul des frais de livraison, dans la
                limite d&apos;un code par commande et selon leurs conditions (montant minimum, date de validité).
              </p>
            </>
          ),
        },
        {
          id: "commande",
          title: "Commande",
          body: (
            <p>
              Le panier peut être constitué sans compte : il est conservé 30 jours sur votre appareil. La validation
              d&apos;une commande nécessite un compte client ; votre panier y est alors rattaché automatiquement. La
              commande est confirmée à l&apos;écran puis visible dans{" "}
              <Link href="/compte" className="link-underline text-ink">votre espace client</Link>, avec son suivi.
            </p>
          ),
        },
        {
          id: "paiement",
          title: "Paiement",
          body: (
            <p>
              Le site fonctionne en mode démonstration : aucun paiement n&apos;est encaissé. Dans une exploitation réelle,
              le paiement serait réalisé par carte bancaire via un prestataire sécurisé, avec possibilité de régler en
              trois fois sans frais.
            </p>
          ),
        },
        {
          id: "fabrication",
          title: "Fabrication et livraison",
          body: (
            <p>
              Chaque pièce est fabriquée à la commande, dans un délai de quatre à huit semaines indiqué sur sa fiche. Nous
              convenons ensuite avec vous d&apos;un créneau : la pièce est livrée, déballée et installée dans la pièce de
              votre choix, et les emballages sont repris.
            </p>
          ),
        },
        {
          id: "retractation",
          title: "Rétractation et retours",
          body: (
            <p>
              Vous disposez du délai légal de 14 jours pour vous rétracter, que nous portons à{" "}
              <strong>30 jours</strong> à compter de la livraison. Le retour est gratuit pour toute pièce rendue dans son
              état d&apos;origine ; le remboursement intervient dans les 14 jours suivant sa reprise.
            </p>
          ),
        },
        {
          id: "garanties",
          title: "Garanties",
          body: (
            <p>
              Toutes nos pièces bénéficient de la garantie légale de conformité (2 ans) et de la garantie des vices
              cachés. Nous y ajoutons une <strong>garantie commerciale de 10 ans sur les structures</strong>.
            </p>
          ),
        },
        {
          id: "litiges",
          title: "Litiges",
          body: (
            <p>
              Les présentes conditions sont soumises au droit français. En cas de différend, une solution amiable sera
              recherchée en priorité ; à défaut, vous pouvez recourir gratuitement à un médiateur de la consommation.
            </p>
          ),
        },
      ]}
    />
  );
}
