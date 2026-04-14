import * as THREE from "three";
import WEBGL from "three/examples/jsm/capabilities/WebGL.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

if (!WEBGL.isWebGL2Available()) {
    document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
    throw new Error("WebGL2 is not available.");
}

const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const startButton = document.getElementById("startButton");

let camera;
let scene;
let renderer;
let wall;
let imageContext;
let texture;
let reverseEnabled = false;
let stats;
const controlData = {
    pauseVideo: false
};

const reverseStep = 1 / 30;
let reverseSeekInProgress = false;
let lastReverseTick = 0;

video.preload = "auto";
video.addEventListener("seeked", () => {
    reverseSeekInProgress = false;
});

function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    stats.dom.style.position = "absolute";
    stats.dom.style.top = "0px";
    document.body.appendChild(stats.dom);

    const gui = new GUI();
    gui.title("Controles");
    gui.add(controlData, "pauseVideo").name("Pausar video");

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        4000
    );
    camera.position.set(0, 0, 700);

    const image = document.createElement("canvas");
    image.width = 480;
    image.height = 204;
    imageContext = image.getContext("2d");
    imageContext.fillStyle = "#000000";
    imageContext.fillRect(0, 0, image.width - 1, image.height - 1);

    texture = new THREE.Texture(image);

    const material = new THREE.MeshBasicMaterial({ map: texture });
    wall = new THREE.Mesh(new THREE.PlaneGeometry(image.width, image.height, 4, 4), material);
    scene.add(wall);

    window.addEventListener("resize", onResize, false);
    animate();
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    if (reverseEnabled && !controlData.pauseVideo && video.duration > 0 && !reverseSeekInProgress && now - lastReverseTick >= 33) {
        lastReverseTick = now;
        reverseSeekInProgress = true;

        let nextTime = video.currentTime - reverseStep;
        if (nextTime <= 0) {
            nextTime = Math.max(video.duration - reverseStep, 0);
        }
        video.currentTime = nextTime;
    }

    wall.rotation.y += 0.01;

    if (video.readyState >= video.HAVE_CURRENT_DATA) {
        imageContext.drawImage(video, 0, 0);
        texture.needsUpdate = true;
    }

    stats.update();
    renderer.render(scene, camera);
}

startButton.addEventListener("click", async () => {
    overlay.style.display = "none";

    try {
        video.load();

        if (video.readyState < video.HAVE_METADATA) {
            await new Promise((resolve) => {
                video.addEventListener("loadedmetadata", resolve, { once: true });
            });
        }

        video.pause();
        video.currentTime = Math.max(video.duration - 0.001, 0);
        reverseEnabled = true;
    } catch (error) {
        console.error("No se pudo inicializar el video en modo inverso:", error);
    }

    initScene();
}, { once: true });
