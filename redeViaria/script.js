import * as THREE from "three";
import * as CANNON from "cannon-es"
import { OrbitControls } from "../three.js-master/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "../three.js-master/examples/jsm/loaders/GLTFLoader.js";
import { Ligacao } from "./data/ligacao.js";
import Rotunda from "./domain/rotunda.js";
import ElementoLigacao from "./domain/elementoLigacao.js";
import Estrada from "./domain/estrada.js";
import BaseWarehouse from "./domain/baseArmazem.js";
import { INFINITESIMO, CAMIAO_SPEED, CAMIAO_TURNING_SPEED, CAMIAO_INITIAL_DIRECTION, TRANSLATEZ_ARMAZEM_CONSTANT, DELTA_T, RAIO_ROTUNDA, GROSSURA_OBJS, CAMIAO_POSITION_CONST } from "./constants.js";

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setAnimationLoop(animate);

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.CubeTextureLoader().load([
  "./assets/background/blizzard_ft.jpg",
  "./assets/background/blizzard_bk.jpg",
  "./assets/background/blizzard_up.jpg",
  "./assets/background/blizzard_dn.jpg",
  "./assets/background/blizzard_rt.jpg",
  "./assets/background/blizzard_lf.jpg",
]);
scene.fog = new THREE.FogExp2(0xFFFFFF, 0.007);

// Create Cannon World
const world = new CANNON.World({ //adição de gravidade à cena
  gravity: new CANNON.Vec3(0, -9.81, 0)
}); 

// Create Camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / innerHeight,
  0.1,
  500
);

// Responsive camera
window.addEventListener("resize", () => {
  camera.aspect = this.window.innerWidth / this.window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(this.window.innerWidth, this.window.innerHeight);
});
var pointToTruck = false;
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.set(-33.4754, 0.0, -21.2052); //defaultValues
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);
//camera.position.set(10, 10, 10);
orbit.update();

//Definição de uma luz ambiente
let aLightIntencity = 1;
const ambientLight = new THREE.AmbientLight(0x999999, aLightIntencity);
scene.add(ambientLight);

    ambientLight.intensity = aLightIntencity;
    scene.add(ambientLight);


//Definição de uma luz direcional
let dLightIntencity = 1;
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, dLightIntencity);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 10000;
directionalLight.shadow.mapSize.height = 10000;
directionalLight.position.set(10, 50, 30);
directionalLight.shadow.camera.bottom = -70;
directionalLight.shadow.camera.top = 70;
directionalLight.shadow.camera.left = -55;
directionalLight.shadow.camera.right = 55;
scene.add(directionalLight);

directionalLight.intensity = dLightIntencity;
scene.add(directionalLight);

//definicao de uma luz spotLight
var spotlight1 = new THREE.SpotLight(0xffffff, 1);
spotlight1.angle = THREE.MathUtils.degToRad(20);

scene.add(spotlight1);

// feixe de luz da luz direcional para auxilio
/*const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 20);
scene.add(dLightHelper);
*/
// feixe de sombra causado pela luz direcional para auxilio
/*const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(dLightShadowHelper);
*/

//background sound
const listener = new THREE.AudioListener();
camera.add(listener);
const audioLoader = new THREE.AudioLoader();
const backgroundSound = new THREE.Audio(listener);
audioLoader.load('./assets/sounds/lofi.mp3', function (buffer) {
  backgroundSound.setBuffer(buffer);
  backgroundSound.setLoop(true);
  backgroundSound.setVolume(0.2);
//  backgroundSound.play();
});

//variaveis para simulação
let ligacoes = [new Ligacao(1, 14), new Ligacao(1, 7),// new Ligacao(12, 7),
new Ligacao(14, 10), new Ligacao(7, 17), new Ligacao(17, 10)//new Ligacao(10, 16), new Ligacao(16, 3),
  //new Ligacao(3, 13), new Ligacao(13, 11), new Ligacao(11, 15),
  //new Ligacao(15, 6), new Ligacao(6, 2), new Ligacao(2, 17),
  //new Ligacao(17, 5), new Ligacao(5, 9), new Ligacao(9, 13),
  //new Ligacao(8, 12), new Ligacao(8, 13), new Ligacao(4, 15),
];
let gltfLoader = new GLTFLoader();
let rotundas = [];
let elementosLigacao = [];
let estradas = [];


