// Pages légales (français / anglais).
// Informations de l'éditeur issues de l'annuaire officiel des entreprises (recherche-entreprises.api.gouv.fr).
// À compléter : capital social, directeur de la publication et e-mail de contact (null = ligne masquée).
import { SHARED } from './content.js'

export const COMPANY = {
  name: 'CTA EVENTS',
  form: 'SAS',
  capital: null, // ex. '100 000 €'
  address: '99 rue de Fenouillet, 31200 Toulouse, France',
  siren: '384 622 684',
  rcs: 'RCS Toulouse 384 622 684',
  vat: 'FR05384622684',
  president: 'CTA GROUP',
  publicationDirector: null, // ex. 'Prénom Nom'
  email: SHARED.contactEmail,
  phone: SHARED.contactPhone,
}

const HOST = 'Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — https://vercel.com'
const HOST_EN = 'Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, United States — https://vercel.com'

const contactFr = () => [
  COMPANY.email && `par e-mail : ${COMPANY.email}`,
  COMPANY.phone && `par téléphone : ${COMPANY.phone}`,
  `par courrier : ${COMPANY.name}, ${COMPANY.address}`,
].filter(Boolean).join(' ; ')

const contactEn = () => [
  COMPANY.email && `by email: ${COMPANY.email}`,
  COMPANY.phone && `by phone: ${COMPANY.phone}`,
  `by post: ${COMPANY.name}, ${COMPANY.address}`,
].filter(Boolean).join('; ')

