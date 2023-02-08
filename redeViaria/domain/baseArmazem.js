import * as THREE from "three"
import { Mesh, MeshStandardMaterial } from "three";
import { LARG_ESTRADAS, RAIO_ROTUNDA, K_LIGACAO, GROSSURA_OBJS,INFINITESIMO} from "../constants.js";
import * as CANNON from "cannon-es"



/**
 * parameters{
 *  angulo // rotação z para ficar de acordo com a rotação do armazem 
 * }
 */

export default class BaseWarehouse extends THREE.Mesh{
    constructor(parameters,warehouse){
        super();
        for (const [key, value] of Object.entries(parameters)) {
            Object.defineProperty(this, key, { value: value, writable: true, configurable: true, enumerable: true });
        }
        this.warehouse = warehouse;
        this.initialize();
    }

    initialize(){
        
        this.geometry = new THREE.BoxGeometry(LARG_ESTRADAS*3,3, GROSSURA_OBJS);


        const topTexture = new THREE.TextureLoader().load("./assets/textures/grass.jpeg");
        topTexture.wrapS = THREE.RepeatWrapping;
        topTexture.wrapT = THREE.RepeatWrapping;
        topTexture.repeat.set(LARG_ESTRADAS*3, 3);

        const aroundTexture = new THREE.TextureLoader().load("./assets/textures/terra.png");
        aroundTexture.wrapS = THREE.RepeatWrapping;
        aroundTexture.wrapT = THREE.RepeatWrapping;
        aroundTexture.repeat.set(GROSSURA_OBJS, LARG_ESTRADAS*3);

        const aroundTexture2 = new THREE.TextureLoader().load("./assets/textures/terra.png");
        aroundTexture2.wrapS = THREE.RepeatWrapping;
        aroundTexture2.wrapT = THREE.RepeatWrapping;
        aroundTexture2.repeat.set(LARG_ESTRADAS*3, GROSSURA_OBJS);

        const bottomTexture = new THREE.TextureLoader().load("./assets/textures/terra.png");
        bottomTexture.wrapS = THREE.RepeatWrapping;
        bottomTexture.wrapT = THREE.RepeatWrapping;
        bottomTexture.repeat.set(LARG_ESTRADAS*3, 3);

        this.material = [
            new THREE.MeshStandardMaterial( {map: aroundTexture } ), // a volta direita
            new THREE.MeshStandardMaterial( {map: aroundTexture } ), // a volta esquerda
            new THREE.MeshStandardMaterial( {map: aroundTexture2 } ), // a volta
            new THREE.MeshStandardMaterial( {map: aroundTexture2 } ), // parte de tras
            new THREE.MeshStandardMaterial( {map: topTexture } ), // parte de cima
            new THREE.MeshStandardMaterial( {map: bottomTexture } ) // parte de baixo
        ];

        this.receiveShadow = true;

        this.position.set(this.warehouse.position.x, this.warehouse.position.y+INFINITESIMO*3,this.warehouse.position.z);

        this.rotateX(-Math.PI/2);
        this.rotateZ(this.angulo)
        this.translateZ(-GROSSURA_OBJS/2);

        this.body = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3((LARG_ESTRADAS*3)/2, GROSSURA_OBJS/2,3/2)),
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            type: CANNON.Body.STATIC
        });

        var q1 = new CANNON.Quaternion();
        q1.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), this.angulo);

        this.body.quaternion.copy(q1);
    }
}