// Chamada das funçoes
loadRotundas();
loadWarehouses();
loadElementosLigacao();
loadRotundasCentro();
movingTruck();

const truckBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(-33.4754 - CAMIAO_POSITION_CONST, 0.0, -21.2052),
  //position: new CANNON.Vec3(0,0,0),
  //type: CANNON.Body.STATIC
});

// create the main body of the car
const truckBody2 = new CANNON.Box(new CANNON.Vec3(0.07, 0.06,0.18));

// create the wheels
const rodasTraseiras = new CANNON.Cylinder(0.03, 0.03, 0.15, 32);
const rodasFronteiras = new CANNON.Cylinder(0.03, 0.03, 0.12, 32);

// create quaternions for the orientation of the wheels
var qRodas1 = new CANNON.Quaternion();
qRodas1.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI/2);
var qRodas2 = new CANNON.Quaternion();
qRodas2.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI/2);

// add the shapes to the compound body, setting the orientation of the shapes using the 'orientation' property
truckBody.addShape(truckBody2, new CANNON.Vec3(0, 0, 0), new CANNON.Quaternion());
truckBody.addShape(rodasTraseiras, new CANNON.Vec3(0, -0.061, -0.09), qRodas1);
truckBody.addShape(rodasFronteiras, new CANNON.Vec3(0, -0.061, 0.15), qRodas2);

// add the compound body to the Cannon.js world
world.addBody(truckBody);
var mixer = 0;
var camiao = gltfLoader.load("./assets/models/camiaoModelFinal/scene.gltf", (gltf) => {
  gltf.scene.traverseVisible(function (child) {
    if (child.material) {
      child.castShadow = true;
      child.receiveShadow = false;
    }
  });

  mixer = new THREE.AnimationMixer(gltf.scene);

  gltf.scene.scale.set(0.0014, 0.0014, 0.0014);
  scene.add(gltf.scene);
  camiao = gltf;
  spotlight1.rotateX(-Math.PI/2);
  spotlight1.position.copy(truckBody.position);
});


function animate() {
  if(truckBody.position.y < -100){
    truckBody.position.set(-33.4754 - CAMIAO_POSITION_CONST, 0.0, -21.2052);
  }
  if (camiao){
      camiao.scene.position.copy(truckBody.position);
      
      camiao.scene.translateY(-0.09);
      camiao.scene.translateX(0.01);

      camiao.scene.quaternion.copy(truckBody.quaternion);
      camiao.scene.rotateY(-Math.PI/2);


      isFalling();
  } 
  world.fixedStep();
  // Calculate the delta time.

  if(mixer){
    //scene.mixer.update(deltaTime);
}
  renderer.render(scene, camera);
}

function getRotundaById(passedId) {
  for (let i = 0; i < rotundas.length; i++) {
    if (passedId == rotundas[i].identificador) return rotundas[i];
  }
}

