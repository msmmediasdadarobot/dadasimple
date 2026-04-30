//% color=#0EA5E9 icon="\uf02d" block="MSM Smart Tools"
//% groups='["Réglages","Suivi de ligne","Vision","Manipulation","Mission"]'
namespace msmSmartTools {

    // =========================
    // VARIABLES INTERNES
    // =========================
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

    let modeMission = 0 // 0 = vide, 1 = porte cube

    let BRAS_HAUT = -60
    let BRAS_BAS = -5
    let PINCE_OUVERTE = 15
    let PINCE_FERMEE = -25

    let TEMPS_MOUVEMENT = 500
    let TEMPS_ATTENTE = 800

    // =========================
    // CAPTEURS LIGNE
    // =========================
    function majCapteurs(): void {
        capteur1 = dadabit.line_followers(dadabit.LineFollowerSensors.S1, dadabit.LineColor.Black)
        capteur2 = dadabit.line_followers(dadabit.LineFollowerSensors.S2, dadabit.LineColor.Black)
        capteur3 = dadabit.line_followers(dadabit.LineFollowerSensors.S3, dadabit.LineColor.Black)
        capteur4 = dadabit.line_followers(dadabit.LineFollowerSensors.S4, dadabit.LineColor.Black)
    }

    // =========================
    // MOUVEMENTS CORRIGÉS
    // =========================
    function avancer(v: number): void {
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, v)
    }

    function corrigerAGauche(v: number): void {
        dadabit.setLego360Servo(1, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(3, dadabit.Oriention.Clockwise, v)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, v)
    }

    function corrigerADroite(v: number): void {
        dadabit.setLego360Servo(1, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(2, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(3, dadabit.Oriention.Counterclockwise, v)
        dadabit.setLego360Servo(4, dadabit.Oriention.Counterclockwise, v)
    }

    function stopRobot(): void {
        dadabit.setLego360Servo(1, dadabit.Oriention.Clockwise, 0)
        dadabit.setLego360Servo(2, dadabit.Oriention.Clockwise, 0)
        dadabit.setLego360Servo(3, dadabit.Oriention.Clockwise, 0)
        dadabit.setLego360Servo(4, dadabit.Oriention.Clockwise, 0)
    }

    // =========================
    // SUIVI DE LIGNE (sécurisé)
    // =========================
    //% block="suivre la ligne"
    //% group="Suivi de ligne"
    export function suivreLigne(): void {
        majCapteurs()

        if (capteur2 && capteur3) avancer(vitesseToutDroit)
        else if (capteur1) corrigerAGauche(vitesseCorrection)
        else if (capteur4) corrigerADroite(vitesseCorrection)
        else avancer(petiteVitesse)
    }

    //% block="arrivée détectée ?"
    //% group="Suivi de ligne"
    export function arriveeDetectee(): boolean {
        majCapteurs()
        return capteur1 && capteur2 && capteur3 && capteur4
    }

    // =========================
    // VISION COULEUR
    // =========================
    function detectionStable(): boolean {
        if (wondercam.isDetectedColorId(ID_CUBE)) {
            compteurStable++
        } else {
            compteurStable = 0
        }

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
            suivreLigne()

            let y = wondercam.XOfColorId(wondercam.Options.Pos_Y, ID_CUBE)

            if (y >= Y_APPROCHE) break

            timeout++
            basic.pause(20)
        }
    }

    //% block="afficher couleur LED ID %id"
    //% group="Vision"
    export function afficherCouleur(id: number): void {
        if (id == 1) dadabit.setBoardPixelRGB(dadabit.Lights.All, RGBColors.Red)
        else if (id == 2) dadabit.setBoardPixelRGB(dadabit.Lights.All, RGBColors.Green)
        else if (id == 3) dadabit.setBoardPixelRGB(dadabit.Lights.All, RGBColors.Blue)
        else if (id == 4) dadabit.setBoardPixelRGB(dadabit.Lights.All, RGBColors.Yellow)

        dadabit.showBoardLight()
    }

    // =========================
    // BRAS SIMPLE
    // =========================
    function brasHaut() { dadabit.setLego270Servo(5, BRAS_HAUT, TEMPS_MOUVEMENT) }
    function brasBas() { dadabit.setLego270Servo(5, BRAS_BAS, TEMPS_MOUVEMENT) }
    function ouvrir() { dadabit.setLego270Servo(6, PINCE_OUVERTE, TEMPS_MOUVEMENT) }
    function fermer() { dadabit.setLego270Servo(6, PINCE_FERMEE, TEMPS_MOUVEMENT) }

    //% block="attraper le cube"
    //% group="Manipulation"
    export function attraperCube(): void {
        stopRobot()
        brasBas()
        basic.pause(TEMPS_ATTENTE)
        fermer()
        basic.pause(TEMPS_ATTENTE)
        brasHaut()
        modeMission = 1
    }

    //% block="déposer le cube"
    //% group="Manipulation"
    export function deposerCube(): void {
        brasBas()
        basic.pause(TEMPS_ATTENTE)
        ouvrir()
        basic.pause(TEMPS_ATTENTE)
        brasHaut()
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
    export function bip(): void {
        music.playTone(262, music.beat(BeatFraction.Whole))
    }

    //% block="gérer la destination"
    //% group="Mission"
    export function destination(): void {
        stopRobot()

        if (modeMission == 1) deposerCube()

        let timeout = 0

        while (timeout < 100) {
            majCapteurs()
            corrigerADroite(vitesseCorrection)

            if (capteur3 && capteur4) break

            timeout++
            basic.pause(20)
        }
    }

    //% block="cycle mission"
    //% group="Mission"
    export function cycleMission(): void {

        if (modeMission == 0 && cubeDetecteStable()) {
            bip()
            approcherCube()
            attraperCube()
        }

        if (arriveeDetectee()) {
            destination()
        } else {
            suivreLigne()
        }
    }

    // =========================
    // RÉGLAGES
    // =========================
    //% block="régler vitesses %v1 %v2 %v3"
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

    //% block="initialiser mission"
    //% group="Réglages"
    export function resetMission(): void {
        if (modeMission == 1) deposerCube()
        modeMission = 0
    }
}
