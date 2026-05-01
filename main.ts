//% color=#0EA5E9 icon="\uf02d" block="MSM Smart Tools"
//% groups='["Réglages","Mouvements","Suivi de ligne","Vision","Manipulation","Mission"]'
namespace msmSmartTools {

    // ─────────────────────────────────────────
    // VARIABLES INTERNES
    // ─────────────────────────────────────────

    let capteur1 = false
    let capteur2 = false
    let capteur3 = false
    let capteur4 = false

    let vitesseToutDroit = 55
    let vitesseCorrection = 44
    let petiteVitesse = 33

    let ID_CUBE = 1
    let X_MIN = 80
    let X_MAX = 240
    let Y_APPROCHE = 237
    let SEUIL_VALIDATION = 8
    let compteurStable = 0

    let modeMission = 0

    let BRAS_HAUT = -60
    let BRAS_BAS = -5
    let PINCE_OUVERTE = 15
    let PINCE_FERMEE = -25

    let TEMPS_MOUVEMENT = 500
    let TEMPS_ATTENTE = 800   // pause entre chaque mouvement de bras/pince

    // Paramètres temporisation destination()
    let PAUSE_STOP = 500      // pause après arrêt à destination
    let PAUSE_RECUL = 500     // durée du recul avant demi-tour

    // Sens du demi-tour : false = gauche/Counterclockwise (comportement original)
    let RETOUR_DROITE = false

    let sensGauche = dadabit.Oriention.Counterclockwise
    let sensDroite = dadabit.Oriention.Clockwise

    // ─────────────────────────────────────────
    // FONCTIONS INTERNES (privées)
    // ─────────────────────────────────────────

    function mettreAJourCapteursLigne(): void {
        capteur1 = dadabit.line_followers(dadabit.LineFollowerSensors.S1, dadabit.LineColor.Black)
        capteur2 = dadabit.line_followers(dadabit.LineFollowerSensors.S2, dadabit.LineColor.Black)
        capteur3 = dadabit.line_followers(dadabit.LineFollowerSensors.S3, dadabit.LineColor.Black)
        capteur4 = dadabit.line_followers(dadabit.LineFollowerSensors.S4, dadabit.LineColor.Black)
    }

    function brasEnHaut(): void {
        dadabit.setLego270Servo(5, BRAS_HAUT, TEMPS_MOUVEMENT)
    }

    function brasEnBas(): void {
        dadabit.setLego270Servo(5, BRAS_BAS, TEMPS_MOUVEMENT)
    }

    function ouvrirPince(): void {
        dadabit.setLego270Servo(6, PINCE_OUVERTE, TEMPS_MOUVEMENT)
    }

    function fermerPince(): void {
        dadabit.setLego270Servo(6, PINCE_FERMEE, TEMPS_MOUVEMENT)
    }

    function detectionStable(): boolean {
        let x = wondercam.XOfColorId(wondercam.Options.Pos_X, ID_CUBE)
        if (wondercam.isDetectedColorId(ID_CUBE) && x >= X_MIN && x <= X_MAX) {
            compteurStable += 1
        } else {
            compteurStable = 0
        }
        if (compteurStable >= SEUIL_VALIDATION) {
            compteurStable = 0
            return true
        }
        return false
    }

    // ─────────────────────────────────────────
    // GROUPE : RÉGLAGES
    // ─────────────────────────────────────────

    //% block="régler vitesses v1 %v1 v2 %v2 v3 %v3"
    //% v1.defl=55
    //% v2.defl=44
    //% v3.defl=33
    //% group="Réglages"
    export function reglerVitesses(v1: number, v2: number, v3: number): void {
        vitesseToutDroit = v1
        vitesseCorrection = v2
        petiteVitesse = v3
    }

    //% block="régler vision ID %id"
    //% id.defl=1
    //% group="Réglages"
    export function reglerVision(id: number): void {
        ID_CUBE = id
        compteurStable = 0
    }

    //% block="régler zone détection X_min %xMin X_max %xMax"
    //% xMin.defl=80
    //% xMax.defl=240
    //% group="Réglages"
    export function reglerZoneDetection(xMin: number, xMax: number): void {
        X_MIN = xMin
        X_MAX = xMax
    }

    //% block="régler distance approche Y %yApproche"
    //% yApproche.defl=237
    //% group="Réglages"
    export function reglerApproche(yApproche: number): void {
        if (yApproche > 239) yApproche = 239
        if (yApproche < 0)   yApproche = 0
        Y_APPROCHE = yApproche
    }

    //% block="régler bras haut %brasHaut bas %brasBas"
    //% brasHaut.defl=-60
    //% brasBas.defl=-5
    //% group="Réglages"
    export function reglerBras(brasHaut: number, brasBas: number): void {
        BRAS_HAUT = brasHaut
        BRAS_BAS = brasBas
    }

