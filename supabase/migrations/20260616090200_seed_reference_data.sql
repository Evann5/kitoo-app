-- Kitoo — données de référence (seed). Idempotent : ré-exécutable sans doublon.

-- Tags d'humeur prédéfinis (libellés FR).
insert into public.mood_tags (slug, label) values
  ('stress',     'Stress'),
  ('fatigue',    'Fatigue'),
  ('joie',       'Joie'),
  ('anxiete',    'Anxiété'),
  ('motivation', 'Motivation'),
  ('sommeil',    'Sommeil'),
  ('solitude',   'Solitude'),
  ('gratitude',  'Gratitude'),
  ('colere',     'Colère'),
  ('serenite',   'Sérénité')
on conflict (slug) do nothing;

-- Ressources bien-être de démonstration. Seedées seulement si la table est vide.
insert into public.resources (title, theme, type, summary, content, mood_levels)
select * from (values
  (
    'Respirer en carré',
    'stress', 'exercice',
    'Une respiration simple pour apaiser le système nerveux en 2 minutes.',
    E'La respiration carrée se pratique en quatre temps égaux.\n\n1. Inspire par le nez pendant 4 secondes.\n2. Retiens ton souffle 4 secondes.\n3. Expire doucement 4 secondes.\n4. Garde les poumons vides 4 secondes.\n\nRépète 4 à 6 cycles. À refaire dès que la tension monte.',
    array[1, 2, 3]
  ),
  (
    'Poser ses pensées avant de dormir',
    'sommeil', 'conseil',
    'Un petit rituel d''écriture pour libérer l''esprit le soir.',
    E'Avant de te coucher, note sur papier les trois choses qui occupent ton esprit, puis une seule petite action pour demain.\n\nL''idée n''est pas de tout résoudre, mais de déposer la charge mentale ailleurs que dans ta tête, pour laisser le sommeil venir.',
    array[1, 2, 3]
  ),
  (
    'La règle des cinq sens',
    'stress', 'exercice',
    'Un ancrage rapide pour revenir au présent quand l''anxiété monte.',
    E'Observe autour de toi :\n\n- 5 choses que tu vois,\n- 4 que tu peux toucher,\n- 3 que tu entends,\n- 2 que tu sens,\n- 1 que tu goûtes.\n\nCet exercice ramène doucement l''attention dans l''instant présent.',
    array[1, 2]
  ),
  (
    'Trois petites victoires',
    'confiance', 'exercice',
    'Renforcer la confiance en repérant ce qui a marché aujourd''hui.',
    E'Chaque soir, écris trois choses que tu as réussies dans la journée, même minuscules : t''être levé, avoir aidé quelqu''un, avoir tenu une promesse.\n\nAvec le temps, ton cerveau apprend à remarquer le positif autant que le négatif.',
    array[2, 3, 4]
  ),
  (
    'Bouger cinq minutes',
    'stress', 'conseil',
    'Le mouvement court comme soupape rapide.',
    E'Pas besoin d''une séance de sport. Cinq minutes suffisent : marche, étire-toi, danse sur une chanson.\n\nLe mouvement aide à évacuer les hormones du stress et relance l''énergie quand tout semble lourd.',
    array[2, 3]
  ),
  (
    'Cultiver la gratitude',
    'confiance', 'article',
    'Pourquoi noter ce qui va bien change le regard sur la journée.',
    E'La gratitude n''ignore pas les difficultés : elle équilibre le regard.\n\nEn notant régulièrement ce pour quoi tu es reconnaissant — une personne, un moment, un détail — tu entraînes ton attention à voir aussi le bon. C''est l''une des pratiques les mieux documentées pour le bien-être.',
    array[3, 4, 5]
  ),
  (
    'Parler à quelqu''un de confiance',
    'relations', 'conseil',
    'Briser l''isolement, même par un simple message.',
    E'Quand le moral est bas, l''isolement aggrave souvent les choses.\n\nÉcris à une personne en qui tu as confiance, même un court message. Tu n''as pas besoin d''avoir « quelque chose d''important » à dire : le lien compte plus que le contenu.',
    array[1, 2, 3]
  ),
  (
    'Savourer un bon moment',
    'confiance', 'exercice',
    'Prolonger volontairement une émotion agréable.',
    E'Quand tu vis un moment agréable, ralentis quelques secondes pour vraiment le remarquer : les sensations, les couleurs, ce que tu ressens.\n\nSavourer consciemment les bons moments les rend plus présents et plus durables en mémoire.',
    array[4, 5]
  )
) as seed(title, theme, type, summary, content, mood_levels)
where not exists (select 1 from public.resources);
