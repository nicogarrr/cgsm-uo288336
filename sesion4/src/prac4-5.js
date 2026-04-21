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
const video = document.getElementById("video");

let scene;
let camera;
let renderer;
let controls;
let clock;
let sceneStarted = false;
let intersectedObject = null;
let videoCanvas;
let videoContext;
let videoTexture;

const rayCaster = new THREE.Raycaster();
const collisionRayCaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(2, 2);
const selectableObjects = [];
const upAxis = new THREE.Vector3(0, 1, 0);
const movements = [
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(1, 0, 1),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(1, 0, -1),
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(-1, 0, -1),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(-1, 0, 1)
];

function loadTextures(textureLoader) {
    const startMap = textureLoader.load("./textures/textura_sonido.png");
    startMap.colorSpace = THREE.SRGBColorSpace;

    const pauseMap = textureLoader.load("./textures/textura_desactivado.png");
    pauseMap.colorSpace = THREE.SRGBColorSpace;

    const buttonBumpMap = textureLoader.load("./textures/textura1.png");
    const regularMap = textureLoader.load("./textures/descargar.jpg");
    regularMap.colorSpace = THREE.SRGBColorSpace;
    const regularBumpMap = textureLoader.load("./textures/descargar2.jpg");

    return { startMap, pauseMap, buttonBumpMap, regularMap, regularBumpMap };
}

function createRegularMaterial(textures) {
    return new THREE.MeshPhongMaterial({
        map: textures.regularMap,
        bumpMap: textures.regularBumpMap,
        bumpScale: 2.2
    });
}

function createButtonMaterial(textureMap, textures) {
    return new THREE.MeshPhongMaterial({
        map: textureMap,
        bumpMap: textures.buttonBumpMap,
        bumpScale: 2.8
    });
}

function buildCube(name, position, color, textures, buttonFaceIndex, action) {
    const faceMaterials = Array.from(
        { length: 6 },
        () => createRegularMaterial(textures)
    );
    const buttonMap = action === "play" ? textures.startMap : textures.pauseMap;
    const buttonMaterial = createButtonMaterial(buttonMap, textures);
    faceMaterials[buttonFaceIndex] = buttonMaterial;

    const cube = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50), faceMaterials);
    cube.name = name;
    cube.position.copy(position);
    cube.userData.action = action;
    cube.userData.buttonFaceIndex = buttonFaceIndex;
    cube.userData.baseEmissive = new THREE.Color(0x000000);
    cube.userData.highlightEmissive = new THREE.Color(color);
    cube.userData.buttonMaterial = buttonMaterial;

    applyCubeHighlight(cube, false);
    return cube;
}

function applyCubeHighlight(cube, selected) {
    const emissive = selected ? cube.userData.highlightEmissive : cube.userData.baseEmissive;
    cube.material.forEach((material) => {
        material.emissive.copy(emissive);
        material.needsUpdate = true;
    });
}

function createVideoScreen() {
    videoCanvas = document.createElement("canvas");
    videoCanvas.width = 480;
    videoCanvas.height = 204;
    videoContext = videoCanvas.getContext("2d");
    videoContext.fillStyle = "#000000";
    videoContext.fillRect(0, 0, videoCanvas.width, videoCanvas.height);

    videoTexture = new THREE.Texture(videoCanvas);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.generateMipmaps = false;

    const screenGroup = new THREE.Group();

    const screenMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
    const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(220, 93.5),
        screenMaterial
    );
    screen.position.set(0, 130, -180);
    screenGroup.add(screen);

    const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x0f172a });
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(236, 110, 8),
        frameMaterial
    );
    frame.position.set(0, 130, -184);
    screenGroup.add(frame);

    const stand = new THREE.Mesh(
        new THREE.BoxGeometry(20, 70, 20),
        new THREE.MeshPhongMaterial({ color: 0x1e293b })
    );
    stand.position.set(0, 60, -184);
    screenGroup.add(stand);

    scene.add(screenGroup);
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
        0x22c55e,
        textures,
        0,
        "play"
    );
    scene.add(leftCube);
    selectableObjects.push(leftCube);

    const rightCube = buildCube(
        "rightCube",
        new THREE.Vector3(240, 25, 0),
        0xef4444,
        textures,
        1,
        "pause"
    );
    scene.add(rightCube);
    selectableObjects.push(rightCube);

    createVideoScreen();

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

function updateSelectionInfo() {
    if (!intersectedObject) {
        selectionInfo.textContent = "Objeto intersecado: ninguno";
        return;
    }

    const actionText = intersectedObject.userData.action === "play"
        ? "iniciar video"
        : "pausar video";
    selectionInfo.textContent = `Objeto intersecado: ${intersectedObject.name} (${actionText})`;
}

async function onKeyDown(event) {
    const spaceKeyCode = "Space";

    if (event.code !== spaceKeyCode || !intersectedObject) {
        return;
    }

    event.preventDefault();

    try {
        if (intersectedObject.userData.action === "play") {
            video.currentTime = Math.max(video.currentTime, 0);
            await video.play();
        } else {
            video.pause();
        }
    } catch (error) {
        console.error("No se pudo controlar el video:", error);
    }
}

function updateIntersectedObject() {
    rayCaster.setFromCamera(mouse, camera);

    const intersects = rayCaster.intersectObjects(selectableObjects, false);
    if (intersects.length > 0) {
        if (intersectedObject !== intersects[0].object) {
            if (intersectedObject) {
                applyCubeHighlight(intersectedObject, false);
            }

            intersectedObject = intersects[0].object;
            applyCubeHighlight(intersectedObject, true);
            updateSelectionInfo();
            console.log(`New intersected object: ${intersectedObject.name}`);
        }
    } else if (intersectedObject) {
        applyCubeHighlight(intersectedObject, false);
        intersectedObject = null;
        updateSelectionInfo();
    }

    document.body.style.cursor = intersectedObject ? "pointer" : "default";
}

function detectCollision() {
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;

    if (forward.lengthSq() === 0) {
        return false;
    }

    forward.normalize();
    const left = new THREE.Vector3().crossVectors(upAxis, forward).normalize();
    const distance = 20;

    for (const movement of movements) {
        const direction = new THREE.Vector3();
        direction.addScaledVector(left, movement.x);
        direction.addScaledVector(forward, movement.z);

        if (direction.lengthSq() === 0) {
            continue;
        }

        direction.normalize();
        collisionRayCaster.set(camera.position, direction);

        const collisions = collisionRayCaster.intersectObjects(selectableObjects, false);
        if (collisions.length > 0 && collisions[0].distance <= distance) {
            return true;
        }
    }

    return false;
}

function updateVideoTexture() {
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
        videoContext.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
        videoTexture.needsUpdate = true;
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

    if (detectCollision()) {
        controls.update(-delta);
    }

    updateIntersectedObject();
    updateVideoTexture();
    renderer.render(scene, camera);
}

startButton.addEventListener("click", () => {
    overlay.style.display = "none";

    if (!sceneStarted) {
        initScene();
        sceneStarted = true;
    }
}, { once: true });
