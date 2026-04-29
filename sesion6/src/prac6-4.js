import adapter from 'webrtc-adapter';
import * as THREE from "three";
import WEBGL from "three/examples/jsm/capabilities/WebGL.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

if ( !WEBGL.isWebGL2Available() ) {
    document.body.appendChild( WEBGL.getWebGL2ErrorMessage() );
    throw new Error( "WebGL2 is not available." );
}

const video = document.getElementById( "video" );
const overlay = document.getElementById( "overlay" );
const startButton = document.getElementById( "startButton" );
const constraints = {
    audio: false,
    video: {
        width: { ideal: 640 },
        height: { ideal: 480 }
    }
};

let localStream;
let camera;
let scene;
let renderer;
let wall;
let imageContext;
let texture;
let stats;
const controlData = {
    pauseVideo: false
};

console.log( "Using adapter.js for: ", adapter.browserDetails.browser );

function initScene( ) {
    scene = new THREE.Scene( );
    scene.background = new THREE.Color( 0x000000 );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    stats = new Stats( );
    stats.dom.style.position = "absolute";
    stats.dom.style.top = "0px";
    document.body.appendChild( stats.dom );

    const gui = new GUI( );
    gui.title( "Controles" );
    gui.add( controlData, "pauseVideo" ).name( "Pausar video" );

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        4000
    );
    camera.position.set( 0, 0, 700 );

    const image = document.createElement( "canvas" );
    image.width = video.videoWidth || 640;
    image.height = video.videoHeight || 480;
    imageContext = image.getContext( "2d" );
    imageContext.fillStyle = "#000000";
    imageContext.fillRect( 0, 0, image.width, image.height );

    texture = new THREE.Texture( image );

    const material = new THREE.MeshBasicMaterial( { map: texture } );
    const planeHeight = 360;
    const planeWidth = planeHeight * ( image.width / image.height );
    wall = new THREE.Mesh( new THREE.PlaneGeometry( planeWidth, planeHeight, 4, 4 ), material );
    scene.add( wall );

    window.addEventListener( "resize", onResize, false );
    animate( );
}

function onResize( ) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix( );
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate( ) {
    requestAnimationFrame( animate );

    wall.rotation.y += 0.01;

    if ( !controlData.pauseVideo && video.readyState >= video.HAVE_CURRENT_DATA ) {
        imageContext.drawImage( video, 0, 0, imageContext.canvas.width, imageContext.canvas.height );
        texture.needsUpdate = true;
    }

    stats.update( );
    renderer.render( scene, camera );
}

startButton.addEventListener( "click", async () => {
    startButton.disabled = true;

    try {
        localStream = await navigator.mediaDevices.getUserMedia( constraints );
        video.srcObject = localStream;
        await video.play( );

        overlay.style.display = "none";
        initScene( );
    } catch ( error ) {
        startButton.disabled = false;
        console.error( "No se pudo obtener video de la webcam:", error );
    }
}, { once: true } );

window.addEventListener( "beforeunload", () => {
    if ( localStream ) {
        localStream.getTracks( ).forEach( track => track.stop( ) );
    }
} );