// Chaque page : { slug, title, sections: [{ h, p: [paragraphes] }] }
// Les paragraphes commençant par « • » sont affichés en liste.
export const LEGAL = {
  fr: {
    'mentions-legales': {
      title: 'Mentions légales',
      sections: [
        { h: 'Éditeur du site', p: [
          `Le site Masters XV est édité par ${COMPANY.name}, ${COMPANY.form}${COMPANY.capital ? ` au capital de ${COMPANY.capital}` : ''}, dont le siège social est situé ${COMPANY.address}.`,
          `SIREN : ${COMPANY.siren} — ${COMPANY.rcs} — N° de TVA intracommunautaire : ${COMPANY.vat}.`,
          `Représentée par son Président, la société ${COMPANY.president}.`,
          `Directeur de la publication : ${COMPANY.publicationDirector || `le représentant légal de ${COMPANY.name}`}.`,
          `Contact : ${contactFr()}.`,
        ] },
        { h: 'L’événement', p: [
          'Masters XV – Le tournoi des légendes est organisé par CTA Events, en partenariat avec Midi Olympique et le Golf de Palmola (Route d’Albi, 31660 Buzet-sur-Tarn).',
        ] },
        { h: 'Hébergement', p: [`Le site est hébergé par ${HOST}.`] },
        { h: 'Conception et réalisation', p: ['Clickzou, agence digitale et IA à Toulouse — https://www.clickzou.fr'] },
        { h: 'Propriété intellectuelle', p: [
          'L’ensemble des éléments du site (textes, logo Masters XV, charte graphique, mise en page) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite préalable de l’éditeur est interdite.',
          'Les logos des sponsors et partenaires sont la propriété de leurs titulaires respectifs et sont reproduits avec leur accord dans le cadre de l’événement.',
          'Crédits photographiques : Golf de Palmola ; banque d’images libre de droits.',
        ] },
        { h: 'Liens hypertextes', p: [
          'Le site contient des liens vers des sites tiers, notamment ceux des sponsors. L’éditeur n’exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.',
        ] },
        { h: 'Responsabilité', p: [
          'L’éditeur s’efforce de fournir des informations exactes et à jour. Le programme, les horaires et les formules peuvent toutefois évoluer ; seules les informations confirmées par l’organisation lors de l’inscription font foi.',
        ] },
        { h: 'Droit applicable', p: ['Les présentes mentions légales sont régies par le droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français sont seuls compétents.'] },
      ],
    },
    'politique-de-confidentialite': {
      title: 'Politique de confidentialité',
      sections: [
        { h: 'Responsable du traitement', p: [
          `Les données personnelles collectées sur ce site sont traitées par ${COMPANY.name}, ${COMPANY.address} (SIREN ${COMPANY.siren}), organisateur de Masters XV.`,
        ] },
        { h: 'Données collectées', p: [
          'Nous collectons uniquement les données que vous saisissez dans le formulaire d’inscription :',
          '• identité : prénom, nom, société ;',
          '• coordonnées : adresse e-mail, téléphone ;',
          '• informations sur votre demande : formule choisie, nombre d’équipes, niveau de jeu, message, souhait de recevoir un reçu fiscal.',
          'Lors de la consultation du site, l’hébergeur enregistre des journaux techniques (adresse IP, date, pages demandées) à des fins de sécurité et de bon fonctionnement.',
        ] },
        { h: 'Finalités et bases légales', p: [
          '• Traiter votre demande d’inscription ou de partenariat et échanger avec vous : mesures précontractuelles prises à votre demande (article 6.1.b du RGPD).',
          '• Organiser l’événement et constituer les équipes : exécution du contrat (article 6.1.b).',
          '• Émettre les reçus fiscaux et tenir la comptabilité : obligations légales (article 6.1.c).',
          '• Assurer la sécurité du site : intérêt légitime de l’éditeur (article 6.1.f).',
          'Vos données ne sont ni vendues, ni louées, ni utilisées pour de la prospection sans votre accord. Aucune décision automatisée n’est prise sur leur fondement.',
        ] },
        { h: 'Destinataires', p: [
          '• L’équipe organisatrice de CTA Events ;',
          '• le cas échéant, les partenaires de l’événement (Midi Olympique, Golf de Palmola), dans la stricte limite nécessaire à l’organisation de la journée ;',
          '• nos sous-traitants techniques : Supabase (base de données, hébergée dans l’Union européenne à Francfort), Vercel Inc. (hébergement du site) et Resend (acheminement des e-mails de confirmation et d’alerte).',
        ] },
        { h: 'Transferts hors de l’Union européenne', p: [
          'Vos demandes sont stockées dans l’Union européenne (Supabase, région Francfort). Vercel et Resend sont des prestataires établis aux États-Unis : les transferts de données sont encadrés par le cadre de protection des données UE–États-Unis (Data Privacy Framework) et/ou les clauses contractuelles types de la Commission européenne.',
        ] },
        { h: 'Durées de conservation', p: [
          '• Demandes d’inscription et échanges : 3 ans à compter du dernier contact ;',
          '• pièces comptables et reçus fiscaux : 10 ans, conformément au Code de commerce ;',
          '• journaux techniques de l’hébergeur : durée limitée fixée par celui-ci.',
        ] },
        { h: 'Vos droits', p: [
          'Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité de vos données, ainsi que du droit de définir des directives relatives à leur sort après votre décès.',
          `Pour exercer ces droits, contactez-nous ${contactFr()}. Une réponse vous sera apportée dans un délai d’un mois.`,
          'Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr).',
        ] },
        { h: 'Sécurité', p: ['Le site est servi exclusivement en HTTPS. L’accès aux données est limité aux seules personnes qui en ont besoin pour traiter votre demande.'] },
      ],
    },
    'politique-cookies': {
      title: 'Politique de cookies',
      sections: [
        { h: 'Ce que fait ce site', p: [
          'Le site Masters XV n’utilise aucun cookie de mesure d’audience, publicitaire ou de réseau social. Les polices de caractères sont hébergées sur le site lui-même : aucun appel n’est fait à des services tiers lors de la navigation.',
        ] },
        { h: 'Stockage local strictement nécessaire', p: [
          'Le site enregistre dans votre navigateur (stockage local) :',
          '• la langue choisie (français ou anglais) ;',
          '• votre choix concernant l’affichage de la carte Google Maps, si vous demandez à ce qu’il soit mémorisé.',
          'Ces informations ne servent qu’à votre confort de navigation, ne sont transmises à personne et sont dispensées de consentement.',
        ] },
        { h: 'Carte Google Maps', p: [
          'La carte d’accès au Golf de Palmola est fournie par Google. Elle n’est chargée qu’après un clic de votre part sur « Afficher la carte ». Google peut alors déposer des cookies et collecter des données selon sa propre politique : https://policies.google.com/privacy',
          'Tant que vous n’affichez pas la carte, aucune donnée n’est transmise à Google.',
        ] },
        { h: 'Liens vers les sites des sponsors', p: [
          'Les logos du carrousel renvoient vers les sites des sponsors, qui appliquent leur propre politique de cookies.',
        ] },
        { h: 'Gérer vos choix', p: [
          'Vous pouvez à tout moment réinitialiser vos choix grâce au bouton ci-dessous ou au lien « Gérer les cookies » en bas de page. Vous pouvez aussi supprimer les données du site depuis les réglages de votre navigateur.',
        ] },
      ],
    },
  },

  en: {
    'mentions-legales': {
      title: 'Legal notice',
      sections: [
        { h: 'Publisher', p: [
          `The Masters XV website is published by ${COMPANY.name}, a French simplified joint-stock company (SAS)${COMPANY.capital ? ` with a share capital of ${COMPANY.capital}` : ''}, whose registered office is at ${COMPANY.address}.`,
          `SIREN: ${COMPANY.siren} — ${COMPANY.rcs} — EU VAT number: ${COMPANY.vat}.`,
          `Represented by its President, ${COMPANY.president}.`,
          `Publication director: ${COMPANY.publicationDirector || `the legal representative of ${COMPANY.name}`}.`,
          `Contact: ${contactEn()}.`,
        ] },
        { h: 'The event', p: [
          'Masters XV – The Legends’ Tournament is organised by CTA Events, in partnership with Midi Olympique and Golf de Palmola (Route d’Albi, 31660 Buzet-sur-Tarn, France).',
        ] },
        { h: 'Hosting', p: [`The website is hosted by ${HOST_EN}.`] },
        { h: 'Design and development', p: ['Clickzou, digital & AI agency in Toulouse — https://www.clickzou.fr'] },
        { h: 'Intellectual property', p: [
          'All content on this website (texts, Masters XV logo, visual identity, layout) is protected by intellectual property law. Any full or partial reproduction without the publisher’s prior written consent is prohibited.',
          'Sponsor and partner logos belong to their respective owners and are reproduced with their consent in connection with the event.',
          'Photo credits: Golf de Palmola; royalty-free image library.',
        ] },
        { h: 'Links', p: ['This website contains links to third-party websites, including sponsors’ websites. The publisher has no control over them and accepts no liability for their content.'] },
        { h: 'Liability', p: ['The publisher strives to provide accurate, up-to-date information. The programme, schedule and packages may change; only the information confirmed by the organisers upon registration is binding.'] },
        { h: 'Governing law', p: ['This legal notice is governed by French law. In the event of a dispute that cannot be settled amicably, the French courts have sole jurisdiction.'] },
      ],
    },
    'politique-de-confidentialite': {
      title: 'Privacy policy',
      sections: [
        { h: 'Data controller', p: [
          `Personal data collected on this website is processed by ${COMPANY.name}, ${COMPANY.address} (SIREN ${COMPANY.siren}), organiser of Masters XV.`,
        ] },
        { h: 'Data collected', p: [
          'We only collect the data you enter in the registration form:',
          '• identity: first name, last name, company;',
          '• contact details: email address, phone number;',
          '• details of your request: chosen package, number of teams, playing level, message, request for a tax receipt.',
          'When you browse the website, the host records technical logs (IP address, date, pages requested) for security and operational purposes.',
        ] },
        { h: 'Purposes and legal bases', p: [
          '• Processing your registration or partnership request and corresponding with you: pre-contractual measures taken at your request (Article 6(1)(b) GDPR).',
          '• Organising the event and building teams: performance of a contract (Article 6(1)(b)).',
          '• Issuing tax receipts and keeping accounts: legal obligations (Article 6(1)(c)).',
          '• Keeping the website secure: the publisher’s legitimate interest (Article 6(1)(f)).',
          'Your data is never sold, rented or used for marketing without your consent. No automated decision-making is based on it.',
        ] },
        { h: 'Recipients', p: [
          '• The CTA Events organising team;',
          '• where applicable, the event partners (Midi Olympique, Golf de Palmola), strictly as needed to organise the day;',
          '• our technical processors: Supabase (database, hosted in the European Union in Frankfurt), Vercel Inc. (website hosting) and Resend (delivery of confirmation and alert emails).',
        ] },
        { h: 'Transfers outside the European Union', p: [
          'Your requests are stored in the European Union (Supabase, Frankfurt region). Vercel and Resend are based in the United States: transfers are covered by the EU–US Data Privacy Framework and/or the European Commission’s standard contractual clauses.',
        ] },
        { h: 'Retention periods', p: [
          '• Registration requests and correspondence: 3 years from the last contact;',
          '• accounting records and tax receipts: 10 years, as required by the French Commercial Code;',
          '• host technical logs: the limited period set by the host.',
        ] },
        { h: 'Your rights', p: [
          'You have the right to access, rectify, erase, restrict, object to and port your data, and to set instructions regarding your data after your death.',
          `To exercise these rights, contact us ${contactEn()}. We will reply within one month.`,
          'If you believe your rights have not been respected, you may lodge a complaint with the French data protection authority, the CNIL (www.cnil.fr).',
        ] },
        { h: 'Security', p: ['The website is served over HTTPS only. Access to data is restricted to the people who need it to handle your request.'] },
      ],
    },
    'politique-cookies': {
      title: 'Cookie policy',
      sections: [
        { h: 'What this website does', p: [
          'The Masters XV website uses no analytics, advertising or social media cookies. Fonts are hosted on the website itself: no third-party services are called while you browse.',
        ] },
        { h: 'Strictly necessary local storage', p: [
          'The website stores the following in your browser (local storage):',
          '• your chosen language (French or English);',
          '• your choice about displaying the Google Maps map, if you ask for it to be remembered.',
          'This information is only used for your browsing comfort, is never shared and does not require consent.',
        ] },
        { h: 'Google Maps', p: [
          'The access map to Golf de Palmola is provided by Google. It is only loaded after you click “Show the map”. Google may then set cookies and collect data under its own policy: https://policies.google.com/privacy',
          'As long as you do not display the map, no data is sent to Google.',
        ] },
        { h: 'Links to sponsors’ websites', p: ['The logos in the carousel link to sponsors’ websites, which apply their own cookie policies.'] },
        { h: 'Managing your choices', p: [
          'You can reset your choices at any time using the button below or the “Manage cookies” link at the bottom of the page. You can also delete the website’s data from your browser settings.',
        ] },
      ],
    },
  },
}

export const LEGAL_SLUGS = Object.keys(LEGAL.fr)
