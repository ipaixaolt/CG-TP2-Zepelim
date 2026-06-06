import { m4, parseRad, loadShaderSource, createProgram } from "./gl-utils.js";
import { loadUFO, drawUFO } from "./ufo.js";
import { loadFarm, drawFarm, FARM_BOUNDS } from "./farm.js";
import { camera } from "./camera.js";
import { loadSkybox, drawSkybox } from "./skybox.js";

const canvas = document.querySelector("#screen");

// Música
const music = document.getElementById("bg-music");
let musicPlaying = false;
let musicTogglePressed = false;

function startMusic() {
  if (!music) return;

  music.volume = 0.4;

  music.play().then(() => {
    musicPlaying = true;
  }).catch(() => {
    musicPlaying = false;
    console.warn("O navegador bloqueou o autoplay da música. Aperte M para tocar.");
  });
}

function handleMusicToggle() {
  const pressed = !!keys["m"];

  if (pressed && !musicTogglePressed) {
    if (!musicPlaying) {
      music.play().then(() => {
        musicPlaying = true;
      }).catch(() => {
        musicPlaying = false;
        console.warn("Não foi possível tocar a música.");
      });
    } else {
      music.pause();
      musicPlaying = false;
    }
  }

  musicTogglePressed = pressed;
}

// Tela de carregamento
const loadingScreen = document.querySelector("#loading-screen");
const loadingVideo = document.querySelector("#loading-video");
const loadingTextArea = document.querySelector("#loading-text-area");

// Assim que carregar a fazenda vai mostrar o vídeo de carregamento para dar uma vibe legal
function prepareLoadingVideoFirstFrame() {
  return new Promise((resolve) => {
    const showFirstFrame = () => {
      loadingVideo.pause();
      loadingVideo.currentTime = 0;
      resolve();
    };

    loadingVideo.pause();
    loadingVideo.currentTime = 0;

    if (loadingVideo.readyState >= 2) {
      showFirstFrame();
      return;
    }

    loadingVideo.addEventListener("loadeddata", showFirstFrame, { once: true });
    loadingVideo.load();
  });
}

// Música começa depois do vídeo de carregamento
function finishLoadingAndStartGame() {
  loadingScreen.classList.add("hidden");

  setTimeout(() => {
    loadingScreen.remove();
  }, 500);

  startMusic();
}

function playLoadingVideoAndShowScene() {
  if (loadingTextArea) {
    loadingTextArea.style.display = "none";
  }

  loadingVideo.currentTime = 0;

  const playPromise = loadingVideo.play();

  if (playPromise) {
    playPromise.catch(() => {
      finishLoadingAndStartGame();
    });
  }

  loadingVideo.addEventListener(
    "ended",
    () => {
      finishLoadingAndStartGame();
    },
    { once: true }
  );
}

// Carrega o webgl
const gl = canvas.getContext("webgl2");

if (!gl) {
  throw new Error("WebGL2 não disponível");
}

await prepareLoadingVideoFirstFrame();
console.log("Carregando modelos...");

const [vsSource, fsSource] = await Promise.all([
  loadShaderSource("./src/shaders/vertex.glsl"),
  loadShaderSource("./src/shaders/fragment.glsl"),
]);

const program = createProgram(gl, vsSource, fsSource);

const programInfo = {
  program,
  attribs: {
    position: gl.getAttribLocation(program, "a_position"),
    normal: gl.getAttribLocation(program, "a_normal"),
    texcoord: gl.getAttribLocation(program, "a_texcoord"),
  },
  uniforms: {
    world: gl.getUniformLocation(program, "u_world"),
    worldViewProjection: gl.getUniformLocation(program, "u_worldViewProjection"),
    worldInverseTranspose: gl.getUniformLocation(program, "u_worldInverseTranspose"),
    lightDirection: gl.getUniformLocation(program, "u_lightDirection"),
    cameraPosition: gl.getUniformLocation(program, "u_cameraPosition"),
    useLighting: gl.getUniformLocation(program, "u_useLighting"),
    ka: gl.getUniformLocation(program, "u_ka"),
    kd: gl.getUniformLocation(program, "u_kd"),
    ks: gl.getUniformLocation(program, "u_ks"),
    shininess: gl.getUniformLocation(program, "u_shininess"),
    texture: gl.getUniformLocation(program, "u_texture"),
    useTexture: gl.getUniformLocation(program, "u_useTexture"),
  },
};

camera.init(canvas);

// Para saber quando terminou de carregar para conseguir mostrar o vídeo de carregamento todo no tempo certo
const [ufoModel, farmModel, skyboxModel] = await Promise.all([
  loadUFO(gl, programInfo.attribs),
  loadFarm(gl, programInfo.attribs),
  loadSkybox(gl, programInfo.attribs),
]);

console.log("Modelos carregados. Vídeo de carregamento.");
playLoadingVideoAndShowScene();

const keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

