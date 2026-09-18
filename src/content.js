// Toutes les informations du site sont ici, en français (fr) et en anglais (en).
// Une valeur à null masque l'élément correspondant sur le site.

// ——— Données communes aux deux langues
export const SHARED = {
  // Heure de Paris (UTC+2 en octobre)
  startsAt: '2026-10-14T08:00:00+02:00',
  venue: 'Golf de Palmola',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Golf+de+Palmola',
  mapsEmbed: 'https://maps.google.com/maps?q=Golf%20de%20Palmola&z=13&output=embed',
  // À compléter : contact affiché dans le pied de page et les pages légales, sinon null
  contactEmail: 'contact@masters-xv.fr',
  contactPhone: null,
}

// Carrousel des sponsors, dans l'ordre d'affichage.
// logo : fichier dans public/sponsors/ · dark: true → logo blanc affiché sur une carte verte
export const SPONSORS = [
  { name: 'Midi Olympique', logo: '/sponsors/midi-olympique.png', url: 'https://www.midi-olympique.fr/' },
  { name: 'CTA Events', logo: '/sponsors/cta-events.png', url: 'https://ctameetingevents.fr/' },
  { name: 'Clickzou', logo: '/sponsors/clickzou.png', url: 'https://www.clickzou.fr/' },
  { name: 'Joaillerie Piquemal Baron', logo: '/sponsors/joaillerie-piquemal-baron.png', url: 'https://www.joailleriepiquemalbaron.com/' },
  { name: 'Intermarché Garidech', logo: '/sponsors/intermarche-garidech.png', url: 'https://www.intermarche.com/magasins/11126/garidech-31380/infos-pratiques' },
  { name: 'Subloisirs', logo: '/sponsors/subloisirs.png', url: 'https://subloisirs.com/', dark: true },
  { name: 'Debard Automobiles', logo: '/sponsors/debard-automobiles.png', url: 'https://www.debardautomobiles.com/' },
  { name: 'Securinfor', logo: '/sponsors/securinfor.png', url: 'https://www.securinfor.fr/' },
  { name: 'Le Bistro de Palmo', logo: '/sponsors/bistro-de-palmo.png', url: 'https://www.bistrodepalmo.com/' },
  { name: 'McDonald’s', logo: '/sponsors/mcdonalds.png', url: 'https://www.mcdonalds.fr/' },
  { name: 'Plyz', logo: '/sponsors/plyz.png', url: 'https://plyz.io/', dark: true },
  { name: 'Turkish Airlines', logo: '/sponsors/turkish-airlines.png', url: 'https://www.turkishairlines.com/fr-fr/' },
  { name: 'Golf de Palmola', logo: '/sponsors/golf-de-palmola.png', url: 'https://www.golfdepalmola.com/' },
  { name: 'NOpTRACK', logo: '/sponsors/noptrack.png' },
]

// Lien et QR code personnels de la carte d'invitation de chaque sponsor : https://masters-xv.fr/invite/<slug>
// (slug = nom du fichier logo, ex. /sponsors/clickzou.png → clickzou)
export const sponsorSlug = sp => sp.logo.split('/').pop().replace(/\.\w+$/, '')
export const sponsorBySlug = slug => SPONSORS.find(sp => sponsorSlug(sp) === slug) || null

const GALLERY_SRC = [
  '/images/palmola/palmola-vue-aerienne.webp',
  '/images/palmola/palmola-lac.webp',
  '/images/palmola/palmola-depart-fontaine.webp',
  '/images/palmola/palmola-club-house.webp',
  '/images/palmola/palmola-terrasse-soiree.webp',
  '/images/palmola/palmola-green-club-house.webp',
]