    //% block="régler pince ouverte %pinceOuverte fermée %pinceFermee"
    //% pinceOuverte.defl=15
    //% pinceFermee.defl=-25
    //% group="Réglages"
    export function reglerPince(pinceOuverte: number, pinceFermee: number): void {
        PINCE_OUVERTE = pinceOuverte
        PINCE_FERMEE = pinceFermee
    }

    //% block="régler seuil de validation %seuil"
    //% seuil.defl=8
    //% group="Réglages"
    export function reglerSeuil(seuil: number): void {
        SEUIL_VALIDATION = seuil
        compteurStable = 0
    }

    //% block="régler pause stop destination %ms ms"
    //% ms.defl=500
    //% group="Réglages"
    export function reglerPauseStop(ms: number): void {
        PAUSE_STOP = ms
    }

    //% block="régler pause recul %ms ms"
    //% ms.defl=500
    //% group="Réglages"
    export function reglerPauseRecul(ms: number): void {
        PAUSE_RECUL = ms
    }

    //% block="régler pause attente bras-pince %ms ms"
    //% ms.defl=800
    //% group="Réglages"
    export function reglerPauseAttente(ms: number): void {
        TEMPS_ATTENTE = ms
    }

    //% block="régler sens demi-tour droite %droite"
    //% droite.shadow="toggleYesNo"
    //% droite.defl=false
    //% group="Réglages"
    // false = gauche = Counterclockwise (comportement original)
    // true  = droite = Clockwise
    export function reglerSensRetour(droite: boolean): void {
        RETOUR_DROITE = droite
    }

    //% block="initialiser la mission"
    //% group="Réglages"
    export function resetMission(): void {
        modeMission = 0
        compteurStable = 0
        arreterRobot()
        brasEnHaut()
        basic.pause(500)
        ouvrirPince()
        basic.pause(500)
    }

    // ─────────────────────────────────────────
    // GROUPE : MOUVEMENTS
    // ─────────────────────────────────────────

    //% block="avancer à vitesse %v"
    //% v.defl=50
    //% group="Mouvements"
    export function avancer(v: number): void {
        dadabit.setLego360Servo(1, sensGauche, v)
        dadabit.setLego360Servo(2, sensDroite, v)
        dadabit.setLego360Servo(3, sensGauche, v)
        dadabit.setLego360Servo(4, sensDroite, v)
    }

    //% block="reculer à vitesse %v"
    //% v.defl=50
    //% group="Mouvements"
    export function reculer(v: number): void {
        dadabit.setLego360Servo(1, sensDroite, v)
        dadabit.setLego360Servo(2, sensGauche, v)
        dadabit.setLego360Servo(3, sensDroite, v)
        dadabit.setLego360Servo(4, sensGauche, v)
    }

    //% block="tourner à gauche vitesse %v"
    //% v.defl=40
    //% group="Mouvements"
    export function tournerAGauche(v: number): void {
        dadabit.setLego360Servo(1, sensDroite, v)
        dadabit.setLego360Servo(2, sensDroite, v)
        dadabit.setLego360Servo(3, sensDroite, v)
        dadabit.setLego360Servo(4, sensDroite, v)
    }

    //% block="tourner à droite vitesse %v"
    //% v.defl=40
    //% group="Mouvements"
    export function tournerADroite(v: number): void {
        dadabit.setLego360Servo(1, sensGauche, v)
        dadabit.setLego360Servo(2, sensGauche, v)
        dadabit.setLego360Servo(3, sensGauche, v)
        dadabit.setLego360Servo(4, sensGauche, v)
    }

    //% block="arrêter le robot"
    //% group="Mouvements"
    export function arreterRobot(): void {
        dadabit.setLego360Servo(1, sensGauche, 0)
        dadabit.setLego360Servo(2, sensDroite, 0)
        dadabit.setLego360Servo(3, sensGauche, 0)
        dadabit.setLego360Servo(4, sensDroite, 0)
    }

    // ─────────────────────────────────────────
    // GROUPE : SUIVI DE LIGNE
    // ─────────────────────────────────────────

    //% block="suivre la ligne"
    //% group="Suivi de ligne"
    export function suiviDeLigne(): void {
        mettreAJourCapteursLigne()

        if (capteur2 && capteur3) {
            avancer(vitesseToutDroit)
        } else if (capteur1 && capteur2 && !capteur3 && !capteur4) {
            tournerAGauche(vitesseCorrection)
        } else if (capteur3 && capteur4 && !capteur1 && !capteur2) {
            tournerADroite(vitesseCorrection)
        } else if (capteur2 && !capteur1 && !capteur3 && !capteur4) {
            tournerAGauche(petiteVitesse)
        } else if (capteur3 && !capteur1 && !capteur2 && !capteur4) {
            tournerADroite(petiteVitesse)
        } else if (capteur1 && !capteur2 && !capteur3 && !capteur4) {
            tournerAGauche(vitesseCorrection)
        } else if (capteur4 && !capteur1 && !capteur2 && !capteur3) {
            tournerADroite(vitesseCorrection)
        } else {
            avancer(petiteVitesse)
        }
    }

