import * as THREE from "three";
import WEBGL from "three/examples/jsm/capabilities/WebGL.js";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls.js";

if (!WEBGL.isWebGL2Available()) {
    document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
    throw new Error("WebGL2 is not available.");
}

const overlay = document.getElementById("overlay");
const startButton = document.getElementById("startButton");
const selectionInfo = document.getElementById("selectionInfo");

let scene;
let camera;
let renderer;
let controls;
let clock;
let listener;
let sceneStarted = false;
let intersectedObject = null;

const rayCaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(2, 2);
const selectableObjects = [];

function loadTextures(textureLoader) {
    const inactiveMap = textureLoader.load("./textures/textura_desactivado.png");
    inactiveMap.colorSpace = THREE.SRGBColorSpace;

    const activeMap = textureLoader.load("./textures/textura_sonido.png");
    activeMap.colorSpace = THREE.SRGBColorSpace;

    const buttonBumpMap = textureLoader.load("./textures/textura1.png");

    const regularMap = textureLoader.load("./textures/descargar.jpg");
    regularMap.colorSpace = THREE.SRGBColorSpace;

    const regularBumpMap = textureLoader.load("./textures/descargar2.jpg");

    return { inactiveMap, activeMap, buttonBumpMap, regularMap, regularBumpMap };
}

function createRegularMaterial(textures) {
    return new THREE.MeshPhongMaterial({
        map: textures.regularMap,
        bumpMap: textures.regularBumpMap,
        bumpScale: 2.2
    });
}

function createButtonMaterial(textures, enabled) {
    return new THREE.MeshPhongMaterial({
        map: enabled ? textures.activeMap : textures.inactiveMap,
        bumpMap: textures.buttonBumpMap,
        bumpScale: 2.8
    });
}

function buildCube(name, position, audioPath, color, textures, buttonFaceIndex) {
    const faceMaterials = Array.from(
        { length: 6 },
        () => createRegularMaterial(textures)
    );
    const inactiveButtonMaterial = createButtonMaterial(textures, false);
    const activeButtonMaterial = createButtonMaterial(textures, true);
    faceMaterials[buttonFaceIndex] = inactiveButtonMaterial;

    const cube = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50), faceMaterials);

    cube.name = name;
    cube.position.copy(position);
    cube.userData.baseEmissive = new THREE.Color(0x000000);
    cube.userData.highlightEmissive = new THREE.Color(color);
    cube.userData.soundReady = false;
    cube.userData.soundEnabled = false;
    cube.userData.audioPath = audioPath;
    cube.userData.buttonFaceIndex = buttonFaceIndex;
    cube.userData.inactiveButtonMaterial = inactiveButtonMaterial;
    cube.userData.activeButtonMaterial = activeButtonMaterial;

    applyCubeVisualState(cube, false);
    return cube;
}

function applyCubeVisualState(cube, selected) {
    const emissive = selected ? cube.userData.highlightEmissive : cube.userData.baseEmissive;
    const nextMaterials = cube.material.slice();
    nextMaterials[cube.userData.buttonFaceIndex] = cube.userData.soundEnabled
        ? cube.userData.activeButtonMaterial
        : cube.userData.inactiveButtonMaterial;
    cube.material = nextMaterials;

    cube.material.forEach((material) => {
        material.emissive.copy(emissive);
        material.needsUpdate = true;
    });
}

function attachPositionalSound(cube, audioPath) {
    const audioLoader = new THREE.AudioLoader();
    const sound = new THREE.PositionalAudio(listener);
    sound.setRefDistance(80);
    sound.setLoop(true);
    sound.setRolloffFactor(1.2);
    sound.setVolume(0.8);

    audioLoader.load(audioPath, (buffer) => {
        sound.setBuffer(buffer);
        cube.userData.soundReady = true;
    });

    cube.add(sound);
    cube.userData.sound = sound;
}

