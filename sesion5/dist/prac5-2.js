import * as THREE from "../vendor/three.module.min.js";

const DASH_URL = "./media/sintel/sintel_final.mpd";
const overlay = document.getElementById("overlay");
const startButton = document.getElementById("startButton");
const toggleButton = document.getElementById("toggleButton");
const hud = document.getElementById("hud");
const status = document.getElementById("status");
const video = document.getElementById("video");

let scene;
let camera;
let renderer;
let screen;
let drawCanvas;
let drawContext;
let videoTexture;
let player;
let started = false;

function setStatus(message) {
    status.textContent = message;
}

function createPlayer() {
    player = dashjs.MediaPlayer().create();
    player.initialize(video, DASH_URL, true);

    player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
        setStatus("Manifiesto cargado correctamente.");
        updateToggleButton();
    });

    player.on(dashjs.MediaPlayer.events.PLAYBACK_PLAYING, () => {
        setStatus("Reproduccion DASH activa en la textura.");
        updateToggleButton();
    });

    player.on(dashjs.MediaPlayer.events.ERROR, () => {
        setStatus("No se pudo reproducir el manifiesto DASH.");
    });
}

function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        3000
    );
    camera.position.set(0, 0, 700);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    drawCanvas = document.createElement("canvas");
    drawCanvas.width = 480;
    drawCanvas.height = 270;
    drawContext = drawCanvas.getContext("2d");
    drawContext.fillStyle = "#000000";
    drawContext.fillRect(0, 0, drawCanvas.width, drawCanvas.height);

    videoTexture = new THREE.Texture(drawCanvas);
    videoTexture.colorSpace = THREE.SRGBColorSpace;

    const screenMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
    screen = new THREE.Mesh(new THREE.PlaneGeometry(480, 270), screenMaterial);
    scene.add(screen);

    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(0, 0, 1);
    scene.add(light);

    window.addEventListener("resize", onResize);
}

function onResize() {
    if (!renderer || !camera) {
        return;
    }

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateToggleButton() {
    toggleButton.textContent = video.paused ? "Reanudar video" : "Pausar video";
}

function renderVideoFrame() {
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
        drawContext.drawImage(video, 0, 0, drawCanvas.width, drawCanvas.height);
        videoTexture.needsUpdate = true;
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (!screen || !renderer || !camera) {
        return;
    }

    screen.rotation.y += 0.01;
    renderVideoFrame();
    renderer.render(scene, camera);
}

function startScene() {
    if (started) {
        return;
    }

    started = true;
    overlay.style.display = "none";
    hud.hidden = false;
    setStatus(`Inicializando DASH con ${DASH_URL}`);

    createPlayer();
    initScene();
    animate();
}

toggleButton.addEventListener("click", async () => {
    if (video.paused) {
        try {
            await video.play();
            setStatus("Video reanudado.");
        } catch {
            setStatus("No se pudo reanudar el video.");
        }
    } else {
        video.pause();
        setStatus("Video pausado.");
    }

    updateToggleButton();
});

startButton.addEventListener("click", startScene, { once: true });

if (new URLSearchParams(window.location.search).get("autostart") === "1") {
    window.addEventListener("load", () => {
        window.setTimeout(startScene, 400);
    }, { once: true });
}