    //% block="arrivée détectée ?"
    //% group="Suivi de ligne"
    export function arriveeDetectee(): boolean {
        mettreAJourCapteursLigne()
        return capteur1 && capteur2 && capteur3 && capteur4
    }

    // ─────────────────────────────────────────
    // GROUPE : VISION
    // ─────────────────────────────────────────

    //% block="cube détecté de façon stable ?"
    //% group="Vision"
    export function cubeDetecteStable(): boolean {
        return detectionStable()
    }

    //% block="approcher le cube"
    //% group="Vision"
    export function approcherCube(): void {
        let timeout = 0
        while (timeout < 200) {
            wondercam.UpdateResult()
            if (!wondercam.isDetectedColorId(ID_CUBE)) {
                break
            }
            suiviDeLigne()
            let y = wondercam.XOfColorId(wondercam.Options.Pos_Y, ID_CUBE)
            if (y >= Y_APPROCHE) {
                break
            }
            timeout += 1
            basic.pause(20)
        }
    }

    // ─────────────────────────────────────────
    // GROUPE : MANIPULATION
    // ─────────────────────────────────────────

    //% block="attraper le cube"
    //% group="Manipulation"
    export function attraperCube(): void {
        arreterRobot()
        basic.pause(PAUSE_STOP)
        brasEnBas()
        basic.pause(TEMPS_ATTENTE)
        fermerPince()
        basic.pause(TEMPS_ATTENTE)
        brasEnHaut()
        basic.pause(TEMPS_ATTENTE)
        modeMission = 1
    }

    //% block="déposer le cube"
    //% group="Manipulation"
    export function deposerCube(): void {
        arreterRobot()
        brasEnBas()
        basic.pause(TEMPS_ATTENTE)
        ouvrirPince()
        basic.pause(TEMPS_ATTENTE)
        brasEnHaut()
        basic.pause(TEMPS_ATTENTE)
        modeMission = 0
    }

    // ─────────────────────────────────────────
    // GROUPE : MISSION
    // ─────────────────────────────────────────

    //% block="ne porte pas de cube ?"
    //% group="Mission"
    export function nePortePasCube(): boolean {
        return modeMission == 0
    }

    //% block="bip"
    //% group="Mission"
    export function jouerBip(): void {
        music.play(
            music.tonePlayable(262, music.beat(BeatFraction.Whole)),
            music.PlaybackMode.UntilDone
        )
    }

    // ─────────────────────────────────────────
    // destination() : fidèle au code original
    //
    // Seuls ajouts par rapport à l'original :
    //   - PAUSE_STOP  (défaut 500ms) remplace basic.pause(500) fixe
    //   - PAUSE_RECUL (défaut 500ms) remplace basic.pause(500) fixe
    //   - RETOUR_DROITE (défaut false) pour changer le sens si besoin
    // ─────────────────────────────────────────
    //% block="gérer la destination"
    //% group="Mission"
    export function destination(): void {

        // ── 1. STOP ───────────────────────────────────────────────
        arreterRobot()
        basic.pause(PAUSE_STOP)

        // ── 2. DÉPÔT DU CUBE (si modeMission = 1) ────────────────
        if (modeMission == 1) {
            deposerCube()
        }

        // ── 3. RECUL vitesse 44 pendant PAUSE_RECUL ms ───────────
        // Dans l'original : Clockwise sur tous = recul selon câblage
        reculer(vitesseCorrection)
        basic.pause(PAUSE_RECUL)

        // ── 4. DEMI-TOUR jusqu'à S3&&S4&&!S1&&!S2 ────────────────
        // Original : Counterclockwise sur tous = gauche
        // RETOUR_DROITE permet d'inverser si besoin (défaut = false = gauche)
        mettreAJourCapteursLigne()
        while (capteur1 || capteur2 || !(capteur3 && capteur4)) {
            if (RETOUR_DROITE) {
                tournerADroite(vitesseCorrection)
            } else {
                tournerAGauche(vitesseCorrection)
            }
            mettreAJourCapteursLigne()
        }

        arreterRobot()
    }

    //% block="cycle mission complet"
    //% group="Mission"
    export function cycleMission(): void {
        wondercam.UpdateResult()
        if (modeMission == 0 && cubeDetecteStable()) {
            arreterRobot()
            jouerBip()
            approcherCube()
            attraperCube()
        }
        if (arriveeDetectee()) {
            destination()
        } else {
            suiviDeLigne()
        }
    }
}