// ——— Français
const fr = {
  meta: {
    title: 'Masters XV – Le tournoi des légendes Midi Olympique',
    description: 'Masters XV, le tournoi de golf des légendes du rugby par Midi Olympique. Mercredi 14 octobre 2026 au golf de Palmola : shamble à 4, concours de drive et de précision, déjeuner et remise des prix.',
  },
  event: {
    baseline: 'Le tournoi des légendes Midi Olympique',
    dateLabel: 'Mercredi 14 octobre 2026',
    venueCity: 'Buzet-sur-Tarn, à 20 minutes de Toulouse',
    format: 'Shamble à 4',
    // À compléter : date limite d'inscription (ex. « 5 octobre 2026 »), sinon null
    registrationDeadline: null,
  },
  nav: {
    items: [['esprit', 'L’esprit'], ['programme', 'Programme'], ['formule', 'La formule'], ['lieu', 'Le lieu'], ['partenaires', 'Associez votre marque']],
    cta: 'Inscription',
    menu: 'Menu',
    switchTo: 'English version',
  },
  hero: {
    kicker: 'Midi Olympique présente',
    title1: 'Le tournoi', title2: 'des légendes',
    organisedBy: '— organisé par',
    logoAlt: 'Masters XV – Midi Olympique Golf Tournament',
    ctaPrimary: 'Inscrire une équipe',
    ctaSecondary: 'Découvrir le programme',
  },
  countdown: { label: 'Compte à rebours avant le départ', units: ['jours', 'heures', 'minutes', 'secondes'] },
  sponsors: { title: 'Les sponsors qui soutiennent activement Masters XV', aria: 'Nos sponsors' },
  esprit: {
    kicker: 'L’esprit Masters XV',
    title: 'Quand l’Ovalie prend le green',
    lead: 'Ni tout à fait un tournoi de golf, ni tout à fait un rendez-vous rugby : Masters XV réunit les passionnés des deux univers autour de ce qu’ils partagent — l’esprit d’équipe, le respect, un repas convivial et le partage.',
    pillars: [
      { title: 'Les légendes', text: 'Anciens internationaux et figures du rugby partagent le parcours avec partenaires et invités.' },
      { title: 'Le green', text: 'Un parcours d’exception aux portes de Toulouse, dans l’élégance des grands tournois.' },
      { title: 'La troisième mi-temps', text: 'L’esprit rugby jusqu’au bout : partage, convivialité et remise des prix autour de la table.' },
    ],
  },
  programme: {
    title: 'Le programme de la journée',
    steps: [
      { time: '8h00', title: 'Accueil & English breakfast', text: 'Accueil des équipes au club-house autour d’un petit-déjeuner à l’anglaise : œufs brouillés, bacon, saucisses et haricots.' },
      { time: '8h30', title: 'Départ du tournoi', text: 'Shamble à 4 : toutes les équipes s’élancent sur le parcours.' },
      { time: 'Sur le parcours', title: 'Concours de drive & de précision', text: 'Deux défis pour les plus longs frappeurs et les plus adroits.' },
      { time: 'Sur le parcours', title: 'Buffet gourmand', text: 'Une halte conviviale au cœur du parcours, entre deux trous.' },
      { time: '14h00', title: 'Déjeuner & remise des prix', text: 'La troisième mi-temps : déjeuner, palmarès et trophées.' },
    ],
  },
  formule: {
    kicker: 'La formule',
    lead: 'Composez votre équipe de quatre joueurs — partenaires, clients, amis — pour une formule qui marie l’esprit collectif du départ et le défi de chacun jusqu’au green.',
    steps: [
      { n: 'I', title: 'Tous au départ', text: 'Les quatre joueurs de l’équipe jouent leur drive.' },
      { n: 'II', title: 'Le meilleur drive', text: 'L’équipe choisit la meilleure mise en jeu.' },
      { n: 'III', title: 'Chacun sa balle', text: 'Depuis cet endroit, chaque joueur termine le trou avec sa propre balle.' },
      { n: 'IV', title: 'Le score d’équipe', text: 'Les meilleurs scores individuels du trou comptent pour l’équipe.' },
    ],
    contest: 'Concours',
    drive: ['Drive', 'Le plus long coup de la journée.'],
    precision: ['Précision', 'La balle la plus proche du drapeau.'],
  },
  lieu: {
    kicker: 'Le lieu',
    text: 'Un cadre verdoyant et un parcours de caractère, aux portes de la Ville rose, pour accueillir la première édition de Masters XV.',
    directions: 'Itinéraire',
    mapTitle: 'Plan d’accès',
  },
  map: {
    text: 'La carte est fournie par Google Maps, qui peut déposer des cookies lors de son affichage.',
    button: 'Afficher la carte',
    remember: 'Se souvenir de mon choix',
    policy: 'Politique de cookies',
  },
  gallery: {
    kicker: 'En images',
    title: 'Le golf de Palmola en photo',
    captions: ['Le domaine vu du ciel', 'Le lac et les fairways', 'Départ au bord de l’eau', 'Le club-house et sa terrasse', 'Les soirées au club-house', 'Le green du club-house'],
    enlarge: 'Agrandir',
    prev: 'Photo précédente', next: 'Photo suivante', close: 'Fermer',
  },
  partners: {
    kicker: 'Entreprises & partenaires',
    title: 'Associez votre marque aux légendes',
    lead: 'Invitez clients et collaborateurs à vivre une journée d’exception sur le green, aux côtés des figures du rugby.',
    badge: 'Formule prestige',
    choose: 'Choisir cette formule',
    note: '* Réduction d’impôt de 60 % du montant du don pour les entreprises, dans les conditions prévues par la loi. Un reçu fiscal (CERFA) vous est remis.',
    organisation: 'Une organisation', with: 'avec',
  },
  offers: [
    {
      id: 'sponsor', name: 'Sponsor du Masters XV', price: '3 000 €', featured: true,
      taxNote: 'dont 60 % défiscalisables', netNote: 'soit 1 200 € après réduction d’impôt*',
      perks: ['Une équipe de 4 joueurs', 'Un joueur professionnel de rugby partenaire dans votre équipe', 'Reçu fiscal (CERFA)'],
    },
    {
      id: 'equipe', name: 'Équipe partenaire', price: '1 500 €', featured: false,
      taxNote: 'par équipe de 4 joueurs', netNote: null,
      perks: ['Une équipe de 4 joueurs', 'Un joueur professionnel de rugby, selon disponibilité', 'Reçu fiscal (CERFA)'],
    },
  ],
  inscription: {
    kicker: 'Inscription',
    title: 'Réservez votre équipe',
    lead: 'Les places sont limitées. Laissez-nous vos coordonnées : l’équipe organisatrice revient vers vous pour confirmer votre inscription',
    before: 'avant le',
  },
  form: {
    firstName: 'Prénom', lastName: 'Nom', company: 'Société', phone: 'Téléphone', email: 'E-mail',
    offer: 'Formule', teams: 'Nombre d’équipes', teamsOptions: ['1', '2', '3', '4 ou plus'],
    level: 'Index / niveau', levelPlaceholder: 'ex. débutants, index 18…',
    requiredNote: 'Tous les champs sont obligatoires.',
    message: 'Message', messagePlaceholder: 'Noms des joueurs, invités, questions…',
    receipt: 'Je souhaite recevoir un reçu fiscal (CERFA)',
    privacy: ['Les informations recueillies sont utilisées par CTA Events uniquement pour traiter votre demande et organiser l’événement. Pour en savoir plus et exercer vos droits, consultez notre', 'politique de confidentialité'],
    send: 'Envoyer ma demande', sending: 'Envoi en cours…',
    error: 'L’envoi n’a pas abouti.', errorMail: 'Vous pouvez nous écrire directement par e-mail', retry: 'Merci de réessayer dans un instant.',
    doneKicker: 'Merci', doneTitle: 'Votre demande est bien arrivée',
    doneText: 'L’équipe Masters XV revient vers vous très rapidement pour finaliser votre inscription.',
    mailSubject: 'Inscription Masters XV',
  },
  // ——— Page des invités (/invite) : même site, sans les formules payantes
  guest: {
    meta: { title: 'Invitation – Masters XV, le tournoi des légendes Midi Olympique' },
    navCta: 'Répondre',
    heroKicker: 'Midi Olympique a le plaisir de vous inviter',
    heroKickerFrom: name => `Midi Olympique et ${name} ont le plaisir de vous inviter`,
    ctaPrimary: 'Confirmer ma présence',
    kicker: 'Votre invitation',
    title: 'Confirmez votre présence',
    lead: 'Vous êtes l’invité de Midi Olympique et de CTA Events pour cette première édition. Merci de nous indiquer si vous serez des nôtres',
    leadFrom: name => `Vous êtes l’invité de Midi Olympique et de ${name} pour cette première édition. Merci de nous indiquer si vous serez des nôtres`,
    form: {
      requiredNote: 'Les champs marqués d’un * sont obligatoires.',
      optional: 'facultatif',
      participation: 'Participation',
      participationOptions: { golf: 'Tournoi de golf, déjeuner & remise des prix', dejeuner: 'Déjeuner & remise des prix uniquement' },
      companions: 'Accompagnants', companionsOptions: ['0', '1', '2', '3'],
      level: 'Index / niveau de golf', levelPlaceholder: 'ex. index 18, débutant…',
      diet: 'Régime alimentaire / allergies', dietPlaceholder: 'ex. végétarien, sans gluten…',
      messagePlaceholder: 'Nom de votre accompagnant, question…',
      send: 'Confirmer ma présence',
      doneTitle: 'Votre réponse est bien arrivée',
      doneText: 'Merci ! L’équipe Masters XV vous enverra prochainement toutes les informations pratiques.',
      mailSubject: 'Réponse à l’invitation Masters XV',
    },
  },
  footer: {
    legal: 'Mentions légales', privacy: 'Confidentialité', cookies: 'Cookies', manageCookies: 'Gérer les cookies',
    credit: 'Création site internet par',
  },
  legalPage: { back: 'Retour à l’accueil', updated: 'Dernière mise à jour : 17 septembre 2026' },
}

