import * as THREE from "three";
import WEBGL from "three/examples/jsm/capabilities/WebGL.js";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls.js";

if (!WEBGL.isWebGL2Available()) {
    document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
    throw new Error("WebGL2 is not available.");
}

const overlay = document.getElementById("overlay");
const startButton = document.getElementById("startButton");

let scene;
let camera;
let renderer;
let controls;
let clock;
let raycaster;
let listener;
let hoveredCube = null;
let sceneStarted = false;

const pointer = new THREE.Vector2(2, 2);
const interactiveCubes = [];

function createCubeMaterials(textureLoader) {
    const regularMap = textureLoader.load("./textures/descargar.jpg");
    regularMap.colorSpace = THREE.SRGBColorSpace;
    const regularBumpMap = textureLoader.load("./textures/descargar2.jpg");

    const specialMap = textureLoader.load("./textures/textura_desactivado.png");
    specialMap.colorSpace = THREE.SRGBColorSpace;
    const specialBumpMap = textureLoader.load("./textures/textura1.png");

    const regularFaceMaterial = new THREE.MeshPhongMaterial({
        map: regularMap,
        bumpMap: regularBumpMap,
        bumpScale: 2.2
    });

    const specialFaceMaterial = new THREE.MeshPhongMaterial({
        map: specialMap,
        bumpMap: specialBumpMap,
        bumpScale: 2.8
    });

    return { regularFaceMaterial, specialFaceMaterial };
}

function buildCube(materials, position, specialFaceOnLeft, soundPath, color) {
    const cubeGeometry = new THREE.BoxGeometry(50, 50, 50);
    const specialMaterial = materials.specialFaceMaterial.clone();
    const regularMaterialA = materials.regularFaceMaterial.clone();
    const regularMaterialB = materials.regularFaceMaterial.clone();
    const regularMaterialC = materials.regularFaceMaterial.clone();
    const regularMaterialD = materials.regularFaceMaterial.clone();
    const regularMaterialE = materials.regularFaceMaterial.clone();
    const faceMaterials = specialFaceOnLeft
        ? [
            regularMaterialA,
            specialMaterial,
            regularMaterialB,
            regularMaterialC,
            regularMaterialD,
            regularMaterialE
        ]
        : [
            specialMaterial,
            regularMaterialA,
            regularMaterialB,
            regularMaterialC,
            regularMaterialD,
            regularMaterialE
        ];

    const cube = new THREE.Mesh(cubeGeometry, faceMaterials);
    cube.position.copy(position);
    cube.userData.baseEmissive = new THREE.Color(0x000000);
    cube.userData.highlightEmissive = new THREE.Color(color);
    cube.userData.soundReady = false;
    cube.userData.soundPath = soundPath;
    cube.userData.label = specialFaceOnLeft ? "caja derecha" : "caja izquierda";

    return cube;
}

function setCubeHighlight(cube, enabled) {
    const emissive = enabled ? cube.userData.highlightEmissive : cube.userData.baseEmissive;
    cube.material.forEach((material) => {
        material.emissive.copy(emissive);
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
    const materials = createCubeMaterials(textureLoader);

    const leftCube = buildCube(
        materials,
        new THREE.Vector3(-240, 25, 0),
        false,
        "./sounds/audio1.ogg",
        0x1d4ed8
    );
    scene.add(leftCube);
    interactiveCubes.push(leftCube);

    const rightCube = buildCube(
        materials,
        new THREE.Vector3(240, 25, 0),
        true,
        "./sounds/audio2.ogg",
        0xb91c1c
    );
    scene.add(rightCube);
    interactiveCubes.push(rightCube);

    attachPositionalSound(leftCube, "./sounds/audio1.ogg");
    attachPositionalSound(rightCube, "./sounds/audio2.ogg");

    controls = new FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 70;
    controls.lookSpeed = 0.05;
    controls.noFly = false;
    controls.lookVertical = false;

    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("keydown", onKeyDown);

    renderer.domElement.focus();
    animate();
}

function onPointerMove(event) {
    if (!renderer) {
        return;
    }

    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

async function onKeyDown(event) {
    if (event.code !== "Space" || !hoveredCube) {
        return;
    }

    event.preventDefault();

    if (listener.context.state === "suspended") {
        await listener.context.resume();
    }

    const sound = hoveredCube.userData.sound;
    if (!hoveredCube.userData.soundReady || !sound?.buffer) {
        return;
    }

    if (sound.isPlaying) {
        sound.pause();
        return;
    }

    sound.play();
}

function updateHoveredCube() {
    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(interactiveCubes, false);
    const nextHoveredCube = intersections.length > 0 ? intersections[0].object : null;

    if (hoveredCube === nextHoveredCube) {
        return;
    }

    if (hoveredCube) {
        setCubeHighlight(hoveredCube, false);
    }

    hoveredCube = nextHoveredCube;

    if (hoveredCube) {
        setCubeHighlight(hoveredCube, true);
        document.body.style.cursor = "pointer";
    } else {
        document.body.style.cursor = "default";
    }
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
    updateHoveredCube();
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
