# msmdadabit — MSM Smart Tools (DaDa:bit + WonderCam)

Extension MakeCode (micro:bit) pour le robot **DaDa:bit** (Hiwonder) avec la **WonderCam**, dédiée au projet **MSM Smart Tools** :
- **Suivi de ligne** (4 capteurs S1–S4) — robuste et testé
- **Mouvements** (avancer / reculer / tourner gauche / tourner droite / arrêter)
- **Manipulation** (attraper / déposer via bras + pince servos)
- **Vision** (détection stable couleur ID + approche par seuil Y)
- **Mission** (cycle automatique : détecter → attraper → livrer → déposer)
- **Réglages** (vitesses, vision, reset mission)

---

## ✅ Installation (MakeCode)

1. Ouvre MakeCode micro:bit
2. **Extensions** → colle l'URL du dépôt :
   - `https://github.com/Elmahni17974175/msmdadabit`
3. Valide, puis tu verras les blocs **MSM Smart Tools** dans la boîte à outils.

---

## 🧩 Blocs disponibles (groupes)

Les blocs sont rangés en 6 groupes dans MakeCode.

---

### 1) Mouvements

| Bloc | Description |
|------|-------------|
| `avancer à vitesse v` | Avance les 4 roues à la vitesse donnée |
| `reculer à vitesse v` | Recule les 4 roues à la vitesse donnée |
| `tourner à gauche vitesse v` | Pivote sur place vers la gauche |
| `tourner à droite vitesse v` | Pivote sur place vers la droite |
| `arrêter le robot` | Stoppe les 4 moteurs |

---

### 2) Suivi de ligne

| Bloc | Description |
|------|-------------|
| `suivre la ligne` | Lecture des 4 capteurs et correction automatique de trajectoire |
| `arrivée détectée ?` | Retourne `vrai` si les 4 capteurs S1–S4 sont sur le noir (intersection) |

**Logique de suivi :**
- S2 + S3 sur noir → avancer à `vitesseToutDroit`
- S1 sur noir → corriger vers la gauche à `vitesseCorrection`
- S4 sur noir → corriger vers la droite à `vitesseCorrection`
- Sinon → avancer à `petiteVitesse`

---

### 3) Vision

| Bloc | Description |
|------|-------------|
| `cube détecté de façon stable ?` | Retourne `vrai` si le cube (ID configuré) est détecté pendant `SEUIL_VALIDATION` frames consécutives |
| `approcher le cube` | Suit la ligne tout en se rapprochant jusqu'à ce que `Y ≥ Y_APPROCHE` (timeout 200 cycles) |

**Valeurs par défaut :**
- `ID_CUBE` = 1
- `Y_APPROCHE` = 237
- `SEUIL_VALIDATION` = 8 frames

---

### 4) Manipulation

| Bloc | Description |
|------|-------------|
| `attraper le cube` | Arrête le robot → bras en bas → ferme la pince → bras en haut → `modeMission = 1` |
| `déposer le cube` | Bras en bas → ouvre la pince → bras en haut → `modeMission = 0` |

**Positions par défaut (servos 270°) :**

| Variable | Valeur | Description |
|----------|--------|-------------|
| `BRAS_HAUT` | -60 | Angle servo 5 — bras levé |
| `BRAS_BAS` | -5 | Angle servo 5 — bras abaissé |
| `PINCE_OUVERTE` | 15 | Angle servo 6 — pince ouverte |
| `PINCE_FERMEE` | -25 | Angle servo 6 — pince fermée |
| `TEMPS_MOUVEMENT` | 500 ms | Durée de déplacement servo |
| `TEMPS_ATTENTE` | 800 ms | Pause après chaque action |

---

### 5) Mission

| Bloc | Description |
|------|-------------|
| `ne porte pas de cube ?` | Retourne `vrai` si `modeMission == 0` |
| `bip` | Joue un bip sonore (Do, noire) |
| `gérer la destination` | Arrête → dépose si `modeMission == 1` → tourne à droite jusqu'à détecter S3+S4 sur noir |
| `cycle mission` | Enchaîne détection, approche, saisie, suivi de ligne et gestion de destination |

**Logique du `cycle mission` :**
1. Si `modeMission == 0` et cube détecté de façon stable → bip → approcher → attraper
2. Si `arrivée détectée` → gérer la destination
3. Sinon → suivre la ligne

---

### 6) Réglages

| Bloc | Description |
|------|-------------|
| `régler vitesses v1 v2 v3` | Définit `vitesseToutDroit`, `vitesseCorrection`, `petiteVitesse` |
| `régler vision ID id` | Change l'ID couleur cible et remet le compteur stable à 0 |
| `initialiser la mission` | Dépose le cube si porté et remet `modeMission = 0` |

**Valeurs par défaut des vitesses :**

| Variable | Valeur |
|----------|--------|
| `vitesseToutDroit` | 55 |
| `vitesseCorrection` | 44 |
| `petiteVitesse` | 33 |

---

## 🧠 Exemple complet : AI Handler (Caméra + Ligne + Dépôt)

### 🎯 Objectif
Le robot :
1. Suit la ligne en permanence
2. Détecte le cube (Couleur ID1) de façon stable
3. Approche l'objet (seuil Y caméra)
4. Attrape le cube
5. Continue de suivre la ligne jusqu'à l'intersection (S1+S2+S3+S4 sur noir)
6. Dépose le cube et se recale sur la ligne
7. Recommence

### ✅ Code (TypeScript) équivalent

```typescript
// Réglages initiaux (optionnel)
msmSmartTools.reglerVitesses(55, 44, 33)
msmSmartTools.reglerVision(1)

basic.forever(function () {
    msmSmartTools.cycleMission()
    basic.pause(10)
})
```

### ✅ Utilisation des blocs individuels (contrôle manuel)

```typescript
// Initialisation
msmSmartTools.resetMission()

basic.forever(function () {

    // Phase 0 : chercher et attraper
    if (msmSmartTools.nePortePasCube()) {
        if (msmSmartTools.cubeDetecteStable()) {
            msmSmartTools.jouerBip()
            msmSmartTools.approcherCube()
            msmSmartTools.attraperCube()
        } else {
            msmSmartTools.suiviDeLigne()
        }
    }

    // Phase 1 : livrer
    if (!msmSmartTools.nePortePasCube()) {
        if (msmSmartTools.arriveeDetectee()) {
            msmSmartTools.destination()
        } else {
            msmSmartTools.suiviDeLigne()
        }
    }

    basic.pause(10)
})
```

---

## ⚙️ Dépendances

```json
{
  "core": "*",
  "microbit": "*",
  "dadabit": "github:hiwonder/DaDabit"
}
```

La bibliothèque **WonderCam** (`wondercam`) est utilisée en interne pour la détection couleur — elle doit être disponible dans l'environnement MakeCode via le package `dadabit`.
