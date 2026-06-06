import { m4, loadOBJMeshes, drawMeshes } from "./gl-utils.js";

const SKYBOX_PATHS = {
    obj: "assets/models/skybox/skybox.obj",
    mtl: "assets/models/skybox/skybox.mtl",
};

const SKYBOX_SCALE = 2;
const SKYBOX_Y_OFFSET = -12;

// Carrega a skybox
export async function loadSkybox(gl, attribs) {
    return loadOBJMeshes(gl, SKYBOX_PATHS.obj, SKYBOX_PATHS.mtl, attribs);
}

// Desenha a skybox
export function drawSkybox(gl, programInfo, skybox, camPos, viewProjection, lightingEnabled) {
    gl.useProgram(programInfo.program);

    // A skybox não recebe iluminação da cena
    gl.uniform1i(programInfo.uniforms.useLighting, 0);

    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);

    let skyboxMatrix = m4.identity();

    skyboxMatrix = m4.multiply(
        skyboxMatrix,
        m4.translation(
            camPos[0],
            camPos[1] + SKYBOX_Y_OFFSET,
            camPos[2]
        )
    );

    skyboxMatrix = m4.multiply(
        skyboxMatrix,
        m4.scaling(SKYBOX_SCALE, SKYBOX_SCALE, SKYBOX_SCALE)
    );

    drawMeshes(gl, programInfo, skybox, skyboxMatrix, viewProjection);

    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST);

    gl.uniform1i(programInfo.uniforms.useLighting, lightingEnabled ? 1 : 0);
}