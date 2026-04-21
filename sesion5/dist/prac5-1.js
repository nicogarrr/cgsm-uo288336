const status = document.getElementById("status");
const url = "./media/sintel/sintel_final.mpd";
const player = dashjs.MediaPlayer().create();

function setStatus(message) {
    status.textContent = message;
}

player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
    setStatus("Stream DASH inicializado correctamente.");
});

player.on(dashjs.MediaPlayer.events.PLAYBACK_PLAYING, () => {
    setStatus("Reproduccion en curso.");
});

player.on(dashjs.MediaPlayer.events.ERROR, () => {
    setStatus("No se pudo reproducir el manifiesto DASH.");
});

setStatus(`Cargando manifiesto: ${url}`);
player.initialize(document.querySelector("#player"), url, true);