// Move truck function
var truckDir = CAMIAO_INITIAL_DIRECTION;
function movingTruck() {
  document.onkeydown = function (e) {

    let frenteTras = false;
    let directionIncrement = CAMIAO_TURNING_SPEED * DELTA_T;
    const direction = THREE.MathUtils.degToRad(truckDir);
    let velH = CAMIAO_SPEED * DELTA_T;
    let distanciaCamera = {
      x: camera.position.x - truckBody.position.x,
      y: camera.position.y - truckBody.position.y,
      z: camera.position.z - truckBody.position.z
    }

    if (e.key === "ArrowLeft") {
      // The player is turning left
      truckDir += directionIncrement;

    } else if (e.key === "ArrowRight") {
      // The player is turning right
      truckDir -= directionIncrement;
    }

    if (e.key === "ArrowUp") {
      // The player is moving forwards
      const newPosition = new THREE.Vector3(
        truckBody.position.x + velH * Math.sin(direction),
        truckBody.position.y, 
        truckBody.position.z + velH * Math.cos(direction),
      );
      truckBody.position.set(newPosition.x, newPosition.y, newPosition.z);
      if(pointToTruck == true){
        let distanciaCameraAfter = {
          x: camera.position.x - truckBody.position.x,
          y: camera.position.y - truckBody.position.y,
          z: camera.position.z - truckBody.position.z
        }
        camera.position.set(camera.position.x - (distanciaCameraAfter.x-distanciaCamera.x),
                            camera.position.y ,
                            camera.position.z - (distanciaCameraAfter.z-distanciaCamera.z)
                            );
        setTargetOrbit("truck");
      }
      frenteTras = true;
    } else if (e.key === "ArrowDown") {
      // The player is moving backwards
      const newPosition = new THREE.Vector3(
        truckBody.position.x + velH * Math.sin(direction + Math.PI),
        truckBody.position.y,
        truckBody.position.z + velH * Math.cos(direction + Math.PI)
      );
      truckBody.position.set(newPosition.x, newPosition.y, newPosition.z);

      if(pointToTruck == true){
        let distanciaCameraAfter = {
          x: camera.position.x - truckBody.position.x,
          y: camera.position.y - truckBody.position.y,
          z: camera.position.z - truckBody.position.z
        }
        camera.position.set(camera.position.x + velH * Math.sin(direction + Math.PI),camera.position.y,camera.position.z + velH * Math.cos(direction + Math.PI));
        setTargetOrbit("truck");

      }
      frenteTras = true;
    }
    // Set the player's new orientation
    let qDirection = new CANNON.Quaternion();
    qDirection.setFromAxisAngle(new CANNON.Vec3(0,1,0), direction);

    let estradaAux = IsInEstrada();
    let elemLigacaoAux = IsInElementoLigacao();
    if(estradaAux != null && frenteTras && elemLigacaoAux == null){
      let qInclination = new CANNON.Quaternion();
      qInclination.setFromAxisAngle(new CANNON.Vec3(1,0,0), -estradaAux.inclinacao);

      let qFinal = new CANNON.Quaternion();
      qFinal.copy(qDirection).mult(qInclination,qFinal);

      truckBody.quaternion.copy(qFinal);
    }else{
      truckBody.quaternion.copy(qDirection);
    }
    spotlight1.position.copy(truckBody.position);
    spotlight1.target.position.set( truckBody.position.x + 1 * Math.sin(direction),
    truckBody.position.y, 
    truckBody.position.z + velH * Math.cos(direction));
  }
}

function IsInEstrada() {
  // Create a Three.js Vector3 object that represents the center of the truck body
  let origin = new THREE.Vector3(truckBody.position.x, truckBody.position.y, truckBody.position.z);

  // Use the Three.js Raycaster to check if the ray intersects with any of the roads
  let direction = new THREE.Vector3(0, -1, 0);
  let raycaster = new THREE.Raycaster(origin, direction);
  let intersections = raycaster.intersectObjects(estradas);
  if (intersections.length > 0) {
    return intersections[0].object;
  } else {
    return null;
  }
}

function IsInElementoLigacao() {
  // Create a Three.js Vector3 object that represents the center of the truck body
  let origin = new THREE.Vector3(truckBody.position.x, truckBody.position.y, truckBody.position.z);

  // Use the Three.js Raycaster to check if the ray intersects with any of the roads
  let direction = new THREE.Vector3(0, -1, 0);
  let raycaster = new THREE.Raycaster(origin, direction);
  let intersections = raycaster.intersectObjects(elementosLigacao);
  if (intersections.length > 0) {
    return intersections[0].object;
  } else {
    return null;
  }
}

// Check if truck is falling 
function isFalling(){
  if(truckBody.position.y < 0){
    // Get the modal
    var modal = document.getElementById("myModal");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // Open the modal
    modal.style.display = "block"; 

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
      modal.style.display = "none";
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };

    // Falling sound effect
    const audioListener = new THREE.AudioListener();
    camera.add(audioListener);
    const audioLoader = new THREE.AudioLoader();
    const audio = new THREE.Audio(audioListener);
    audioLoader.load("./assets/sounds/Falling_Sound_Effect.mp3", function (buffer) {
        audio.setBuffer(buffer);
        audio.setVolume(0.1);
        audio.play();
      }
    );
  }
}

