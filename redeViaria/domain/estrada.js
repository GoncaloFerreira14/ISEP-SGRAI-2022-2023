import * as THREE from "three";
import { LARG_ESTRADAS, RAIO_ROTUNDA, K_LIGACAO, GROSSURA_OBJS, INFINITESIMO } from "../constants.js";
import { calculateAngle, calculateGap, calculateInclination, calculatelengthOfTheProjection, calculateLengthRoad, calculateMediumPoint } from "../utils.js";
import * as CANNON from "cannon-es"


/**
 * paramaters{
 *  desnivel: number
 *  comprimento: number
 *  orientacao: number     // rotação segundo o eixo dos z (porque quando rodamos -PI/2, o z fica para cima)
 *  inclinacao = number    // rotacao segundo o eixo dos x (o x mantem )
 * }
 */

export default class Estrada extends THREE.Mesh {
    constructor(parameters, elementoLigacaoPartida, elementoLigacaoChegada, rotundaPartida, rotundaChegada) {
        super();
        for (const [key, value] of Object.entries(parameters)) {
            Object.defineProperty(this, key, { value: value, writable: true, configurable: true, enumerable: true });
        }
        this.elementoLigacaoPartida = elementoLigacaoPartida;
        this.elementoLigacaoChegada = elementoLigacaoChegada;
        this.rotundaPartida = rotundaPartida;
        this.rotundaChegada = rotundaChegada;
        this.calculateEstradaProperties();
        this.initialize();

        this.body = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3((LARG_ESTRADAS - INFINITESIMO) / 2, GROSSURA_OBJS / 2, this.comprimento / 2)),
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            type: CANNON.Body.STATIC
        });
        var q1 = new CANNON.Quaternion();
        q1.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), this.orientacao);

        // Create a quaternion representing a rotation around the x-axis
        var q2 = new CANNON.Quaternion();
        q2.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -this.inclinacao);

        var q3 = new CANNON.Quaternion();
        q3.copy(q1).mult(q2, q3);

        this.body.quaternion.copy(q3);



    }
    initialize() {

        this.geometry = new THREE.BoxGeometry(LARG_ESTRADAS - INFINITESIMO, this.comprimento, GROSSURA_OBJS);

        const topTexture = new THREE.TextureLoader().load("./assets/textures/road3.jpeg");
        topTexture.wrapS = THREE.RepeatWrapping;
        topTexture.wrapT = THREE.RepeatWrapping;
        topTexture.repeat.set(LARG_ESTRADAS, this.comprimento);

        const aroundTexture = new THREE.TextureLoader().load("./assets/textures/terra.png");
        aroundTexture.wrapS = THREE.RepeatWrapping;
        aroundTexture.wrapT = THREE.RepeatWrapping;
        aroundTexture.repeat.set(GROSSURA_OBJS, this.comprimento);

        this.material = [
            new THREE.MeshStandardMaterial({ map: aroundTexture }), // a volta direita
            new THREE.MeshStandardMaterial({ map: aroundTexture }), // a volta esquerda
            new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load("./assets/textures/terra.png") }), // a volta
            new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load("./assets/textures/terra.png") }), // parte de tras
            new THREE.MeshStandardMaterial({ map: topTexture }), // parte de cima
            new THREE.MeshStandardMaterial({ map: aroundTexture }) // parte de baixo
        ];

        let pontoMedio = calculateMediumPoint(this.rotundaPartida, this.rotundaChegada);
        this.position.set(pontoMedio.x, pontoMedio.y - INFINITESIMO, pontoMedio.z);
        this.rotateX(-Math.PI / 2);
        this.rotateZ(this.orientacao);
        this.rotateX(-this.inclinacao);
        this.translateZ(-GROSSURA_OBJS / 2);

        this.receiveShadow = true;


    }

    calculateEstradaProperties() {
        this.desnivel = calculateGap(this.elementoLigacaoChegada.position.y,
            this.elementoLigacaoPartida.position.y);

        let comprimentoProjecao = calculatelengthOfTheProjection(   // não faz sentido guardar como atributo do objeto
            this.rotundaChegada.position.x,
            this.rotundaPartida.position.x,
            this.rotundaChegada.position.z,
            this.rotundaPartida.position.z,
            K_LIGACAO * RAIO_ROTUNDA,
            K_LIGACAO * RAIO_ROTUNDA
        );

        this.comprimento = calculateLengthRoad(this.desnivel, comprimentoProjecao);

        this.orientacao = calculateAngle(
            this.rotundaPartida.position.x,
            this.rotundaChegada.position.x,
            this.rotundaPartida.position.z,
            this.rotundaChegada.position.z
        );

        this.inclinacao = calculateInclination(this.desnivel, comprimentoProjecao);

    }
}