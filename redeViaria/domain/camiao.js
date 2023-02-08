import * as THREE from "three"
import { LARG_ESTRADAS, RAIO_ROTUNDA, K_LIGACAO, GROSSURA_OBJS, INFINITESIMO} from "../constants.js";
import * as CANNON from "cannon-es"

/**
 * parameters{
 *  speed: Float,
 *  initialDirection: Float,
 *  turningSpeed: Float
 * }
 */

export default class Camiao extends THREE.Group{
    constructor(parameters){
        super();
        for (const [key, value] of Object.entries(parameters)) {
            Object.defineProperty(this, key, { value: value, writable: true, configurable: true, enumerable: true });
        }
        this.initialize();
    }

    initialize(){
        const geometryRoda = new THREE.CylinderGeometry(0.25,0.25,0.25,32);
 
        const materialRoda = [
            new THREE.MeshStandardMaterial( {color: 0x000000} ), // meio
            new THREE.MeshStandardMaterial( {map: new THREE.TextureLoader().load("./assets/textures/pneu.png") }), // cima
            new THREE.MeshStandardMaterial( {map: new THREE.TextureLoader().load("./assets/textures/pneu.png") }) // baixo
        ];

        let rodaF1 = new THREE.Mesh(geometryRoda,materialRoda);
        rodaF1.rotateZ(Math.PI/2);
        rodaF1.position.set(0,0,0);
        this.add(rodaF1);

        let rodaF2 = new THREE.Mesh(geometryRoda,materialRoda);
        rodaF2.rotateZ(Math.PI/2);
        rodaF2.position.set(0,0,0);
        this.add(rodaF2);

        let rodaT1 = new THREE.Mesh(geometryRoda,materialRoda);
        rodaT1.rotateZ(Math.PI/2);
        rodaT1.position.set(0,0,0); 
        this.add(rodaT1);

        let rodaT2 = new THREE.Mesh(geometryRoda,materialRoda);
        rodaT2.rotateZ(Math.PI/2);
        rodaT2.position.set(0,0,0);
        this.add(rodaT2);

        const geometryC1 = new THREE.BoxGeometry(1,2.3, GROSSURA_OBJS*2);

        const materialC1 = [
            new THREE.MeshBasicMaterial( {map: new THREE.TextureLoader().load("./assets/textures/carsidebottom.jpg")} ), // a volta direita
            new THREE.MeshBasicMaterial( {map: new THREE.TextureLoader().load("./assets/textures/carsidebottom2.jpg")} ), // a volta esquerda
            new THREE.MeshBasicMaterial( {map: new THREE.TextureLoader().load("./assets/textures/carfront.png")} ), // parte da frente
            new THREE.MeshBasicMaterial( {map: new THREE.TextureLoader().load("./assets/textures/traseira_camiao_bot.jpg") } ), // parte de tras
            new THREE.MeshBasicMaterial( {color: 0xaa1e24 } ), // parte de cima
            new THREE.MeshBasicMaterial( {color: 0xaa1e24} ) // parte de baixo
        ];

        let caixa = new THREE.Mesh(geometryC1,materialC1);
        caixa.rotateX(-Math.PI/2);
        caixa.position.set(0, 0, 0);
        this.add(caixa);

       
        this.position.set(0,0,0);
        this.scale.set(0.25,0.25,0.25);

        // subir a geometria para o centro do grupo coincidir com a base das rodas?

        this.body = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(new CANNON.Vec3(GROSSURA_OBJS/2, 0.3/2, 1/2 )),
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            type: CANNON.Body.STATIC
        });

    }

    andarParaFrente(){
        this.children[0].rotateY(0.05);
        this.children[1].rotateY(0.05);
        this.children[2].rotateY(0.05);
        this.children[3].rotateY(0.05);
        console.log(this.children);
    }
    andarParaTras(){
        this.children[0].rotateY(-0.05);
        this.children[1].rotateY(-0.05);
        this.children[2].rotateY(-0.05);
        this.children[3].rotateY(-0.05);
        console.log(this.children);
    }
}