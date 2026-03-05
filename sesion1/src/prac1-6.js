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
    new THREE.MeshLambertMaterial({ color: 0x55ff55 })
);
cylinder.position.set(-90, 0, 0);
cylinder.rotation.set(Math.PI / 8, Math.PI / 8, 0);

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(60, 32, 16),
    new THREE.MeshPhongMaterial({
        color: 0x5599ff,
        specular: 0xffffff,
        shininess: 60
    })
);
sphere.position.set(90, 0, 0);
sphere.rotation.set(Math.PI / 8, Math.PI / 8, 0);

const houseShape = new THREE.Shape();
houseShape.moveTo(-50, -60);
houseShape.lineTo(-10, -60);
houseShape.lineTo(-10, -28);
houseShape.lineTo(10, -28);
houseShape.lineTo(10, -60);
houseShape.lineTo(50, -60);
houseShape.lineTo(50, 20);
houseShape.lineTo(0, 70);
houseShape.lineTo(-50, 20);
houseShape.closePath();

const houseGeometry = new THREE.ShapeGeometry(houseShape);

const house = new THREE.Mesh(
    houseGeometry,
    new THREE.MeshBasicMaterial({ color: 0xffdd55, side: THREE.DoubleSide })
);
house.position.set(270, 0, 0);

const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x88ccff });

const leftWindow = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    windowMaterial
);
leftWindow.position.set(-20, -5, 0.5);

const rightWindow = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    windowMaterial
);
rightWindow.position.set(20, -5, 0.5);

house.add(leftWindow);
house.add(rightWindow);

const ambientLight = new THREE.AmbientLight(0x404040, 1.2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 100000);
pointLight.position.set(300, 250, 300);
scene.add(pointLight);

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
