# 🤖 AI Handler — DaDa:bit + WonderCam

> Robot autonome de tri et de transport de cubes colorés par vision artificielle et suivi de ligne.  
> Plateforme : **DaDa:bit** · Caméra IA : **WonderCam** · Langage : **MakeCode TypeScript**

---

## 📋 Table des matières

- [Description du projet](#-description-du-projet)
- [Matériel requis](#-matériel-requis)
- [Architecture du code](#-architecture-du-code)
- [Algorithme principal](#-algorithme-principal)
- [Variables de configuration](#-variables-de-configuration)
- [API — Blocs disponibles](#-api--blocs-disponibles)
- [Utilisation (main.ts)](#-utilisation-maints)
- [Calibration](#-calibration)
- [Dépannage](#-dépannage)
- [Licence](#-licence)

---

## 📌 Description du projet

Pendant le suivi de ligne, si la **WonderCam** reconnaît la couleur **ID1**, le robot :

1. S'approche du cube en continuant le suivi de ligne
2. Saisit le cube avec son bras et sa pince
3. Transporte le cube jusqu'à la destination (croix détectée par les 4 capteurs de ligne)
4. Dépose le cube, recule, effectue un demi-tour et reprend le suivi de ligne

> ⚠️ **Remarque** : Assurez-vous que la WonderCam est dans un environnement bien éclairé et qu'aucune couleur similaire à l'ID cible n'est présente en arrière-plan.

---

## 🔧 Matériel requis

| Composant | Rôle |
|---|---|
| DaDa:bit | Contrôleur principal (micro:bit) |
| WonderCam | Module de vision IA (I2C) |
| Servo 360° × 4 (ports 1–4) | Roues de déplacement |
| Servo 270° (port 5) | Bras robotique |
| Servo 270° (port 6) | Pince |
| Capteur de ligne × 4 (S1–S4) | Suivi de ligne & détection destination |

---

## 🗂️ Architecture du code

```
📦 ai-handler-dadabit/
├── main.ts                  ← Programme principal (boucle infinie)
├── msmSmartTools.ts         ← Extension MSM Smart Tools (namespace)
└── README.md
```

Le namespace `msmSmartTools` est organisé en **6 groupes de blocs** :

| Groupe | Rôle |
|---|---|
| `Réglages` | Paramétrage des vitesses, vision, bras, pince, seuils |
| `Mouvements` | Avancer, reculer, tourner, arrêter |
| `Suivi de ligne` | Logique de suivi et détection d'arrivée |
| `Vision` | Détection stable de cube, approche |
| `Manipulation` | Attraper et déposer le cube |
| `Mission` | Cycle complet, gestion destination, bip |

---

## 🧠 Algorithme principal

```
┌─ INITIALISATION ──────────────────────────────┐
│  • Bras en position haute                      │
│  • Pince ouverte                               │
│  • modeMission ← 0  (mode recherche)           │
│  • compteurStable ← 0                          │
└───────────────────────────────────────────────┘
            ↓
┌─ BOUCLE INFINIE ──────────────────────────────┐
│                                               │
│  wondercam.UpdateResult()                     │
│                                               │
│  ┌─ PHASE RECHERCHE (modeMission = 0) ──────┐ │
│  │  SI cube ID1 détecté stablement (>8x)    │ │
│  │    → Bip                                 │ │
│  │    → Approcher le cube (suivi de ligne)  │ │
│  │    → Attraper le cube                    │ │
│  │    → modeMission ← 1                     │ │
│  └──────────────────────────────────────────┘ │
│                                               │
│  ┌─ PHASE TRANSPORT / DÉPÔT ───────────────┐  │
│  │  SI S1 & S2 & S3 & S4 (croix)           │  │
│  │    → Arrêter                             │  │
│  │    → SI modeMission=1 : Déposer cube     │  │
│  │    → Reculer → Demi-tour → Reprendre     │  │
│  └──────────────────────────────────────────┘  │
│                                               │
│  ┌─ SUIVI DE LIGNE (cas par défaut) ───────┐  │
│  │  S2 & S3        → avancer               │  │
│  │  S1 & S2        → tourner gauche        │  │
│  │  S3 & S4        → tourner droite        │  │
│  │  autres cas     → corrections fines     │  │
│  └──────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
```

---

## ⚙️ Variables de configuration

Toutes les variables sont accessibles via les blocs du groupe **Réglages** :

| Variable | Valeur défaut | Description |
|---|---|---|
| `vitesseToutDroit` | `55` | Vitesse en ligne droite |
| `vitesseCorrection` | `44` | Vitesse lors des corrections de trajectoire |
| `petiteVitesse` | `33` | Vitesse pour corrections fines |
| `ID_CUBE` | `1` | ID couleur cible WonderCam |
| `X_MIN` / `X_MAX` | `80` / `240` | Zone de centrage horizontal (px) |
| `Y_APPROCHE` | `237` | Seuil vertical d'approche du cube (px) |
| `SEUIL_VALIDATION` | `8` | Nombre de frames stables avant action |
| `BRAS_HAUT` / `BRAS_BAS` | `-60` / `-5` | Angles servo bras (°) |
| `PINCE_OUVERTE` / `PINCE_FERMEE` | `15` / `-25` | Angles servo pince (°) |
| `PAUSE_STOP` | `500` ms | Pause après arrêt à destination |
| `PAUSE_RECUL` | `600` ms | Durée du recul après dépôt |
| `TEMPS_ATTENTE` | `800` ms | Pause entre chaque mouvement bras/pince |
| `RETOUR_DROITE` | `true` | Sens du demi-tour (`true` = droite) |

---

## 📦 API — Blocs disponibles

### 🔵 Réglages

```typescript
msmSmartTools.resetMission()
msmSmartTools.reglerVitesses(55, 44, 33)
msmSmartTools.reglerVision(1)
msmSmartTools.reglerZoneDetection(80, 240)
msmSmartTools.reglerApproche(237)
msmSmartTools.reglerBras(-60, -5)
msmSmartTools.reglerPince(15, -25)
msmSmartTools.reglerSeuil(8)
msmSmartTools.reglerPauseStop(500)
msmSmartTools.reglerPauseRecul(600)
msmSmartTools.reglerPauseAttente(800)
msmSmartTools.reglerSensRetour(true)
```

### 🚗 Mouvements

```typescript
msmSmartTools.avancer(50)
msmSmartTools.reculer(50)
msmSmartTools.tournerAGauche(40)
msmSmartTools.tournerADroite(40)
msmSmartTools.arreterRobot()
```

### 📡 Suivi de ligne

```typescript
msmSmartTools.suiviDeLigne()       // applique la logique S1–S4
msmSmartTools.arriveeDetectee()    // true si S1&&S2&&S3&&S4
```

### 👁️ Vision

```typescript
msmSmartTools.cubeDetecteStable()  // true après SEUIL_VALIDATION frames
msmSmartTools.approcherCube()      // avance vers le cube jusqu'à Y_APPROCHE
```

### 🦾 Manipulation

```typescript
msmSmartTools.attraperCube()       // descend bras → ferme pince → remonte
msmSmartTools.deposerCube()        // descend bras → ouvre pince → remonte
```

### 🎯 Mission

```typescript
msmSmartTools.nePortePasCube()     // true si modeMission == 0
msmSmartTools.jouerBip()           // bip sonore (Do, 1 beat)
msmSmartTools.destination()        // stop → dépôt → recul → demi-tour
msmSmartTools.cycleMission()       // cycle complet en 1 appel (à mettre en boucle)
```

---

## 🚀 Utilisation (main.ts)

### Option A — Utilisation du cycle tout-en-un (recommandé)

```typescript
msmSmartTools.resetMission()

basic.forever(function () {
    msmSmartTools.cycleMission()
})
```

### Option B — Contrôle manuel étape par étape

```typescript
msmSmartTools.resetMission()

basic.forever(function () {
    wondercam.UpdateResult()

    if (msmSmartTools.nePortePasCube() && msmSmartTools.cubeDetecteStable()) {
        msmSmartTools.arreterRobot()
        msmSmartTools.jouerBip()
        msmSmartTools.approcherCube()
        msmSmartTools.attraperCube()
    }

    if (msmSmartTools.arriveeDetectee()) {
        msmSmartTools.destination()
    } else {
        msmSmartTools.suiviDeLigne()
    }
})
```

---

## 🎛️ Calibration

### 1. Calibrer la WonderCam
Entraîner la couleur cible sous **Color Recognition** dans l'interface WonderCam et noter l'ID (défaut : `1`).

### 2. Ajuster la zone de détection X
Observer la valeur X retournée par `wondercam.XOfColorId(Pos_X, ID)` au centre de l'image.  
Ajuster `X_MIN` et `X_MAX` pour centrer la détection (défaut : `80`–`240` sur 320 px).

### 3. Ajuster Y_APPROCHE
Valeur Y à partir de laquelle le robot est assez proche pour saisir.  
Tester en incrémentant depuis `220` jusqu'à `237` selon la hauteur réelle de la pince.

### 4. Calibrer les servos bras et pince
Tester `BRAS_HAUT`, `BRAS_BAS`, `PINCE_OUVERTE`, `PINCE_FERMEE` manuellement via les blocs de réglage.

### 5. Calibrer le demi-tour
Si le robot ne retrouve pas la ligne après dépôt : inverser `RETOUR_DROITE` ou ajuster `PAUSE_RECUL`.

---

## 🔍 Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| Robot ne détecte pas le cube | Mauvais éclairage ou ID incorrect | Vérifier l'entraînement WonderCam, régler `ID_CUBE` |
| Robot s'arrête sans saisir | `Y_APPROCHE` trop faible | Augmenter `Y_APPROCHE` (max 239) |
| Pince n'attrape pas | Angles mal calibrés | Ajuster `BRAS_BAS` et `PINCE_FERMEE` |
| Robot ne retrouve pas la ligne | Sens demi-tour incorrect | Inverser `RETOUR_DROITE` ou augmenter `PAUSE_RECUL` |
| Faux positifs de détection | `SEUIL_VALIDATION` trop bas | Augmenter `SEUIL_VALIDATION` (ex : 12) |
| Suivi de ligne instable | Vitesses trop élevées | Réduire `vitesseToutDroit` et `vitesseCorrection` |

---

## 📄 Licence

Ce projet est distribué sous licence **MIT**.  
Réalisé dans le cadre du projet pédagogique **MSM Smart Tools** — DaDa:bit AI Handler.
