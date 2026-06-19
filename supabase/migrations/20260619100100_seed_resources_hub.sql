-- Kitoo - contenu du hub Ressources. Articles ORIGINAUX (voix Kitoo, validés
-- pros). Médias & liens = RÉFÉRENCES externes (URLs à VÉRIFIER/MAINTENIR à jour).
-- On repart d'un catalogue propre.
delete from public.resources;

insert into public.resources
  (slug, title, summary, theme, type, format, content, source, author_or_validation, read_time, mood_levels)
values
(
  'gerer-le-stress',
  'Apprivoiser le stress au quotidien',
  'Comprendre ce qui se joue quand le stress monte, et des gestes simples pour relâcher la pression.',
  'stress', 'article', 'article',
  $a$Le stress n'est pas ton ennemi : c'est une réaction normale du corps face à ce qu'il perçoit comme un défi. Le souci, c'est quand il s'installe et ne redescend plus.

## Repérer les signaux
Ton corps parle avant les mots : mâchoire serrée, respiration courte, pensées qui tournent en boucle. Apprendre à les remarquer tôt, c'est déjà reprendre un peu la main.

- Tensions dans les épaules ou le ventre
- Sommeil plus léger, irritabilité
- Difficulté à te concentrer

## Trois gestes pour relâcher
Tu n'as pas besoin de tout régler d'un coup. Un petit pas suffit.

- Respire lentement : inspire 4 secondes, expire 6. Quelques cycles suffisent à calmer le système nerveux.
- Bouge un peu : marcher 5 minutes décharge la tension accumulée.
- Pose ce qui t'encombre : écris ce qui te pèse, sans filtre. Le simple fait de nommer allège.

## Être doux avec toi
Le stress n'est pas un échec de volonté. Les jours chargés, vise « suffisant » plutôt que « parfait ». Et si la pression dure des semaines, en parler à un professionnel peut vraiment aider.$a$,
  'Kitoo', 'Rédigé et validé par des professionnels de santé', '6 min', '{1,2,3}'
),
(
  'mieux-dormir',
  'Retrouver un sommeil réparateur',
  'Pourquoi le sommeil se dérègle, et des repères doux pour des nuits plus calmes.',
  'sommeil', 'article', 'article',
  $a$Mal dormir, ça use. Et plus on s'inquiète de ne pas dormir, plus le sommeil se dérobe. La bonne nouvelle : on peut recréer des conditions favorables, en douceur.

## Le rythme avant tout
Ton corps aime la régularité. Se lever à des heures proches, même le week-end, stabilise l'horloge interne mieux que n'importe quelle astuce.

## Préparer la nuit
- Baisse la lumière une heure avant le coucher ; les écrans peuvent attendre.
- Garde le lit pour dormir : si tu ne trouves pas le sommeil après 20 minutes, lève-toi et fais une activité calme.
- Un rituel court (lecture, respiration, étirement léger) signale au corps qu'il peut relâcher.

## Quand les pensées tournent
Note sur un carnet ce qui t'occupe l'esprit : tu confies tes soucis au papier pour la nuit. Et rappelle-toi qu'une nuit moins bonne n'efface pas tout - ton corps récupère plus que tu ne crois.

Si l'insomnie s'installe durablement, parles-en à un professionnel de santé.$a$,
  'Kitoo', 'Rédigé et validé par des professionnels de santé', '7 min', '{1,2,3}'
),
(
  'apprivoiser-anxiete',
  'Apprivoiser l''anxiété, en douceur',
  'Ce qu''est l''anxiété, et des outils concrets pour traverser les vagues sans lutter.',
  'anxiete', 'article', 'article',
  $a$L'anxiété, c'est l'anticipation d'un danger - réel ou imaginé. Elle veut te protéger, mais elle se trompe souvent d'alerte. La combattre de front l'amplifie ; l'accueillir l'apaise.

## Revenir au présent
L'anxiété vit dans le futur. Ramener ton attention à l'instant coupe l'alimentation de la vague.

- Nomme 5 choses que tu vois, 4 que tu entends, 3 que tu touches.
- Sens tes pieds au sol, ta respiration qui entre et sort.

## Accueillir plutôt que fuir
Une montée d'anxiété est inconfortable, pas dangereuse. Elle monte, culmine, puis redescend toujours. Tu peux te dire : « C'est l'anxiété, elle va passer. »

## Au quotidien
- Limite les excitants (café, défilement infini d'écrans).
- Bouge : l'activité physique régule l'anxiété de fond.
- Parle de ce que tu vis à quelqu'un de confiance.

Si l'anxiété t'empêche de vivre ce qui compte, un accompagnement professionnel est une vraie ressource, pas un aveu de faiblesse.$a$,
  'Kitoo', 'Rédigé et validé par des professionnels de santé', '6 min', '{1,2}'
),
(
  'reprendre-confiance',
  'Reprendre confiance, pas à pas',
  'La confiance n''est pas un don : elle se construit par de petites preuves répétées.',
  'confiance', 'article', 'article',
  $a$La confiance en soi n'est pas une qualité qu'on a ou pas. C'est une relation à soi qui s'entretient, jour après jour.

## Vise petit, mais vrai
Chaque petit défi relevé est une preuve que tu peux compter sur toi. Choisis un pas accessible aujourd'hui, plutôt qu'un grand saut intimidant.

## Change ta voix intérieure
- Remarque le critique intérieur sans le croire sur parole.
- Parle-toi comme à un ami : avec honnêteté et bienveillance.

## Capitalise sur tes appuis
Repense à un moment où tu as surmonté quelque chose. Tu y es arrivé une fois ; ces ressources sont encore là. Garde une trace de tes petites victoires - elles comptent.

Reprendre confiance prend du temps, et c'est normal. Sois patient avec la personne que tu deviens.$a$,
  'Kitoo', 'Rédigé et validé par des professionnels de santé', '5 min', '{2,3,4}'
),
(
  'respiration-apaisante',
  'La respiration pour s''apaiser',
  'Comment quelques minutes de respiration lente calment le corps et l''esprit.',
  'respiration', 'article', 'article',
  $a$Ta respiration est une télécommande de ton système nerveux. En la ralentissant, tu envoies au corps un signal clair : « tout va bien, tu peux te détendre ».

## Pourquoi ça marche
Une expiration plus longue que l'inspiration active le frein naturel du corps (le système parasympathique). Le rythme cardiaque ralentit, les pensées se posent.

## Un exercice simple
- Inspire doucement par le nez pendant 4 secondes.
- Expire lentement par la bouche pendant 6 secondes.
- Recommence pendant 2 à 3 minutes.

## Quand l'utiliser
Avant un moment stressant, au réveil d'une nuit agitée, ou simplement pour faire une pause. Tu peux poser une main sur le ventre pour sentir le mouvement.

Pas besoin que ce soit parfait : l'important, c'est de ralentir. Quelques respirations valent mieux qu'aucune.$a$,
  'Kitoo', 'Rédigé et validé par des professionnels de santé', '4 min', '{1,2,3}'
),
(
  'charge-des-etudes',
  'Gérer la charge des études',
  'Organiser son énergie (pas seulement son temps) pour étudier sans s''épuiser.',
  'etudes', 'article', 'article',
  $a$Quand tout s'accumule - cours, examens, attentes - le cerveau sature. Étudier mieux, ce n'est pas étudier plus, c'est protéger ton énergie.

## Découpe et priorise
Une grande tâche fait peur ; une petite est faisable. Découpe en étapes concrètes et commence par la première, même imparfaite.

- Choisis 1 à 3 priorités par jour, pas dix.
- Travaille par sessions courtes avec de vraies pauses (par ex. 25/5).

## Protège ton énergie
- Le sommeil et les repas ne sont pas du temps perdu : ils sont le carburant.
- Alterne les matières pour éviter la lassitude.

## Tu n'es pas tes notes
Une note mesure un travail à un instant, pas ta valeur. Demander de l'aide - à un proche, un tuteur, un service de soutien étudiant - est un signe de maturité.

Si la pression devient trop lourde, des lignes d'écoute existent. Tu n'as pas à tenir seul·e.$a$,
  'Kitoo', 'Rédigé et validé par des professionnels de santé', '6 min', '{2,3}'
);

-- Médias (références externes - URLs à VÉRIFIER avant mise en ligne).
insert into public.resources
  (slug, title, summary, theme, type, format, content, url, source, author_or_validation, duration, mood_levels)
values
(
  'video-coherence-cardiaque',
  'Cohérence cardiaque : séance guidée',
  'Une courte séance guidée pour pratiquer la respiration en cohérence cardiaque, à suivre les yeux ouverts ou fermés.',
  'respiration', 'video', 'video', '',
  'https://www.youtube.com/results?search_query=coherence+cardiaque+guidee+5+minutes',
  'YouTube', 'Référence externe à vérifier', '5 min', '{1,2,3}'
),
(
  'podcast-emotions',
  'Émotions - le podcast',
  'Un podcast qui explore nos émotions avec justesse et douceur : utile pour mettre des mots sur ce que tu ressens.',
  'anxiete', 'podcast', 'podcast', '',
  'https://louiemedia.com',
  'Louie Media', 'Référence externe à vérifier', '~30 min', '{2,3,4}'
);

-- Liens utiles (ressources officielles francophones - à VÉRIFIER).
insert into public.resources
  (slug, title, summary, theme, type, format, content, url, source, mood_levels)
values
(
  'lien-3114', '3114 - Prévention du suicide',
  'Numéro national de prévention du suicide : écoute professionnelle, gratuite et confidentielle, 24h/24.',
  'ecoute', 'lien', 'lien', '', 'https://3114.fr', '3114', '{1,2,3,4,5}'
),
(
  'lien-fil-sante-jeunes', 'Fil Santé Jeunes',
  'Écoute, information et orientation pour les jeunes (santé, mal-être). Anonyme et gratuit.',
  'ecoute', 'lien', 'lien', '', 'https://www.filsantejeunes.com', 'Fil Santé Jeunes', '{1,2,3,4,5}'
),
(
  'lien-nightline', 'Nightline (étudiant·es)',
  'Ligne d''écoute nocturne par et pour les étudiant·es, anonyme et sans jugement.',
  'ecoute', 'lien', 'lien', '', 'https://www.nightline.fr', 'Nightline France', '{1,2,3,4,5}'
),
(
  'lien-psycom', 'Psycom - s''informer',
  'Information fiable sur la santé mentale : troubles, soins, droits, où s''adresser.',
  'information', 'lien', 'lien', '', 'https://www.psycom.org', 'Psycom', '{1,2,3,4,5}'
),
(
  'lien-spf', 'Santé publique France',
  'Ressources officielles et campagnes sur la santé mentale et le bien-être.',
  'information', 'lien', 'lien', '', 'https://www.santepubliquefrance.fr', 'Santé publique France', '{1,2,3,4,5}'
);
