import * as THREE from "three";
import { LARG_ESTRADAS, RAIO_ROTUNDA, K_LIGACAO, GROSSURA_OBJS, INFINITESIMO } from "../constants.js";
import Rotunda from "./rotunda.js"
import * as CANNON from "cannon-es"
import { Vec3 } from "cannon-es";


/**
 * paramaters{
 *  rotundaPartida
 *  rotundaChegada
 *  angulo // vai guardar o angulo sobre o eixo de z
 * }
 */

export default class ElementoLigacao extends THREE.Mesh {
    constructor(parameters, rotundaPartida, rotundaChegada) {
        super();
        for (const [key, value] of Object.entries(parameters)) {
            Object.defineProperty(this, key, { value: value, writable: true, configurable: true, enumerable: true });
        }
        this.rotundaPartida = rotundaPartida;
        this.rotundaChegada = rotundaChegada;
        this.initialize();
        this.connectBetweenRotundas();

        this.geometry.computeBoundingBox();
        let boundingBox = this.geometry.boundingBox;
        let centerx =  (boundingBox.max.x + boundingBox.min.x) / 2;
        let centery =  (boundingBox.max.x + boundingBox.min.x) / 2; 
        let centerz =  (boundingBox.max.x + boundingBox.min.x) / 2;

        this.body = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(LARG_ESTRADAS / 2, (GROSSURA_OBJS - INFINITESIMO) / 2, (K_LIGACAO * RAIO_ROTUNDA) / 2)),
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            type: CANNON.Body.STATIC
        });
        
        this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), this.angulo);        
        
    }
    initialize() {


        this.geometry = new THREE.BoxGeometry(LARG_ESTRADAS, K_LIGACAO * RAIO_ROTUNDA, GROSSURA_OBJS - INFINITESIMO);

        const topTexture = new THREE.TextureLoader().load("./assets/textures/elementoLigacaoEstrada.png");
        topTexture.wrapS = THREE.RepeatWrapping;
        topTexture.wrapT = THREE.RepeatWrapping;
        topTexture.repeat.set(LARG_ESTRADAS, K_LIGACAO * RAIO_ROTUNDA);

        this.material = [
            new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load("./assets/textures/terra.png") }), // a volta
            new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load("./assets/textures/terra.png") }), // a volta
            new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load("./assets/textures/terra.png") }), // a volta
            new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load("./assets/textures/terra.png") }), // parte de tras
            new THREE.MeshStandardMaterial({ map: topTexture }), // parte de cima
            new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load("./assets/textures/terra.png") }) // parte de baixo
        ];


        this.receiveShadow = true;
    }
    connectBetweenRotundas() {
        this.rotateX(-Math.PI / 2);
        this.position.set(
            this.rotundaPartida.x,
            this.rotundaPartida.y - INFINITESIMO,
            this.rotundaPartida.z
        );

        if (this.angulo == null) {
            this.calculateAngle();
        }
        this.rotateZ(this.angulo);
        this.translateY((K_LIGACAO * RAIO_ROTUNDA) / 2 );
        this.translateZ(-GROSSURA_OBJS / 2);  

    }

    calculateAngle() {
        this.angulo = Math.atan2(this.rotundaChegada.x - this.rotundaPartida.x,
            this.rotundaChegada.z - this.rotundaPartida.z) + Math.PI;
    }


}