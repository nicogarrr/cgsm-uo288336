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
camera.position.set(0, 0, 700);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(100, 100, 100),
    new THREE.MeshBasicMaterial({ color: 0xff5555 })
);
cube.position.set(-270, 0, 0);
cube.rotation.set(Math.PI / 8, Math.PI / 8, 0);

const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(50, 50, 120, 32),
    new THREE.MeshBasicMaterial({ color: 0x55ff55 })
);
cylinder.position.set(-90, 0, 0);
cylinder.rotation.set(Math.PI / 8, Math.PI / 8, 0);

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(60, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0x5599ff })
);
sphere.position.set(90, 0, 0);
sphere.rotation.set(Math.PI / 8, Math.PI / 8, 0);

const houseGeometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
    -50, -60, 0,
    50, -60, 0,
    50, 20, 0,
    0, 70, 0,
    -50, 20, 0
]);
const indices = [
    0, 1, 2,
    0, 2, 4,
    4, 2, 3
];
houseGeometry.setIndex(indices);
houseGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
houseGeometry.computeVertexNormals();

const house = new THREE.Mesh(
    houseGeometry,
    new THREE.MeshBasicMaterial({ color: 0xffdd55, side: THREE.DoubleSide })
);
house.position.set(270, 0, 0);

scene.add(cube);
scene.add(cylinder);
scene.add(sphere);
scene.add(house);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}, false);

renderer.render(scene, camera);
