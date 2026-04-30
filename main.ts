//% color=#0EA5E9 icon="\uf02d" block="MSM Smart Tools"
//% groups='["Réglages","Mouvements","Suivi de ligne","Vision","Manipulation","Mission"]'
namespace msmSmartTools {

    // =========================
    // VARIABLES
    // =========================
    let capteur1 = false
    let capteur2 = false
    let capteur3 = false
    let capteur4 = false

    let vitesseToutDroit = 55
    let vitesseCorrection = 44
    let petiteVitesse = 33

    let ID_CUBE = 1
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

    // Sens moteurs calibrés
    let sensGauche = dadabit.Oriention.Counterclockwise
    let sensDroite = dadabit.Oriention.Clockwise

    // =========================
    // CAPTEURS
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
    export function avancer(v: number): void {
        dadabit.setLego360Servo(1, sensGauche, v)
        dadabit.setLego360Servo(2, sensDroite, v)
        dadabit.setLego360Servo(3, sensGauche, v)
        dadabit.setLego360Servo(4, sensDroite, v)
    }

    export function tournerAGauche(v: number): void {
        dadabit.setLego360Servo(1, sensDroite, v)
        dadabit.setLego360Servo(2, sensDroite, v)
        dadabit.setLego360Servo(3, sensDroite, v)
        dadabit.setLego360Servo(4, sensDroite, v)
    }

    export function tournerADroite(v: number): void {
        dadabit.setLego360Servo(1, sensGauche, v)
        dadabit.setLego360Servo(2, sensGauche, v)
        dadabit.setLego360Servo(3, sensGauche, v)
        dadabit.setLego360Servo(4, sensGauche, v)
    }

    export function arreterRobot(): void {
        dadabit.setLego360Servo(1, sensGauche, 0)
        dadabit.setLego360Servo(2, sensDroite, 0)
        dadabit.setLego360Servo(3, sensGauche, 0)
        dadabit.setLego360Servo(4, sensDroite, 0)
    }

    // =========================
    // SUIVI DE LIGNE ULTRA PRÉCIS
    // =========================
    //% block="suivre la ligne"
    export function suiviDeLigne(): void {

        mettreAJourCapteursLigne()

        if (capteur2 && capteur3) {
            avancer(vitesseToutDroit)

        } else if (capteur1 && capteur2 && (!capteur3 && !capteur4)) {
            tournerAGauche(vitesseCorrection)

        } else if (capteur3 && capteur4 && (!capteur1 && !capteur2)) {
            tournerADroite(vitesseCorrection)

        } else if (capteur2 && !capteur1 && (!capteur3 && !capteur4)) {
            dadabit.setLego360Servo(1, sensGauche, vitesseCorrection)
            dadabit.setLego360Servo(2, sensDroite, petiteVitesse)
            dadabit.setLego360Servo(3, sensGauche, vitesseCorrection)
            dadabit.setLego360Servo(4, sensDroite, petiteVitesse)

        } else if (capteur3 && !capteur1 && (!capteur2 && !capteur4)) {
            dadabit.setLego360Servo(1, sensGauche, petiteVitesse)
            dadabit.setLego360Servo(2, sensDroite, vitesseCorrection)
            dadabit.setLego360Servo(3, sensGauche, petiteVitesse)
            dadabit.setLego360Servo(4, sensDroite, vitesseCorrection)

        } else if (capteur1 && !capteur2 && (!capteur3 && !capteur4)) {
            tournerAGauche(vitesseToutDroit)

        } else if (capteur4 && !capteur1 && (!capteur2 && !capteur3)) {
            tournerADroite(vitesseToutDroit)

        } else {
            avancer(petiteVitesse)
        }
    }

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

    export function cubeDetecteStable(): boolean {
        wondercam.UpdateResult()
        return detectionStable()
    }

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
    // BRAS
    // =========================
    function brasEnHaut() { dadabit.setLego270Servo(5, BRAS_HAUT, TEMPS_MOUVEMENT) }
    function brasEnBas() { dadabit.setLego270Servo(5, BRAS_BAS, TEMPS_MOUVEMENT) }
    function ouvrirPince() { dadabit.setLego270Servo(6, PINCE_OUVERTE, TEMPS_MOUVEMENT) }
    function fermerPince() { dadabit.setLego270Servo(6, PINCE_FERMEE, TEMPS_MOUVEMENT) }

    export function attraperCube(): void {
        arreterRobot()
        brasEnBas()
        basic.pause(TEMPS_ATTENTE)
        fermerPince()
        basic.pause(TEMPS_ATTENTE)
        brasEnHaut()
        modeMission = 1
    }

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
    export function nePortePasCube(): boolean {
        return modeMission == 0
    }

    export function jouerBip(): void {
        music.playTone(262, music.beat(BeatFraction.Whole))
    }

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
    export function reglerVitesses(v1: number, v2: number, v3: number): void {
        vitesseToutDroit = v1
        vitesseCorrection = v2
        petiteVitesse = v3
    }

    export function reglerVision(id: number): void {
        ID_CUBE = id
        compteurStable = 0
    }

    export function resetMission(): void {
        if (modeMission == 1) deposerCube()
        modeMission = 0
    }
}
