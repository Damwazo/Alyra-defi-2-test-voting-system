# Alyra-defi-2-test-voting-system


Défi N°2 - Développeur Blockchain de l'école Alyra : Tests Unitaires du smart contract "Voting System"


Nous devons tester le smart contract créé lors du Défi N°1, pour cela nous utilisons la suite Truffle.
Le smart contract n'a pas été testé en intégralité, cependant voici les tests effectués :

- l'Administrateur du smart contract ajoute un voteur;
- l'administrateur est le seul à pouvoir ajouter un voteur;
- l'administrateur est le seul à pouvoir enregistrer les propositions des votants;
- un voteur n'est enregistré qu'une seule fois;
- l'état du smart contract doit être RegisteringVoters pour enregistrer les votants;
- ajout d'une proposition par le voter1;
- Seuls les voteurs enregistrés peuvent donner une proposition;
- Propositions enregistrés à l'état ProposalsRegistrationStarted;
- Seul l'admin lance la session de vote;
- ouverture d'une session de vote;
- Le vote d'un intrus n'est pas pris en compte;
- session de vote ouverte à l'état VotingSessionStarted;
- Un élécteur ne vote qu'une seule fois;



l'administrateur est représenté par la variable admin (il s'agit donc de l'Owner du contract),
2 votants sont enregistrés,
un intrus n'est pas enregistré dans la whitelist des voteurs.


Copyright & License
License MIT
Copyright (C) 2021 - Damien Goureau