function loadRotundas() {
  rotundas.push(new Rotunda({ identificador: 1, x: -50.0, y: 15.625, z: -42.6618, nome: "Arouca" }));
  //rotundas.push(new Rotunda({ identificador: 2, x: 26.6951, y: 34.375, z: -36.7615, nome: "Espinho" }));
  //rotundas.push(new Rotunda({ identificador: 3, x: 50.0, y: 12.5, z: 50.0, nome: "Gondomar" }));
  //rotundas.push(new Rotunda({ identificador: 4, x: 22.8206, y: 43.75, z: -19.4217, nome: "Maia" }));
  //rotundas.push(new Rotunda({ identificador: 5, x: 37.408, y: 21.875, z: -22.8394, nome: "Matosinhos" }));
  //rotundas.push(new Rotunda({ identificador: 6, x: -5.0756, y: 46.875, z: -50.0, nome: "Oliveira de Azeméis" }));
  rotundas.push(new Rotunda({ identificador: 7, x: -33.4754, y: 0.0, z: -21.2052, nome: "Paredes" }));
  //rotundas.push(new Rotunda({ identificador: 8, x: 24.3898, y: 37.5, z: -24.9214, nome: "Porto" }));
  //rotundas.push(new Rotunda({ identificador: 9, x: 49.9225, y: 25.0, z: -7.4403, nome: "Póvoa de Varzim" }));
  rotundas.push(new Rotunda({ identificador: 10, x: 8.7369, y: 6.25, z: -43.0783, nome: "Santa Maria da Feira" }));
  //rotundas.push(new Rotunda({ identificador: 11, x: -5.6955, y: 40.625, z: -10.3708, nome: "Santo Tirso" }));
  //rotundas.push(new Rotunda({ identificador: 12, x: 2.4215, y: 18.75, z: -45.1446, nome: "São João da Madeira" }));
  //rotundas.push(new Rotunda({ identificador: 13, x: 11.0035, y: 28.125, z: -10.6851, nome: "Trofa" }));
  rotundas.push(new Rotunda({ identificador: 14, x: -20.8446, y: 3.125, z: -49.6622, nome: "Vale de Cambra" }));
  //rotundas.push(new Rotunda({ identificador: 15, x: -0.9492, y: 50.0, z: -22.5016, nome: "Valongo" }));
  //rotundas.push(new Rotunda({ identificador: 16, x: 47.4041, y: 9.375, z: -9.6952, nome: "Vila do Conde" }));
  rotundas.push(new Rotunda({ identificador: 17, x: 21.0384, y: 31.25, z: -27.5927, nome: "Vila Nova de Gaia" }));

  for (let i = 0; i < rotundas.length; i++) {
    scene.add(rotundas[i]);

    let nomeCidade = new THREE.Sprite(criarNomeRotundas(rotundas[i].nome));
    nomeCidade.scale.set(10, 10, 1);
    nomeCidade.position.set(
      rotundas[i].x,
      rotundas[i].y + 2,
      rotundas[i].z
    );
    scene.add(nomeCidade);

    let rotundaBody = new CANNON.Body({
      shape: new CANNON.Cylinder(RAIO_ROTUNDA, RAIO_ROTUNDA, GROSSURA_OBJS, 32),
      position: new CANNON.Vec3(rotundas[i].position.x, rotundas[i].position.y, rotundas[i].position.z),
      type: CANNON.Body.STATIC
    });

    world.addBody(rotundaBody);
  }
}

function loadElementosLigacao() {
  for (let i = 0; i < ligacoes.length; i++) {
    let r1 = getRotundaById(ligacoes[i].idArmazemPartida);
    let r2 = getRotundaById(ligacoes[i].idArmazemChegada);

    // 1º elemento de ligação
    let elemLigacao1 = new ElementoLigacao({ angulo: null }, r1, r2);
    scene.add(elemLigacao1);
    elementosLigacao.push(elemLigacao1);
    world.addBody(elemLigacao1.body);

    // 2º elemento de ligação
    let elemLigacao2 = new ElementoLigacao({ angulo: null }, r2, r1);
    scene.add(elemLigacao2);
    elementosLigacao.push(elemLigacao2);
    world.addBody(elemLigacao2.body);

    createRoads(elemLigacao1, elemLigacao2, r1, r2);
  }
}

function createRoads(elemLigacao1, elemLigacao2, r1, r2) {
  let e = new Estrada({}, elemLigacao1, elemLigacao2, r1, r2);
  scene.add(e);
  estradas.push(e);
  world.addBody(e.body);
}