function updateSelectionInfo() {
    if (!intersectedObject) {
        selectionInfo.textContent = "Objeto intersecado: ninguno";
        return;
    }

    const soundState = intersectedObject.userData.soundEnabled ? "sonando" : "silenciado";
    selectionInfo.textContent = `Objeto intersecado: ${intersectedObject.name} (${soundState})`;
}

function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.tabIndex = 0;
    document.body.appendChild(renderer.domElement);

    renderer.domElement.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        4000
    );
    camera.position.set(0, 40, 260);

    listener = new THREE.AudioListener();
    camera.add(listener);

    const helper = new THREE.GridHelper(800, 40, 0x444444, 0x444444);
    helper.position.y = 0.1;
    scene.add(helper);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 0.5, 100);
    scene.add(directionalLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xf0f0f0, 0.6);
    hemiLight.position.set(0, 500, 0);
    scene.add(hemiLight);

    const textureLoader = new THREE.TextureLoader();
    const textures = loadTextures(textureLoader);

    const leftCube = buildCube(
        "leftCube",
        new THREE.Vector3(-240, 25, 0),
        "./sounds/audio1.ogg",
        0x1d4ed8,
        textures,
        0
    );
    scene.add(leftCube);
    selectableObjects.push(leftCube);

    const rightCube = buildCube(
        "rightCube",
        new THREE.Vector3(240, 25, 0),
        "./sounds/audio2.ogg",
        0xb91c1c,
        textures,
        1
    );
    scene.add(rightCube);
    selectableObjects.push(rightCube);

    attachPositionalSound(leftCube, "./sounds/audio1.ogg");
    attachPositionalSound(rightCube, "./sounds/audio2.ogg");

    controls = new FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 70;
    controls.lookSpeed = 0.05;
    controls.noFly = false;
    controls.lookVertical = false;

    clock = new THREE.Clock();

    window.addEventListener("resize", onResize);
    document.body.addEventListener("mousemove", onMouseMove, false);
    document.body.addEventListener("keydown", onKeyDown, false);

    renderer.domElement.focus();
    animate();
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

async function onKeyDown(event) {
    const spaceKeyCode = "Space";

    if (event.code !== spaceKeyCode || !intersectedObject) {
        return;
    }

    event.preventDefault();

    if (listener.context.state === "suspended") {
        await listener.context.resume();
    }

    const sound = intersectedObject.userData.sound;
    if (!intersectedObject.userData.soundReady || !sound?.buffer) {
        return;
    }

    if (sound.isPlaying === true) {
        sound.pause();
        intersectedObject.userData.soundEnabled = false;
    } else {
        sound.play();
        intersectedObject.userData.soundEnabled = true;
    }

    applyCubeVisualState(intersectedObject, true);
    updateSelectionInfo();
}

function updateIntersectedObject() {
    rayCaster.setFromCamera(mouse, camera);

    const intersects = rayCaster.intersectObjects(selectableObjects, false);
    if (intersects.length > 0) {
        if (intersectedObject !== intersects[0].object) {
            if (intersectedObject) {
                applyCubeVisualState(intersectedObject, false);
            }

            intersectedObject = intersects[0].object;
            applyCubeVisualState(intersectedObject, true);
            updateSelectionInfo();
            console.log(`New intersected object: ${intersectedObject.name}`);
        }
    } else if (intersectedObject) {
        applyCubeVisualState(intersectedObject, false);
        intersectedObject = null;
        updateSelectionInfo();
    }

    document.body.style.cursor = intersectedObject ? "pointer" : "default";
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    controls.update(delta);
    updateIntersectedObject();
    renderer.render(scene, camera);
}

startButton.addEventListener("click", async () => {
    overlay.style.display = "none";

    if (!sceneStarted) {
        initScene();
        sceneStarted = true;
    }

    if (listener.context.state === "suspended") {
        await listener.context.resume();
    }
}, { once: true });
