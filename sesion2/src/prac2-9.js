import * as THREE from "three";
import WEBGL from "three/examples/jsm/capabilities/WebGL.js";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

if (!WEBGL.isWebGL2Available()) {
    document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
    throw new Error("WebGL2 is not available.");
}

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
);
camera.position.set(0, 2, 8);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;

const ambient = new THREE.AmbientLight(0x404040, 2.0);
scene.add(ambient);

const point = new THREE.PointLight(0xffffff, 80, 0, 2);
point.position.set(-30, 12, 20);
scene.add(point);

const modelUrl = "../models/iss.dae";
let iss;

const loadingManager = new THREE.LoadingManager(() => {
    scene.add(iss);
    console.log("Model loaded");
});

const loader = new ColladaLoader(loadingManager);
loader.load(modelUrl, (collada) => {
    iss = collada.scene;
    iss.scale.x = iss.scale.y = iss.scale.z = 0.3;
    iss.rotation.set(Math.PI / 5, Math.PI / 5, 0);
    iss.updateMatrix();
});

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.update();
});

const clock = new THREE.Clock();

function animate() {
    const delta = clock.getDelta();

    if (iss) {
        iss.rotation.y += 0.25 * delta;
    }

    controls.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
