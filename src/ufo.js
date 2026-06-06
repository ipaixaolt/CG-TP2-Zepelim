import { m4, loadOBJMeshes, drawMeshes } from "./gl-utils.js";

const UFO_PATHS = {
  body: {
    obj: "assets/models/ufo/ufo_body.obj",
    mtl: null,
  },
  cabin: {
    obj: "assets/models/ufo/ufo_cabin.obj",
    mtl: null,
  },
  bigRing: {
    obj: "assets/models/ufo/ufo_big_ring.obj",
    mtl: null,
  },
  smallRing: {
    obj: "assets/models/ufo/ufo_small_ring.obj",
    mtl: null,
  },
};

const COLORS = {
  cabin: [0.12, 0.30, 0.24, 1.0],
  body: [0.42, 0.72, 0.34, 1.0],
  bigRing: [0.96, 0.76, 0.28, 1.0],
  smallRing: [0.86, 0.62, 0.18, 1.0],
};

const UFO_SCALE = 5.5;

const ROTATION_SPEEDS = {
  bigRing: 1.2,
  smallRing: -2.0,
};

function tuneMaterial(meshes, ambient, specular, shininess) {
  for (const mesh of meshes) {
    mesh.material.ambient = ambient;
    mesh.material.specular = specular;
    mesh.material.shininess = shininess;
  }
}

export async function loadUFO(gl, attribs) {
  const [body, cabin, bigRing, smallRing] = await Promise.all([
    loadOBJMeshes(gl, UFO_PATHS.body.obj, UFO_PATHS.body.mtl, attribs),
    loadOBJMeshes(gl, UFO_PATHS.cabin.obj, UFO_PATHS.cabin.mtl, attribs),
    loadOBJMeshes(gl, UFO_PATHS.bigRing.obj, UFO_PATHS.bigRing.mtl, attribs),
    loadOBJMeshes(gl, UFO_PATHS.smallRing.obj, UFO_PATHS.smallRing.mtl, attribs),
  ]);

  // corpo
  // corpo: verde alienígena
  tuneMaterial(
    body,
    [0.20, 0.34, 0.16],
    [0.18, 0.28, 0.14],
    18
  );

  // cabine
  tuneMaterial(
    cabin,
    [0.14, 0.28, 0.22],
    [0.28, 0.40, 0.32],
    35
  );

  // anel grande
  tuneMaterial(
    bigRing,
    [0.36, 0.33, 0.26],
    [0.30, 0.30, 0.28],
    24
  );

  // anel pequeno
  tuneMaterial(
    smallRing,
    [0.30, 0.42, 0.34],
    [0.36, 0.40, 0.38],
    30
  );

  return { body, cabin, bigRing, smallRing };
}

export function drawUFO(gl, programInfo, ufo, ufoMatrix, viewProjection, time) {
  const baseMatrix = m4.multiply(
    ufoMatrix,
    m4.scaling(UFO_SCALE, UFO_SCALE, UFO_SCALE)
  );

  const bigRingMatrix = m4.multiply(
    baseMatrix,
    m4.yRotation(ROTATION_SPEEDS.bigRing * time)
  );

  const smallRingMatrix = m4.multiply(
    baseMatrix,
    m4.yRotation(ROTATION_SPEEDS.smallRing * time)
  );

  drawMeshes(gl, programInfo, ufo.body, baseMatrix, viewProjection, COLORS.body);
  drawMeshes(gl, programInfo, ufo.cabin, baseMatrix, viewProjection, COLORS.cabin);
  drawMeshes(gl, programInfo, ufo.bigRing, bigRingMatrix, viewProjection, COLORS.bigRing);
  drawMeshes(gl, programInfo, ufo.smallRing, smallRingMatrix, viewProjection, COLORS.smallRing);
}