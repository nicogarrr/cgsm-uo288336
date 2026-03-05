import * as THREE from "three";
import WEBGL from "three/examples/jsm/capabilities/WebGL.js";

const statusElement = document.getElementById("status");

if (WEBGL.isWebGL2Available()) {
    statusElement.textContent = `WebGL2 is available. three.js revision: r${THREE.REVISION}.`;
    statusElement.classList.add("ok");
} else {
    statusElement.textContent = "WebGL2 is not available in this browser.";
    statusElement.classList.add("error");
    document.body.appendChild(WEBGL.getWebGL2ErrorMessage());
}