const ufo = {
  x: 0,
  y: 18,
  z: 14,
  rotY: 0,
  speed: 0.08,
};

let lightingEnabled = true;
let lighting = false;

const ufoInfo = document.querySelector("#info");

// Escrita em tela
function updateHUD(auto) {
  const lightLabel = lightingEnabled ? "on" : "off";
  const musicLabel = musicPlaying ? "on" : "off";

  const fx = ufo.x.toFixed(1);
  const fy = ufo.y.toFixed(1);
  const fz = ufo.z.toFixed(1);

  ufoInfo.innerHTML =
    `<b>Posição:</b> x=${fx} &nbsp; y=${fy} &nbsp; z=${fz}<br>` +
    `<b>Câmera:</b> ${camera.cameraName()}<br>` +
    `<b>Iluminação (L):</b> ${lightLabel}<br>` +
    `<b>Música (M):</b> ${musicLabel}<br>` +
    `<b>Mouse -</b> Girar nave/câmera &nbsp; <b>W/S -</b> Frente/Trás &nbsp; <b>A/D -</b> Lados<br>` +
    `<b>Q/E -</b> Rotacionar nave &nbsp; <b>1/2/3 -</b> Câmera &nbsp; <b>Scroll -</b> Zoom &nbsp; <b>Esc -</b> Mostrar cursor`;
}

function updateUfo(time) {
  const ROT_SPEED = 0.035;

  // Q/E rotacionam a direção da nave/câmera
  if (keys["q"]) camera.yaw += ROT_SPEED;
  if (keys["e"]) camera.yaw -= ROT_SPEED;

  // A nave sempre acompanha a direção do mouse ou do Q/E
  ufo.rotY = camera.yaw;

  const sinR = Math.sin(ufo.rotY);
  const cosR = Math.cos(ufo.rotY);

  // Frente da nave
  const forwardX = sinR;
  const forwardZ = cosR;

  // Lado direito da nave
  const rightX = cosR;
  const rightZ = -sinR;

  // W = frente
  if (keys["w"]) {
    ufo.x += forwardX * ufo.speed;
    ufo.z += forwardZ * ufo.speed;
  }

  // S = trás
  if (keys["s"]) {
    ufo.x -= forwardX * ufo.speed;
    ufo.z -= forwardZ * ufo.speed;
  }

  // A = esquerda
  if (keys["a"]) {
    ufo.x += rightX * ufo.speed;
    ufo.z += rightZ * ufo.speed;
  }

  // D = direita
  if (keys["d"]) {
    ufo.x -= rightX * ufo.speed;
    ufo.z -= rightZ * ufo.speed;
  }

  // A nave só consegue voar entre os limites da fazenda
  ufo.x = Math.max(FARM_BOUNDS.minX, Math.min(FARM_BOUNDS.maxX, ufo.x));
  ufo.z = Math.max(FARM_BOUNDS.minZ, Math.min(FARM_BOUNDS.maxZ, ufo.z));

  return false;
}

// Alterna iluminação
function handleLightingToggle() {
  const pressed = !!keys["l"];

  if (pressed && !lighting) {
    console.log("Alternando iluminação");
    lightingEnabled = !lightingEnabled;
  }

  lighting = pressed;
}

// Redimensiona o canvas para preencher a tela
function resizeCanvas() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

// Desenha a cena
function drawScene(timeMs) {
  const time = timeMs * 0.001;

  camera.handleInput(keys, ufo);
  handleLightingToggle();
  handleMusicToggle();

  const isAuto = updateUfo(time);

  updateHUD(isAuto);

  resizeCanvas();

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0.53, 0.81, 0.98, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const aspect = canvas.width / canvas.height;
  const projection = m4.perspective(parseRad(60), aspect, 0.1, 200);

  const {
    viewProjection,
    position: camPos,
  } = camera.cameraMovement(ufo, projection);

  gl.useProgram(program);

  gl.uniform3fv(programInfo.uniforms.lightDirection, [-0.4, -1.0, -0.6]);
  gl.uniform3fv(programInfo.uniforms.cameraPosition, camPos);
  gl.uniform1i(programInfo.uniforms.useLighting, lightingEnabled ? 1 : 0);

  drawSkybox(gl, programInfo, skyboxModel, camPos, viewProjection, lightingEnabled);
  drawFarm(gl, programInfo, farmModel, viewProjection);

  let ufoMatrix = m4.identity();
  ufoMatrix = m4.multiply(ufoMatrix, m4.translation(ufo.x, ufo.y, ufo.z));
  ufoMatrix = m4.multiply(ufoMatrix, m4.yRotation(ufo.rotY));
  ufoMatrix = m4.multiply(ufoMatrix, m4.scaling(0.40, 0.40, 0.40));

  drawUFO(gl, programInfo, ufoModel, ufoMatrix, viewProjection, time);

  requestAnimationFrame(drawScene);
}

requestAnimationFrame(drawScene);