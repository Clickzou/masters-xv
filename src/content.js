// Toutes les informations de l'événement sont ici : modifier ce fichier suffit à mettre le site à jour.
// Une valeur à null masque l'élément correspondant sur le site.

export const EVENT = {
  name: 'Masters XV',
  baseline: 'Le tournoi des légendes Midi Olympique',
  dateLabel: 'Mercredi 14 octobre 2026',
  // Heure de Paris (UTC+2 en octobre)
  startsAt: '2026-10-14T08:00:00+02:00',
  venue: 'Golf de Palmola',
  venueCity: 'Buzet-sur-Tarn, à 20 minutes de Toulouse',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Golf+de+Palmola',
  mapsEmbed: 'https://maps.google.com/maps?q=Golf%20de%20Palmola&z=13&output=embed',
  format: 'Shamble à 4',

  // À compléter : date limite d'inscription (ex. « 5 octobre 2026 »), sinon null
  registrationDeadline: null,
  // À compléter : contact affiché et utilisé si l'envoi du formulaire échoue
  contactEmail: null,
  contactPhone: null,
}

// Carrousel des sponsors (au-dessus de « L'esprit »), dans l'ordre d'affichage.
// logo : fichier dans public/sponsors/ · dark: true → logo blanc affiché sur une carte verte
export const SPONSORS = [
  { name: 'Midi Olympique', logo: '/sponsors/midi-olympique.png', url: 'https://www.midi-olympique.fr/' },
  { name: 'CTA Meeting & Events', logo: '/sponsors/cta-meeting-events.png', url: 'https://ctameetingevents.fr/' },
  { name: 'Clickzou', logo: '/sponsors/clickzou.png', url: 'https://www.clickzou.fr/' },
  { name: 'Joaillerie Piquemal Baron', logo: '/sponsors/joaillerie-piquemal-baron.png', url: 'https://www.joailleriepiquemalbaron.com/' },
  { name: 'Intermarché Garidech', logo: '/sponsors/intermarche-garidech.png', url: 'https://www.intermarche.com/magasins/11126/garidech-31380/infos-pratiques' },
  { name: 'Subloisirs', logo: '/sponsors/subloisirs.png', url: 'https://subloisirs.com/', dark: true },
  { name: 'Debard Automobiles', logo: '/sponsors/debard-automobiles.png', url: 'https://www.debardautomobiles.com/' },
  { name: 'Securinfor', logo: '/sponsors/securinfor.png', url: 'https://www.securinfor.fr/' },
  { name: 'Le Bistro de Palmo', logo: '/sponsors/bistro-de-palmo.png', url: 'https://www.bistrodepalmo.com/' },
  { name: 'McDonald’s', logo: '/sponsors/mcdonalds.png', url: 'https://www.mcdonalds.fr/' },
  { name: 'Plyz', logo: '/sponsors/plyz.png', url: 'https://plyz.io/', dark: true },
]

// Galerie « Le golf de Palmola en photo » (l'ordre correspond à la mosaïque)
export const GALLERY = [
  { src: '/images/palmola/palmola-vue-aerienne.webp', caption: 'Le domaine vu du ciel' },
  { src: '/images/palmola/palmola-lac.webp', caption: 'Le lac et les fairways' },
  { src: '/images/palmola/palmola-depart-fontaine.webp', caption: 'Départ au bord de l’eau' },
  { src: '/images/palmola/palmola-club-house.webp', caption: 'Le club-house et sa terrasse' },
  { src: '/images/palmola/palmola-terrasse-soiree.webp', caption: 'Les soirées au club-house' },
  { src: '/images/palmola/palmola-green-club-house.webp', caption: 'Le green du club-house' },
]

// Formules proposées (section Partenaires et formulaire d'inscription)
export const OFFERS = [
  {
    id: 'sponsor',
    name: 'Sponsor du Masters XV',
    price: '3 000 €',
    taxNote: 'dont 60 % défiscalisables',
    netNote: 'soit 1 200 € après réduction d’impôt*',
    featured: true,
    perks: [
      'Une équipe de 4 joueurs',
      'Un joueur professionnel de rugby partenaire dans votre équipe',
      'Reçu fiscal (CERFA)',
    ],
  },
  {
    id: 'equipe',
    name: 'Équipe partenaire',
    price: '1 500 €',
    taxNote: 'par équipe de 4 joueurs',
    netNote: null,
    featured: false,
    perks: [
      'Une équipe de 4 joueurs',
      'Un joueur professionnel de rugby, selon disponibilité',
      'Reçu fiscal (CERFA)',
    ],
  },
]

export const PROGRAMME = [
  { time: '8h00', title: 'Accueil & petit-déjeuner', text: 'Accueil des équipes autour d’un petit-déjeuner au club-house.' },
  { time: '8h30', title: 'Départ du tournoi', text: 'Shamble à 4 : toutes les équipes s’élancent sur le parcours.' },
  { time: 'Sur le parcours', title: 'Concours de drive & de précision', text: 'Deux défis pour les plus longs frappeurs et les plus adroits.' },
  { time: 'Sur le parcours', title: 'Buffet gourmand', text: 'Une halte conviviale au cœur du parcours, entre deux trous.' },
  { time: '14h00', title: 'Déjeuner & remise des prix', text: 'La troisième mi-temps : déjeuner, palmarès et trophées.' },
]

export const PILLARS = [
  { title: 'Les légendes', text: 'Anciens internationaux et figures du rugby partagent le parcours avec partenaires et invités.' },
  { title: 'Le green', text: 'Un parcours d’exception aux portes de Toulouse, dans l’élégance des grands tournois.' },
  { title: 'La troisième mi-temps', text: 'L’esprit rugby jusqu’au bout : partage, convivialité et remise des prix autour de la table.' },
]

export const FORMAT_STEPS = [
  { n: 'I', title: 'Tous au départ', text: 'Les quatre joueurs de l’équipe jouent leur drive.' },
  { n: 'II', title: 'Le meilleur drive', text: 'L’équipe choisit la meilleure mise en jeu.' },
  { n: 'III', title: 'Chacun sa balle', text: 'Depuis cet endroit, chaque joueur termine le trou avec sa propre balle.' },
  { n: 'IV', title: 'Le score d’équipe', text: 'Les meilleurs scores individuels du trou comptent pour l’équipe.' },
]
