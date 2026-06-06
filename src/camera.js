import { m4 } from "./gl-utils.js";

// Câmera 1 (terceira pessoa)
const CAM1_DIST = 12;
const CAM1_BASE_HEIGHT = 5;
const CAM1_DEFAULT_PITCH = 0.25;

// Câmera 2 (câmera de ré / vista frontal da nave)
const CAM2_DIST = 16;
const CAM2_BASE_HEIGHT = 3.5;
const CAM2_DEFAULT_PITCH = 0.18;

// Câmera 3 (vista de cima)
const CAM3_DIST = 8;
const CAM3_BASE_HEIGHT = 20;
const CAM3_DEFAULT_PITCH = 0.25;

// Mouse
const CAM_SENSITIVITY = 0.003;
const CAM_MIN_PITCH = -0.45;
const CAM_MAX_PITCH = 1.15;

// Zoom
const ZOOM_SPEED = 0.02;
const MIN_DIST = 4;
const MAX_DIST = 40;

// Movimento vertical extra da câmera
const CAM_HEIGHT_SPEED = 0.15;
const CAM_MIN_OFFSET = -8;
const CAM_MAX_OFFSET = 14;

export const camera = {
  mode: 1, // 1 = terceira pessoa | 2 = câmera de ré | 3 = vista de cima

  yaw: 0,
  pitch: CAM1_DEFAULT_PITCH,

  dist1: CAM1_DIST,
  dist2: CAM2_DIST,
  dist3: CAM3_DIST,

  heightOffset: 0,

  _cam1Pressed: false,
  _cam2Pressed: false,
  _cam3Pressed: false,

  _canvas: null,

  init(canvas) {
    this._canvas = canvas;

    canvas.style.cursor = "none";
    document.body.style.cursor = "none";

    canvas.addEventListener("click", () => {
      canvas.requestPointerLock();
    });

    // Mostrar ou esconder o cursor dependendo se ele está travado ou não 
    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === canvas) {
        canvas.style.cursor = "none";
        document.body.style.cursor = "none";
      } else {
        canvas.style.cursor = "default";
        document.body.style.cursor = "default";
      }
    });

    canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    // Mexe a câmera com base no movimento do mouse (mas só com o cursor travado)
    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement !== canvas) return;

      const dx = e.movementX;
      const dy = e.movementY;

      this.yaw -= dx * CAM_SENSITIVITY;
      this.pitch -= dy * CAM_SENSITIVITY;

      this.pitch = Math.max(
        CAM_MIN_PITCH,
        Math.min(CAM_MAX_PITCH, this.pitch)
      );
    });

    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY * ZOOM_SPEED;

        if (this.mode === 1) {
          this.dist1 = Math.max(
            MIN_DIST,
            Math.min(MAX_DIST, this.dist1 + delta)
          );
        } else if (this.mode === 2) {
          this.dist2 = Math.max(
            MIN_DIST,
            Math.min(MAX_DIST, this.dist2 + delta)
          );
        } else {
          this.dist3 = Math.max(
            MIN_DIST,
            Math.min(MAX_DIST, this.dist3 + delta)
          );
        }
      },
      { passive: false }
    );
  },

  // Reseta a câmera para a posição padrão do modo selecionado
  resetCamera(mode, ufo) {
    this.mode = mode;
    this.yaw = ufo.rotY;
    this.heightOffset = 0;

    if (mode === 1) {
      this.pitch = CAM1_DEFAULT_PITCH;
      this.dist1 = CAM1_DIST;
    } else if (mode === 2) {
      this.pitch = CAM2_DEFAULT_PITCH;
      this.dist2 = CAM2_DIST;
    } else {
      this.pitch = CAM3_DEFAULT_PITCH;
      this.dist3 = CAM3_DIST;
    }
  },

  // Muda o modo da câmera com base na tecla pressionada
  handleInput(keys, ufo) {
    if (keys["1"] && !this._cam1Pressed) {
      this.resetCamera(1, ufo);
    }
    this._cam1Pressed = !!keys["1"];

    if (keys["2"] && !this._cam2Pressed) {
      this.resetCamera(2, ufo);
    }
    this._cam2Pressed = !!keys["2"];

    if (keys["3"] && !this._cam3Pressed) {
      this.resetCamera(3, ufo);
    }
    this._cam3Pressed = !!keys["3"];

    if (keys["arrowup"]) {
      this.heightOffset += CAM_HEIGHT_SPEED;
    }

    if (keys["arrowdown"]) {
      this.heightOffset -= CAM_HEIGHT_SPEED;
    }

    this.heightOffset = Math.max(
      CAM_MIN_OFFSET,
      Math.min(CAM_MAX_OFFSET, this.heightOffset)
    );
  },

  cameraMovement(ufo, projection) {
    const up = [0, 1, 0];

    const target = [
      ufo.x,
      ufo.y + 1.5,
      ufo.z,
    ];

    const sinY = Math.sin(this.yaw);
    const cosY = Math.cos(this.yaw);

    let camPos;

    if (this.mode === 3) {
      // Câmera 3: vista de cima
      camPos = [
        ufo.x - this.dist3 * sinY,
        ufo.y + CAM3_BASE_HEIGHT + this.heightOffset,
        ufo.z - this.dist3 * cosY,
      ];
    } else if (this.mode === 2) {
      // Câmera 2: câmera de ré
      const ufoSinY = Math.sin(ufo.rotY);
      const ufoCosY = Math.cos(ufo.rotY);
      const cosP = Math.cos(CAM2_DEFAULT_PITCH);
      const sinP = Math.sin(CAM2_DEFAULT_PITCH);

      camPos = [
        ufo.x + this.dist2 * cosP * ufoSinY,
        ufo.y + CAM2_BASE_HEIGHT + this.heightOffset + this.dist2 * sinP,
        ufo.z + this.dist2 * cosP * ufoCosY,
      ];
    } else {
      // Câmera 1: controlada pelo mouse
      const cosP = Math.cos(this.pitch);
      const sinP = Math.sin(this.pitch);

      camPos = [
        ufo.x - this.dist1 * cosP * sinY,
        ufo.y + CAM1_BASE_HEIGHT + this.heightOffset + this.dist1 * sinP,
        ufo.z - this.dist1 * cosP * cosY,
      ];
    }

    const maxCameraY = ufo.y + 28;
    if (camPos[1] > maxCameraY) {
      camPos[1] = maxCameraY;
    }

    const minCameraY = ufo.y - 6;
    if (camPos[1] < minCameraY) {
      camPos[1] = minCameraY;
    }

    const view = m4.inverse(m4.lookAt(camPos, target, up));

    return {
      viewProjection: m4.multiply(projection, view),
      position: camPos,
    };
  },

  // Ajustar o label certo na HUD
  cameraName() {
    if (this.mode === 1) return "1 - Terceira pessoa";
    if (this.mode === 2) return "2 - Câmera de ré";
    return "3 - Vista de cima";
  },
};