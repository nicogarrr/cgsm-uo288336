import * as THREE from "three";
import WEBGL from "three/examples/jsm/capabilities/WebGL.js";

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
    1,
    4000
);
camera.position.set(0, 0, 450);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(100, 100, 100),
    new THREE.MeshBasicMaterial({ color: 0xff5555 })
);
cube.position.set(-170, 0, 0);

const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(50, 50, 120, 32),
    new THREE.MeshBasicMaterial({ color: 0x55ff55 })
);
cylinder.position.set(0, 0, 0);

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(60, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0x5599ff })
);
sphere.position.set(170, 0, 0);

cube.rotation.set(Math.PI / 8, Math.PI / 8, 0);
cylinder.rotation.set(Math.PI / 8, Math.PI / 8, 0);
sphere.rotation.set(Math.PI / 8, Math.PI / 8, 0);

scene.add(cube);
scene.add(cylinder);
scene.add(sphere);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}, false);

renderer.render(scene, camera);
