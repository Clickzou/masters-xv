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

  // À compléter : tarif par équipe (ex. « 1 200 € HT »), sinon null
  price: null,
  // À compléter : date limite d'inscription (ex. « 5 octobre 2026 »), sinon null
  registrationDeadline: null,
  // À compléter : contact affiché et utilisé si l'envoi du formulaire échoue
  contactEmail: null,
  contactPhone: null,
}

// Carrousel des partenaires (au-dessus de « L'esprit »).
// logo : fichier déposé dans public/sponsors/ (SVG ou PNG transparent), ex. '/sponsors/midi-olympique.svg'
// Sans logo, le nom s'affiche en toutes lettres. url : lien facultatif.
// placeholder: true → emplacement « Votre logo ici » qui renvoie vers la section Partenaires.
export const SPONSORS = [
  { name: 'Midi Olympique', logo: null, url: null },
  { name: 'Golf de Palmola', logo: null, url: null },
  { placeholder: true },
  { placeholder: true },
  { placeholder: true },
  { placeholder: true },
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