function criarNomeRotundas(nome) {
  let canvas = document.createElement("canvas");
  let size = 700;
  canvas.width = size;
  canvas.height = size;
  let context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.font = "30px Arial";
  context.fillText(nome, size / 2, size / 2);
  context.strokeText(nome, size / 2, size / 2);
  context.strokeStyle = "#000000";

  let texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  let material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    color: 0xffffff,
  });
  return material;
}

function loadWarehouses() {
  gltfLoader.load("./assets/models/warehouseNode/scene.gltf", (gltf) => {
    for (let i = 0; i < rotundas.length; i++) {
      gltf.scene.children[0].children[0].children[1].material.aoMapIntensity = 0;
      // console.log(gltf.scene);
      let gltfObject = gltf.scene;
      let newGLTF = gltfObject.clone();
      newGLTF.scale.set(0.1, 0.1, 0.1);
      let elemLigacaoAssociados = getElementosLigacaoByRotundaPartidaId(rotundas[i].identificador);
      let angle = getAnguloArmazem(elemLigacaoAssociados);
      
      gltfObject.traverseVisible(function (child) {
        if (child.material) {
            child.castShadow = true;
            child.receiveShadow = false;
        }
    });

      newGLTF.position.set(
        rotundas[i].x,
        rotundas[i].y - (INFINITESIMO * 2),   // PARA FICAR ASSENTE NAS estradas
        rotundas[i].z
      );
      newGLTF.rotateY(angle);
      newGLTF.translateZ(TRANSLATEZ_ARMAZEM_CONSTANT);

      let bodyArmazem = new CANNON.Body({
        shape: new CANNON.Box(new CANNON.Vec3(2.4 / 2, 2 / 2, 2.4 / 2)),
        position: new CANNON.Vec3(newGLTF.position.x, newGLTF.position.y + 1, newGLTF.position.z),
        type: CANNON.Body.STATIC
      });
      bodyArmazem.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle)
      world.addBody(bodyArmazem);

      let elementoLigacao = new ElementoLigacao({ angulo: angle }, rotundas[i], null);
      scene.add(elementoLigacao);
      world.addBody(elementoLigacao.body);

      let baseArmazem = new BaseWarehouse({ angulo: angle }, newGLTF);
      scene.add(baseArmazem);
      world.addBody(baseArmazem.body);

      scene.add(newGLTF);
    }
  });
}

