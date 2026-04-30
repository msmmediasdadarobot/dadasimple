//% color=#0EA5E9 icon="\uf02d" block="MSM Smart Tools"
//% groups='["Réglages","Mouvements","Suivi de ligne","Vision","Manipulation","Mission"]'
namespace msmSmartTools {

    // =========================
    // VARIABLES INTERNES
    // =========================

    // Capteurs de ligne (détectent le noir)
    let capteur1 = false
    let capteur2 = false
    let capteur3 = false
    let capteur4 = false

    // Vitesses du robot
    let vitesseToutDroit = 55
    let vitesseCorrection = 44
    let petiteVitesse = 33

    // Vision (détection du cube)
    let ID_CUBE = 1
    let Y_APPROCHE = 237
    let SEUIL_VALIDATION = 8
    let compteurStable = 0

    // État du robot (0 = vide, 1 = porte un cube)
    let modeMission = 0

    // Bras et pince
    let BRAS_HAUT = -60
    let BRAS_BAS = -5
    let PINCE_OUVERTE = 15
    let PINCE_FERMEE = -25

    let TEMPS_MOUVEMENT = 500
    let TEMPS_ATTENTE = 800

    // Sens moteurs (calibrage)
    let sensGauche = dadabit.Oriention.Counterclockwise
    let sensDroite = dadabit.Oriention.Clockwise

    // =========================
    // CAPTEURS DE LIGNE
    // =========================
    function mettreAJourCapteursLigne(): void {
        capteur1 = dadabit.line_followers(dadabit.LineFollowerSensors.S1, dadabit.LineColor.Black)
        capteur2 = dadabit.line_followers(dadabit.LineFollowerSensors.S2, dadabit.LineColor.Black)
        capteur3 = dadabit.line_followers(dadabit.LineFollowerSensors.S3, dadabit.LineColor.Black)
        capteur4 = dadabit.line_followers(dadabit.LineFollowerSensors.S4, dadabit.LineColor.Black)
    }

    // =========================
    // MOUVEMENTS
    // =========================

    //% block="avancer à vitesse %v"
    //% group="Mouvements"
    export function avancer(v: number): void {
        dadabit.setLego360Servo(1, sensGauche, v)
        dadabit.setLego360Servo(2, sensDroite, v)
        dadabit.setLego360Servo(3, sensGauche, v)
        dadabit.setLego360Servo(4, sensDroite, v)
    }

    //% block="reculer à vitesse %v"
    //% group="Mouvements"
    export function reculer(v: number): void {
        dadabit.setLego360Servo(1, sensDroite, v)
        dadabit.setLego360Servo(2, sensGauche, v)
        dadabit.setLego360Servo(3, sensDroite, v)
        dadabit.setLego360Servo(4, sensGauche, v)
    }

    //% block="tourner à gauche vitesse %v"
    //% group="Mouvements"
    export function tournerAGauche(v: number): void {
        dadabit.setLego360Servo(1, sensDroite, v)
        dadabit.setLego360Servo(2, sensDroite, v)
        dadabit.setLego360Servo(3, sensDroite, v)
        dadabit.setLego360Servo(4, sensDroite, v)
    }

    //% block="tourner à droite vitesse %v"
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

    // =========================
    // SUIVI DE LIGNE
    // =========================

    /**
     * Le robot suit la ligne noire automatiquement
     */
    //% block="suivre la ligne"
    //% group="Suivi de ligne"
    export function suiviDeLigne(): void {

        mettreAJourCapteursLigne()

        // Bien centré → avancer
        if (capteur2 && capteur3) {
            avancer(vitesseToutDroit)

        // Déviation gauche → corriger
        } else if (capteur1) {
            tournerAGauche(vitesseCorrection)

        // Déviation droite → corriger
        } else if (capteur4) {
            tournerADroite(vitesseCorrection)

        // Sinon → avancer doucement
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

    // =========================
    // VISION
    // =========================

    function detectionStable(): boolean {
        if (wondercam.isDetectedColorId(ID_CUBE)) compteurStable++
        else compteurStable = 0

        if (compteurStable >= SEUIL_VALIDATION) {
            compteurStable = 0
            return true
        }
        return false
    }

    //% block="cube détecté de façon stable ?"
    //% group="Vision"
    export function cubeDetecteStable(): boolean {
        wondercam.UpdateResult()
        return detectionStable()
    }

    //% block="approcher le cube"
    //% group="Vision"
    export function approcherCube(): void {

        let timeout = 0

        while (timeout < 200) {

            wondercam.UpdateResult()
            suiviDeLigne()

            let y = wondercam.XOfColorId(wondercam.Options.Pos_Y, ID_CUBE)

            if (y >= Y_APPROCHE) break

            timeout++
            basic.pause(20)
        }
    }

    // =========================
    // MANIPULATION
    // =========================

    function brasEnHaut() { dadabit.setLego270Servo(5, BRAS_HAUT, TEMPS_MOUVEMENT) }
    function brasEnBas() { dadabit.setLego270Servo(5, BRAS_BAS, TEMPS_MOUVEMENT) }
    function ouvrirPince() { dadabit.setLego270Servo(6, PINCE_OUVERTE, TEMPS_MOUVEMENT) }
    function fermerPince() { dadabit.setLego270Servo(6, PINCE_FERMEE, TEMPS_MOUVEMENT) }

    //% block="attraper le cube"
    //% group="Manipulation"
    export function attraperCube(): void {
        arreterRobot()
        brasEnBas()
        basic.pause(TEMPS_ATTENTE)
        fermerPince()
        basic.pause(TEMPS_ATTENTE)
        brasEnHaut()
        modeMission = 1
    }

    //% block="déposer le cube"
    //% group="Manipulation"
    export function deposerCube(): void {
        brasEnBas()
        basic.pause(TEMPS_ATTENTE)
        ouvrirPince()
        basic.pause(TEMPS_ATTENTE)
        brasEnHaut()
        modeMission = 0
    }

    // =========================
    // MISSION
    // =========================

    //% block="ne porte pas de cube ?"
    //% group="Mission"
    export function nePortePasCube(): boolean {
        return modeMission == 0
    }

    //% block="bip"
    //% group="Mission"
    export function jouerBip(): void {
        music.playTone(262, music.beat(BeatFraction.Whole))
    }

    //% block="gérer la destination"
    //% group="Mission"
    export function destination(): void {

        arreterRobot()
        basic.pause(500)

        if (modeMission == 1) {
            deposerCube()
        }

        let timeout = 0

        while (timeout < 150) {

            mettreAJourCapteursLigne()
            tournerADroite(vitesseCorrection)

            if (capteur3 && capteur4) break

            timeout++
            basic.pause(20)
        }
    }

    //% block="cycle mission"
    //% group="Mission"
    export function cycleMission(): void {

        if (modeMission == 0 && cubeDetecteStable()) {
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

    // =========================
    // RÉGLAGES
    // =========================

    //% block="régler vitesses v1 (rapide) v2 (correction) v3 (lent)"
    //% group="Réglages"
    export function reglerVitesses(v1: number, v2: number, v3: number): void {
        vitesseToutDroit = v1
        vitesseCorrection = v2
        petiteVitesse = v3
    }

    //% block="régler vision ID %id"
    //% group="Réglages"
    export function reglerVision(id: number): void {
        ID_CUBE = id
        compteurStable = 0
    }

    //% block="initialiser la mission"
    //% group="Réglages"
    export function resetMission(): void {
        if (modeMission == 1) deposerCube()
        modeMission = 0
    }
}
