import * as THREE from "three";
import { Mesh, MeshStandardMaterial } from "three";
import {RAIO_ROTUNDA,GROSSURA_OBJS} from "../constants.js"

/* parameters{
 * id: Integer ,
 * x: Float,
 * y: Float ,
 * z: Float,
 * nome: String
}
*/
export default class Rotunda extends THREE.Mesh{
    constructor(parameters) {
        super();
        for (const [key, value] of Object.entries(parameters)) {
            Object.defineProperty(this, key, { value: value, writable: true, configurable: true, enumerable: true });
        }

        this.initialize();
        
    }

    initialize(){
        this.geometry = new THREE.CylinderGeometry(RAIO_ROTUNDA,RAIO_ROTUNDA, GROSSURA_OBJS, 32);

        const middleTexture = new THREE.TextureLoader().load("./assets/textures/terra.png");
        middleTexture.wrapS = THREE.RepeatWrapping;
        middleTexture.wrapT = THREE.RepeatWrapping;
        middleTexture.repeat.set(2 * Math.PI * RAIO_ROTUNDA , GROSSURA_OBJS);
        
        this.material = [
            new THREE.MeshStandardMaterial( { map: middleTexture } ), //meio
            new THREE.MeshStandardMaterial( { map: new THREE.TextureLoader().load("./assets/textures/rotunda.png")} ), //cima
            new THREE.MeshStandardMaterial( { map: new THREE.TextureLoader().load("./assets/textures/terra.png") } ) // baixo
        ];
        this.position.set(this.x,this.y,this.z);
        this.translateY(-GROSSURA_OBJS/2);

        this.receiveShadow = true;

    }
}