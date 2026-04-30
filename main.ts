// =========================
// MOUVEMENTS COMPLETS (CALIBRÉS)
// =========================

// Sens calibrés (modifiable si besoin)
let sensGauche = dadabit.Oriention.Counterclockwise
let sensDroite = dadabit.Oriention.Clockwise

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

//% block="corriger à gauche vitesse %v"
//% group="Mouvements"
export function corrigerAGauche(v: number): void {
    dadabit.setLego360Servo(1, sensGauche, petiteVitesse)
    dadabit.setLego360Servo(2, sensDroite, v)
    dadabit.setLego360Servo(3, sensGauche, petiteVitesse)
    dadabit.setLego360Servo(4, sensDroite, v)
}

//% block="corriger à droite vitesse %v"
//% group="Mouvements"
export function corrigerADroite(v: number): void {
    dadabit.setLego360Servo(1, sensGauche, v)
    dadabit.setLego360Servo(2, sensDroite, petiteVitesse)
    dadabit.setLego360Servo(3, sensGauche, v)
    dadabit.setLego360Servo(4, sensDroite, petiteVitesse)
}

//% block="arrêter le robot"
//% group="Mouvements"
export function arreterRobot(): void {
    dadabit.setLego360Servo(1, sensGauche, 0)
    dadabit.setLego360Servo(2, sensDroite, 0)
    dadabit.setLego360Servo(3, sensGauche, 0)
    dadabit.setLego360Servo(4, sensDroite, 0)
}
