//% color=#0EA5E9 icon="\uf02d" block="MSM Smart Tools"
//% groups='["Settings","Movements","Line following","Vision","Handling","Mission"]'
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
    let TEMPS_ATTENTE = 800

    let PAUSE_STOP = 500        // pause après arrêt à destination
    let PAUSE_RECUL = 600       // ← valeur calibrée qui fonctionne bien
    let RETOUR_DROITE = true    // ← droite = sens qui fonctionne bien

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

    //% block="set speeds v1 %v1 v2 %v2 v3 %v3"
    //% block.loc.fr="régler vitesses v1 %v1 v2 %v2 v3 %v3"
    //% v1.defl=55
    //% v2.defl=44
    //% v3.defl=33
    //% group="Settings"
    export function reglerVitesses(v1: number, v2: number, v3: number): void {
        vitesseToutDroit = v1
        vitesseCorrection = v2
        petiteVitesse = v3
    }

    //% block="set vision ID %id"
    //% block.loc.fr="régler vision ID %id"
    //% id.defl=1
    //% group="Settings"
    export function reglerVision(id: number): void {
        ID_CUBE = id
        compteurStable = 0
    }

    //% block="set detection zone X_min %xMin X_max %xMax"
    //% block.loc.fr="régler zone détection X_min %xMin X_max %xMax"
    //% xMin.defl=80
    //% xMax.defl=240
    //% group="Settings"
    export function reglerZoneDetection(xMin: number, xMax: number): void {
        X_MIN = xMin
        X_MAX = xMax
    }

    //% block="set approach distance Y %yApproche"
    //% block.loc.fr="régler distance approche Y %yApproche"
    //% yApproche.defl=237
    //% group="Settings"
    export function reglerApproche(yApproche: number): void {
        if (yApproche > 239) yApproche = 239
        if (yApproche < 0)   yApproche = 0
        Y_APPROCHE = yApproche
    }

    //% block="set arm up %brasHaut down %brasBas"
    //% block.loc.fr="régler bras haut %brasHaut bas %brasBas"
    //% brasHaut.defl=-60
    //% brasBas.defl=-5
    //% group="Settings"
    export function reglerBras(brasHaut: number, brasBas: number): void {
        BRAS_HAUT = brasHaut
        BRAS_BAS = brasBas
    }

    //% block="set gripper open %pinceOuverte closed %pinceFermee"
    //% block.loc.fr="régler pince ouverte %pinceOuverte fermée %pinceFermee"
    //% pinceOuverte.defl=15
    //% pinceFermee.defl=-25
    //% group="Settings"
    export function reglerPince(pinceOuverte: number, pinceFermee: number): void {
        PINCE_OUVERTE = pinceOuverte
        PINCE_FERMEE = pinceFermee
    }

    //% block="set validation threshold %seuil"
    //% block.loc.fr="régler seuil de validation %seuil"
    //% seuil.defl=8
    //% group="Settings"
    export function reglerSeuil(seuil: number): void {
        SEUIL_VALIDATION = seuil
        compteurStable = 0
    }

    //% block="set destination stop pause %ms ms"
    //% block.loc.fr="régler pause stop destination %ms ms"
    //% ms.defl=500
    //% group="Settings"
    export function reglerPauseStop(ms: number): void {
        PAUSE_STOP = ms
    }

    //% block="set reverse pause %ms ms"
    //% block.loc.fr="régler pause recul %ms ms"
    //% ms.defl=600
    //% group="Settings"
    export function reglerPauseRecul(ms: number): void {
        PAUSE_RECUL = ms
    }

    //% block="set arm-gripper wait time %ms ms"
    //% block.loc.fr="régler pause attente bras-pince %ms ms"
    //% ms.defl=800
    //% group="Settings"
    export function reglerPauseAttente(ms: number): void {
        TEMPS_ATTENTE = ms
    }

    //% block="set U-turn direction right %droite"
    //% block.loc.fr="régler sens demi-tour droite %droite"
    //% droite.shadow="toggleYesNo"
    //% droite.defl=true
    //% group="Settings"
    // true  = droite (valeur calibrée qui fonctionne bien)
    // false = gauche
    export function reglerSensRetour(droite: boolean): void {
        RETOUR_DROITE = droite
    }

    //% block="initialize mission"
    //% block.loc.fr="initialiser la mission"
    //% group="Settings"
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

    //% block="move forward at speed %v"
    //% block.loc.fr="avancer à vitesse %v"
    //% v.defl=50
    //% group="Movements"
    export function avancer(v: number): void {
        dadabit.setLego360Servo(1, sensGauche, v)
        dadabit.setLego360Servo(2, sensDroite, v)
        dadabit.setLego360Servo(3, sensGauche, v)
        dadabit.setLego360Servo(4, sensDroite, v)
    }

    //% block="move backward at speed %v"
    //% block.loc.fr="reculer à vitesse %v"
    //% v.defl=50
    //% group="Movements"
    export function reculer(v: number): void {
        dadabit.setLego360Servo(1, sensDroite, v)
        dadabit.setLego360Servo(2, sensGauche, v)
        dadabit.setLego360Servo(3, sensDroite, v)
        dadabit.setLego360Servo(4, sensGauche, v)
    }

    //% block="turn left at speed %v"
    //% block.loc.fr="tourner à gauche vitesse %v"
    //% v.defl=40
    //% group="Movements"
    export function tournerAGauche(v: number): void {
        dadabit.setLego360Servo(1, sensDroite, v)
        dadabit.setLego360Servo(2, sensDroite, v)
        dadabit.setLego360Servo(3, sensDroite, v)
        dadabit.setLego360Servo(4, sensDroite, v)
    }

    //% block="turn right at speed %v"
    //% block.loc.fr="tourner à droite vitesse %v"
    //% v.defl=40
    //% group="Movements"
    export function tournerADroite(v: number): void {
        dadabit.setLego360Servo(1, sensGauche, v)
        dadabit.setLego360Servo(2, sensGauche, v)
        dadabit.setLego360Servo(3, sensGauche, v)
        dadabit.setLego360Servo(4, sensGauche, v)
    }

    //% block="stop robot"
    //% block.loc.fr="arrêter le robot"
    //% group="Movements"
    export function arreterRobot(): void {
        dadabit.setLego360Servo(1, sensGauche, 0)
        dadabit.setLego360Servo(2, sensDroite, 0)
        dadabit.setLego360Servo(3, sensGauche, 0)
        dadabit.setLego360Servo(4, sensDroite, 0)
    }

    // ─────────────────────────────────────────
    // GROUPE : SUIVI DE LIGNE
    // ─────────────────────────────────────────

    //% block="follow line"
    //% block.loc.fr="suivre la ligne"
    //% group="Line following"
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

    //% block="finish line detected?"
    //% block.loc.fr="arrivée détectée ?"
    //% group="Line following"
    export function arriveeDetectee(): boolean {
        mettreAJourCapteursLigne()
        return capteur1 && capteur2 && capteur3 && capteur4
    }

    // ─────────────────────────────────────────
    // GROUPE : VISION
    // ─────────────────────────────────────────

    //% block="cube detected consistently?"
    //% block.loc.fr="cube détecté de façon stable ?"
    //% group="Vision"
    export function cubeDetecteStable(): boolean {
        return detectionStable()
    }

    //% block="approach cube"
    //% block.loc.fr="approcher le cube"
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

    //% block="pick up cube"
    //% block.loc.fr="attraper le cube"
    //% group="Handling"
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

    //% block="drop cube"
    //% block.loc.fr="déposer le cube"
    //% group="Handling"
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

    //% block="not carrying a cube?"
    //% block.loc.fr="ne porte pas de cube ?"
    //% group="Mission"
    export function nePortePasCube(): boolean {
        return modeMission == 0
    }

    //% block="beep"
    //% block.loc.fr="bip"
    //% group="Mission"
    export function jouerBip(): void {
        music.play(
            music.tonePlayable(262, music.beat(BeatFraction.Whole)),
            music.PlaybackMode.UntilDone
        )
    }

    //% block="handle destination"
    //% block.loc.fr="gérer la destination"
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
        reculer(vitesseCorrection)
        basic.pause(PAUSE_RECUL)

        // ── 4. DEMI-TOUR ─────────────────────────────────────────
        // Sens droite : S4 arrive en premier → condition souple S3||S4
        // Sens gauche : condition originale stricte S3&&S4&&!S1&&!S2
        mettreAJourCapteursLigne()
        while (capteur1 || capteur2 || !(capteur3 && capteur4)) {
            if (RETOUR_DROITE) {
                tournerADroite(vitesseCorrection)
                mettreAJourCapteursLigne()
                if (capteur3 || capteur4) { break }
            } else {
                tournerAGauche(vitesseCorrection)
                mettreAJourCapteursLigne()
            }
        }

        arreterRobot()
        basic.pause(50)
    }

    //% block="run complete mission cycle"
    //% block.loc.fr="cycle mission complet"
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