function loadRotundasCentro() {
  gltfLoader.load("./assets/models/rotundaModel/scene.gltf", (gltf) => {
    for (let i = 0; i < rotundas.length; i++) {
      let gltfObject = gltf.scene;
      let newGLTF = gltfObject.clone();
    
      newGLTF.traverseVisible(function (child) {
        if (child.material) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      newGLTF.scale.set(0.034, 0.034, 0.034);
      newGLTF.position.set(rotundas[i].x, rotundas[i].y - 0.06, rotundas[i].z)
      scene.add(newGLTF);

      let bodyCentroRotunda = new CANNON.Body({
        shape: new CANNON.Cylinder(RAIO_ROTUNDA - 0.3, RAIO_ROTUNDA - 0.3, GROSSURA_OBJS + 0.5, 32),
        position: new CANNON.Vec3(rotundas[i].x, rotundas[i].y, rotundas[i].z),
        type: CANNON.Body.STATIC
      });
      world.addBody(bodyCentroRotunda);
    }
  });
}

function getElementosLigacaoByRotundaPartidaId(identificador) {
  let array = [];
  elementosLigacao.forEach(elem => {
    if (elem.rotundaPartida.identificador == identificador) array.push(elem);
  });
  return array;
}

function getAnguloArmazem(elemsLigacao) {
  let maximo = {
    orientacao1: 0,
    maxAngulo: 0
  };
  getElementosLigacaoOrderedByAngulo(elemsLigacao);

  if (elemsLigacao.length == 0) {
    return 0;
  }
  if (elementosLigacao.length == 1) {
    return elementosLigacao[0].angulo + Math.PI;
  }

  for (let i = 0; i < elemsLigacao.length; i++) {
    let angulo = 0;
    if (i == (elemsLigacao.length - 1)) {
      angulo = (elemsLigacao[0].angulo + (Math.PI * 2)) - elemsLigacao[i].angulo;
      if (angulo > maximo.maxAngulo) {
        maximo.maxAngulo = angulo;
        maximo.orientacao1 = elemsLigacao[i].angulo
      }
    } else {
      angulo = elemsLigacao[i + 1].angulo - elemsLigacao[i].angulo;
      if (angulo > maximo.maxAngulo) {
        maximo.maxAngulo = angulo;
        maximo.orientacao1 = elemsLigacao[i].angulo
      }
    }
  }
  return (maximo.maxAngulo / 2) + maximo.orientacao1;
}

function getElementosLigacaoOrderedByAngulo(elemsLigacao) {
  for (let i = 0; i < elemsLigacao; i++) {
    for (let j = 0; j < elementosLigacao; j++) {
      if (elemsLigacao[j].angulo < elemsLigacao[i].angulo) {
        let aux = elemsLigacao[i];
        elemsLigacao[i] = elemsLigacao[j];
        elemsLigacao[j] = aux;
      }
    }
  }
}

// UI
function setTargetOrbit(id) {
  if (id == "selected") {
    orbit.target.set(0, 0, 0);
    orbit.update();
    return;
  }
  if(id == "truck"){
    orbit.target.set(truckBody.position.x,truckBody.position.y,truckBody.position.z);
    orbit.update();
    return;
  }
  let r = getRotundaById(id);
  orbit.target.set(r.x, r.y, r.z);
  orbit.update();
}

var select = document.getElementById("Orbitselector");
select.addEventListener("change", () => {
  var rotTarget = select.options[select.selectedIndex].value;
  if(rotTarget == "truck") pointToTruck = true;
  else pointToTruck = false;
  setTargetOrbit(rotTarget);
});

// Reset button
var resetView = document.getElementById("reset");
resetView.addEventListener("click", () => {
  setTargetOrbit("selected");
  select.options.selectedIndex = "selected";
});

var rotBegin = 0;
var origin = document.getElementById("roundaboutOrigin");
origin.addEventListener("change", () => {
  rotBegin = origin.options[origin.selectedIndex].value;

});

var rotEnd = 0;
var destiny = document.getElementById("roundaboutDestiny");
destiny.addEventListener("change", () => {
  rotEnd = destiny.options[destiny.selectedIndex].value;
});

// Go button
var start = document.getElementById("goTo");
start.addEventListener("click", () => {
  moveObject(camiao.scene, rotBegin, rotEnd, 10);
});

function autonomousMovement(begin, end){
  var beginRotunda = getRotundaById(begin);
  var endRotunda = getRotundaById(end);

  const startPosition = new THREE.Vector3(beginRotunda.x, beginRotunda.y, beginRotunda.z);
  const endPosition = new THREE.Vector3(endRotunda.x, endRotunda.y, endRotunda.z);

  const startKeyframe = {
    position: startPosition
  };

  const endKeyframe = {
    position: endPosition
  };

  const track = new THREE.NumberKeyframeTrack(
    ".position",
    [0, 1],
    [startKeyframe.position.x, endKeyframe.position.x,
    startKeyframe.position.y, endKeyframe.position.y,
    startKeyframe.position.z, endKeyframe.position.z],
    THREE.InterpolateLinear
  );

  const clip = new THREE.AnimationClip("movement", 100, [track]);

  console.log(mixer);
  // Play the animation.
  const action = mixer.clipAction(clip).play();
}

function moveObject(object, start, end, duration) {
  var beginRotunda = getRotundaById(start);
  var endRotunda = getRotundaById(end);

  const startPosition = new THREE.Vector3(beginRotunda.x, beginRotunda.y, beginRotunda.z);
  const endPosition = new THREE.Vector3(endRotunda.x, endRotunda.y, endRotunda.z);

  const delta = new THREE.Vector3().subVectors(endPosition, startPosition);
  const time = performance.now();
  let elapsedTime = 0;
  const deltaTime = time - elapsedTime;
  const update = () => {
    elapsedTime += deltaTime;
    const t = elapsedTime / duration;
    console.log(object.position)
    object.position.copy(startPosition).addScaledVector(delta, t);

    if (elapsedTime < duration) {
      requestAnimationFrame(update);
    }
  };

  update();
}
