
# Securi-api

Securi-api est une API créée dans le cadre d'un test technique pour la société La Mètis. Elle permet de gérer des projets et des analyses associés, avec un système d'authentification par JWT et des droits spécifiques d'écriture/lecture liées à l'utilisateur.

## Prérequis

Avant de commencer, vous devez avoir installé les outils suivants sur votre machine :

- [Node.js](https://nodejs.org/) (version 14.x ou supérieure)
- [npm](https://www.npmjs.com/) (qui est installé avec Node.js)
- [Prisma](https://www.prisma.io/) pour la gestion de la base de données


## Choix techniques  

- 2 modules séparés permettent de gérer la logique des analyses et des projets. Chaque module contient un controlleur qui gère les requêtes, un service qui applique la logique métier et un repository qui sert d'interface avec l'ORM.

- Les éléments de logique utilisés par plusieurs fonctions sont partagés à travers les utils.

- L'authentification JWT et les erreurs sont gérés par des middleware

- Les erreurs sont captées et enregistrées.


## Installation


### 1. Installez les dépendances.

```bash
npm install
```

### 2. Générez le "secret" client

```bash
npm run generate-secret
```

Puis jouter le secret dans votre .env

### 3. Configurez la base de données en exécutant la commande suivante pour effectuer les migrations et générer le client.

```bash
npm run db:init 
```

### 4. Lancez le serveur local.

```bash
npm run dev
```

Bravo, l'app est initialisée.
Pour aller plus loin : 

### 1. Remplissez la base de données avec des données fictives

```bash
npm run db:seed 
```

### 2. Ouvrez Prisma Studio pour inspecter la base de données et les relations

```bash
npm run db:preview
```

### 3. Générez un JWT pour tester les routes de l'API depuis Insomnia ou Postman

```bash
npm run generate-jwt {id}
```
{id} doit correspondre à un utilisateur existant dans la base de données.
Ce JWT est à passer dans le header de vos requêtes.


### 4. Réinitialisez la base de donnée à 0

```bash
npm run db:reset
```

## Tests automatisés

Nous utilisons 2 tpyes de test.
Les tests unitaires qui valident le fonctionnement de fonctions individuelles
Les tests d'intégration qui valident des scénarios impliquant plusieurs fonctions.

Pour commencer : 

### 1. Initialisation de la base de donnée de test

```bash
npm run db:test
```

### 2. Vérifiez que la base de données de test a été remplie

```bash
npm run db:test:preview
```

Pour lancer les tests automatisés : 

### 1. Lancer les tests unitaires du module projets

```bash
npm run test:unit:projects
```

### 2. Lancer les tests unitaires du module analyses

```bash
npm run test:unit:analysis
```

### 3. Lancer tous les tests unitaires

```bash
npm run test:unit
```

### 4. Lancer les tests d'intégration du module projets

```bash
npm run test:inte:projects
```

### 5. Lancer les tests d'intégration du module analyses

```bash
npm run test:inte:analysis
```

### 6. Lancer tous les tests d'intégration

```bash
npm run test:inte
```

### 7. Lancer tous les tests

```bash
npm run test

```


## Routes de l'API

### `GET /projects/`

Retourne la liste des projets accessibles par l'utilisateur connecté.

#### Réponse
```json
[
  {
    "id": 1,
    "name": "Project 1"
  },
  {
    "id": 2,
    "name": "Project 2"
  },
]
```

### `GET /projects/:id`

Retourne un projet spécifique en fonction de son ID.

#### Réponse
```json
{
  "id": 2,
  "name": "Project 2
}
```

### `POST /projects/`

Crée un nouveau projet et retourne l'objet du projet.

#### Corps de la requête
```json
{
  "name": "projet 3",
  "projectAccess": [1,2]
}
```

#### Réponse
```json
{
  "id": 3,
  "name": "projet 3"
}
```

### `GET /projects/:projectId/analyses`

Retourne la liste des analyses pour un projet donné.

#### Réponse
```json
[
  {
    "id": 1,
    "name": "Analyse 1"
  },
  {
    "id": 2,
    "name": "Analyse 2"
  }
]
```

### `GET /projects/:projectId/analyses/:analysisId`

Retourne une analyse spécifique d'un projet.

#### Réponse
```json
{
  "id": 2,
  "name": "Analyse 2"
}
```

### `POST /projects/:projectId/analyses`

Crée une analyse pour un projet donné et retourne l'objet de l'analyse

#### Corps de la requête
```json
{
  "name": "analyse 3"
}
```

#### Réponse
```json
{
  "id": 3,
  "name": "Analyse 3"
}
```

## Configuration de la Base

Le fichier de configuration Prisma définit la source de données et le générateur de client :

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

## Modèles et Relations

### 1. User (TABLE USERS)
- **Champs :**
  - `id`: Identifiant unique auto-incrémenté.
  - `username`: Nom d'utilisateur unique (mappé à `username` en base).
  - `email`: Adresse email unique.
  - `isAdmin`: Indique si l'utilisateur est administrateur (par défaut `false`, mappé à `is_admin`).
  - `createdAt` et `updatedAt`: Dates de création et de mise à jour.
- **Relations :**
  - **UserRole** : Relation un-à-un (chaque utilisateur a un rôle global).
  - **ProjectAccess** : Accès aux projets.
  - **createdProjects** : Projets créés par l'utilisateur.
  - **createdAnalyses** : Analyses créées par l'utilisateur.

### 2. Role (TABLE DES ROLES)
- **Champs :**
  - `id`: Identifiant unique auto-incrémenté.
  - `name`: Nom du rôle, unique.
- **Relations :**
  - **RolePermission** : Permissions associées au rôle.
  - **UserRole** : Association entre utilisateurs et rôles.

### 3. Permission (TABLE PERMISSIONS)
- **Champs :**
  - `id`: Identifiant unique auto-incrémenté.
  - `name`: Nom de la permission, unique.
  - `category`: Catégorie de la permission.
- **Relations :**
  - **RolePermission** : Association entre rôles et permissions.

### 4. UserRole (RELATION UTILISATEURS ⇔ ROLES)
- **Fonctionnalité :**
  - Associe un utilisateur à un rôle global.
- **Contraintes :**
  - Chaque utilisateur peut avoir un seul rôle global.
  - Clé primaire composée sur `userId` et `roleId`.

### 5. Project (TABLE PROJECTS)
- **Champs :**
  - `id`: Identifiant unique auto-incrémenté.
  - `name`: Nom du projet (mappé à `name` en base).
  - `createdBy`: Identifiant de l'utilisateur ayant créé le projet.
  - `createdAt` et `updatedAt`: Dates de création et de mise à jour.
- **Relations :**
  - **creator** : L'utilisateur qui a créé le projet (relation nommée `"ProjectCreator"`).
  - **analyses** : Liste des analyses associées au projet.
  - **projectAccess** : Accès au projet pour différents utilisateurs.

### 6. Analysis (TABLE ANALYSES)
- **Champs :**
  - `id`: Identifiant unique auto-incrémenté.
  - `name`: Nom de l'analyse.
  - `projectId`: Identifiant du projet associé.
  - `createdBy`: Identifiant de l'utilisateur ayant créé l'analyse.
  - `createdAt` et `updatedAt`: Dates de création et de mise à jour.
- **Relations :**
  - **project** : Projet associé à l'analyse.
  - **creator** : Utilisateur qui a créé l'analyse (relation nommée `"AnalysisCreator"`).

### 7. ProjectAccess (RELATION UTILISATEURS - PROJETS)
- **Fonctionnalité :**
  - Gère les accès des utilisateurs aux projets.
- **Contraintes :**
  - Clé primaire composée sur `userId` et `projectId`.

### 8. RolePermission (RELATION ROLES - PERMISSIONS)
- **Fonctionnalité :**
  - Associe les rôles aux permissions.
- **Contraintes :**
  - Clé primaire composée sur `roleId` et `permissionId`.


## Rôles et Droits d'Accès

### 1. Administrateur

- **Création :**
  - Peut créer des projets.
  - Peut créer des analyses.
- **Accès :**
  - Accède à **tous** les projets et analyses, y compris ceux des autres utilisateurs.

### 2. Manageur

- **Création :**
  - Peut créer des projets.
  - Peut créer des analyses **seulement** sur les projets dont il est propriétaire.
- **Accès :**
  - Peut lire **uniquement** les projets et analyses dont il est propriétaire ou pour lesquels un accès lui a été **explicitement accordé**.

### 3. Lecteur

- **Accès :**
  - Peut uniquement lire les projets et analyses pour lesquels un accès lui a été **accordé**.



## Améliorations

- pagination des résultats de liste
- utilisation d'UUID
- CRUD complet 
- Génération statique des autorisations 
- Ajout de l'entité User
- Implémentation du register/login 