// ——— English
const en = {
  meta: {
    title: 'Masters XV – The Legends’ Tournament by Midi Olympique',
    description: 'Masters XV, the golf tournament of rugby legends by Midi Olympique. Wednesday 14 October 2026 at Golf de Palmola: 4-player shamble, longest drive and nearest-the-pin contests, lunch and prize-giving.',
  },
  event: {
    baseline: 'The Legends’ Tournament by Midi Olympique',
    dateLabel: 'Wednesday 14 October 2026',
    venueCity: 'Buzet-sur-Tarn, 20 minutes from Toulouse',
    format: '4-player shamble',
    registrationDeadline: null,
  },
  nav: {
    items: [['esprit', 'The spirit'], ['programme', 'Programme'], ['formule', 'The format'], ['lieu', 'The venue'], ['partenaires', 'Partner with us']],
    cta: 'Register',
    menu: 'Menu',
    switchTo: 'Version française',
  },
  hero: {
    kicker: 'Midi Olympique presents',
    title1: 'The legends’', title2: 'tournament',
    organisedBy: '— organised by',
    logoAlt: 'Masters XV – Midi Olympique Golf Tournament',
    ctaPrimary: 'Register a team',
    ctaSecondary: 'See the programme',
  },
  countdown: { label: 'Countdown to tee-off', units: ['days', 'hours', 'minutes', 'seconds'] },
  sponsors: { title: 'The sponsors actively supporting Masters XV', aria: 'Our sponsors' },
  esprit: {
    kicker: 'The Masters XV spirit',
    title: 'Where rugby meets the green',
    lead: 'Not quite a golf tournament, not quite a rugby gathering: Masters XV brings together enthusiasts of both worlds around what they share — team spirit, respect, a friendly meal and sharing.',
    pillars: [
      { title: 'The legends', text: 'Former internationals and rugby figures share the course with partners and guests.' },
      { title: 'The green', text: 'An outstanding course on the outskirts of Toulouse, with the elegance of the great tournaments.' },
      { title: 'The third half', text: 'Rugby spirit to the very end: sharing, conviviality and prize-giving around the table.' },
    ],
  },
  programme: {
    title: 'Programme of the day',
    steps: [
      { time: '8:00 am', title: 'Welcome & English breakfast', text: 'Teams are welcomed at the clubhouse with a full English breakfast: scrambled eggs, bacon, sausages and beans.' },
      { time: '8:30 am', title: 'Tee-off', text: '4-player shamble: all teams head out onto the course.' },
      { time: 'On the course', title: 'Longest drive & nearest-the-pin', text: 'Two challenges for the longest hitters and the most accurate players.' },
      { time: 'On the course', title: 'Gourmet buffet', text: 'A friendly break in the middle of the course, between two holes.' },
      { time: '2:00 pm', title: 'Lunch & prize-giving', text: 'The third half: lunch, results and trophies.' },
    ],
  },
  formule: {
    kicker: 'The format',
    lead: 'Build your team of four — partners, clients, friends — in a format that blends the team spirit of the tee shot with each player’s own challenge all the way to the green.',
    steps: [
      { n: 'I', title: 'Everyone tees off', text: 'All four players of the team hit their drive.' },
      { n: 'II', title: 'The best drive', text: 'The team picks the best tee shot.' },
      { n: 'III', title: 'Own ball', text: 'From there, each player finishes the hole with their own ball.' },
      { n: 'IV', title: 'Team score', text: 'The best individual scores on the hole count for the team.' },
    ],
    contest: 'Contest',
    drive: ['Longest drive', 'The longest shot of the day.'],
    precision: ['Nearest the pin', 'The ball closest to the flag.'],
  },
  lieu: {
    kicker: 'The venue',
    text: 'A green setting and a course full of character, on the doorstep of Toulouse, to host the very first Masters XV.',
    directions: 'Directions',
    mapTitle: 'Access map',
  },
  map: {
    text: 'The map is provided by Google Maps, which may set cookies when it is displayed.',
    button: 'Show the map',
    remember: 'Remember my choice',
    policy: 'Cookie policy',
  },
  gallery: {
    kicker: 'In pictures',
    title: 'Golf de Palmola in photos',
    captions: ['The estate from above', 'The lake and fairways', 'Teeing off by the water', 'The clubhouse and its terrace', 'Evenings at the clubhouse', 'The clubhouse green'],
    enlarge: 'Enlarge',
    prev: 'Previous photo', next: 'Next photo', close: 'Close',
  },
  partners: {
    kicker: 'Companies & partners',
    title: 'Partner your brand with the legends',
    lead: 'Invite clients and colleagues to an exceptional day on the green, alongside rugby’s great names.',
    badge: 'Prestige package',
    choose: 'Choose this package',
    note: '* 60% corporate tax reduction on the donation amount under French law, subject to eligibility. A tax receipt (CERFA) is issued.',
    organisation: 'Organised by', with: 'with',
  },
  offers: [
    {
      id: 'sponsor', name: 'Masters XV Sponsor', price: '€3,000', featured: true,
      taxNote: 'of which 60% tax-deductible', netNote: 'i.e. €1,200 after tax reduction*',
      perks: ['One team of 4 players', 'A partner professional rugby player in your team', 'Tax receipt (CERFA)'],
    },
    {
      id: 'equipe', name: 'Partner team', price: '€1,500', featured: false,
      taxNote: 'per team of 4 players', netNote: null,
      perks: ['One team of 4 players', 'A professional rugby player, subject to availability', 'Tax receipt (CERFA)'],
    },
  ],
  inscription: {
    kicker: 'Registration',
    title: 'Book your team',
    lead: 'Places are limited. Leave us your details and the organising team will get back to you to confirm your registration',
    before: 'before',
  },
  form: {
    firstName: 'First name', lastName: 'Last name', company: 'Company', phone: 'Phone', email: 'Email',
    offer: 'Package', teams: 'Number of teams', teamsOptions: ['1', '2', '3', '4 or more'],
    level: 'Handicap / level', levelPlaceholder: 'e.g. beginners, handicap 18…',
    requiredNote: 'All fields are required.',
    message: 'Message', messagePlaceholder: 'Player names, guests, questions…',
    receipt: 'I would like to receive a tax receipt (CERFA)',
    privacy: ['The information collected is used by CTA Events solely to process your request and organise the event. To find out more and exercise your rights, see our', 'privacy policy'],
    send: 'Send my request', sending: 'Sending…',
    error: 'Your request could not be sent.', errorMail: 'You can email us directly', retry: 'Please try again in a moment.',
    doneKicker: 'Thank you', doneTitle: 'Your request has been received',
    doneText: 'The Masters XV team will get back to you shortly to finalise your registration.',
    mailSubject: 'Masters XV registration',
  },
  guest: {
    meta: { title: 'Invitation – Masters XV, the Legends’ Tournament by Midi Olympique' },
    navCta: 'Reply',
    heroKicker: 'Midi Olympique is delighted to invite you',
    heroKickerFrom: name => `Midi Olympique and ${name} are delighted to invite you`,
    ctaPrimary: 'Confirm my attendance',
    kicker: 'Your invitation',
    title: 'Confirm your attendance',
    lead: 'You are the guest of Midi Olympique and CTA Events for this very first edition. Please let us know whether you will be joining us',
    leadFrom: name => `You are the guest of Midi Olympique and ${name} for this very first edition. Please let us know whether you will be joining us`,
    form: {
      requiredNote: 'Fields marked with * are required.',
      optional: 'optional',
      participation: 'Attendance',
      participationOptions: { golf: 'Golf tournament, lunch & prize-giving', dejeuner: 'Lunch & prize-giving only' },
      companions: 'Accompanying guests', companionsOptions: ['0', '1', '2', '3'],
      level: 'Golf handicap / level', levelPlaceholder: 'e.g. handicap 18, beginner…',
      diet: 'Dietary requirements / allergies', dietPlaceholder: 'e.g. vegetarian, gluten-free…',
      messagePlaceholder: 'Name of your guest, questions…',
      send: 'Confirm my attendance',
      doneTitle: 'Your reply has been received',
      doneText: 'Thank you! The Masters XV team will send you all the practical details shortly.',
      mailSubject: 'Reply to the Masters XV invitation',
    },
  },
  footer: {
    legal: 'Legal notice', privacy: 'Privacy', cookies: 'Cookies', manageCookies: 'Manage cookies',
    credit: 'Website created by',
  },
  legalPage: { back: 'Back to home', updated: 'Last updated: 17 September 2026' },
}

const build = (t, lang) => ({
  ...t,
  lang,
  event: { ...SHARED, ...t.event },
  gallery: { ...t.gallery, items: GALLERY_SRC.map((src, i) => ({ src, caption: t.gallery.captions[i] })) },
})

export const CONTENT = { fr: build(fr, 'fr'), en: build(en, 'en') }
