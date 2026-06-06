import { m4, loadOBJMeshes, drawMeshes, bindFloatBuffer } from "./gl-utils.js";

const OBJ_PATHS = {
  farm: {
    obj: "assets/models/farm/farm.obj",
    mtl: "assets/models/farm/farm.mtl",
  },
  treeThin: {
    obj: "assets/models/trees/tree_thin.obj",
    mtl: "assets/models/trees/tree_thin.mtl",
  },
  treeY: {
    obj: "assets/models/trees/tree_y.obj",
    mtl: "assets/models/trees/tree_y.mtl",
  },
};

// Posição da fazenda no mundo
const FARM_OFFSET = [0.38, 0.0, -17.60];

// Limites de movimento da fazenda (nave vai usar isso como limite)
export const FARM_BOUNDS = { minX: -46, maxX: 45, minZ: -25, maxZ: 34 };

// Chão e árvores vão além dos limites da fazenda
const GROUND_BOUNDS = { minX: -120, maxX: 120, minZ: -110, maxZ: 110 };

// Arredondamento dos cantos do chão (100% estético)
const GROUND_RADIUS = 26;
const GROUND_CORNER_SEGMENTS = 18;

// Textura do chão
const GROUND_TEXTURE_PATH = "assets/textures/grass.jpg";

// Como a textura é 701x306
const GROUND_TEXTURE_REPEAT_X = 14;
const GROUND_TEXTURE_REPEAT_Z = 30;

// Árvores não aparecem dentro da fazenda, porque já temos a da própria fazenda
const FARM_CLEAR_ZONE = { minX: -46, maxX: 45, minZ: -25, maxZ: 34 };

const GROUND_COLOR = [1.0, 1.0, 1.0, 1.0];

// A escala é com base na altura dos modelos
const TREE_THIN_SCALE = 0.045;
const TREE_Y_SCALE = 1.2;
const TREE_COUNT_THIN = 30;
const TREE_COUNT_Y = 25;

// Carrega uma textura com repetição
function loadRepeatingTexture(gl, url) {
  const texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Pixel temporário enquanto a imagem carrega
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([70, 170, 60, 255])
  );

  const image = new Image();

  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.generateMipmap(gl.TEXTURE_2D);
  };

  image.onerror = () => {
    console.warn(`Não foi possível carregar a textura do chão: ${url}`);
  };

  image.src = url;

  return texture;
}

// Verifica se um ponto está dentro do retângulo com cantos arredondados
function isInsideRoundedGround(x, z) {
  const { minX, maxX, minZ, maxZ } = GROUND_BOUNDS;

  const radius = Math.min(
    GROUND_RADIUS,
    (maxX - minX) / 2,
    (maxZ - minZ) / 2
  );

  if (x >= minX + radius && x <= maxX - radius && z >= minZ && z <= maxZ) {
    return true;
  }
  if (x >= minX && x <= maxX && z >= minZ + radius && z <= maxZ - radius) {
    return true;
  }

  const cornerX = x < minX + radius ? minX + radius : maxX - radius;
  const cornerZ = z < minZ + radius ? minZ + radius : maxZ - radius;

  const dx = x - cornerX;
  const dz = z - cornerZ;

  return dx * dx + dz * dz <= radius * radius;
}

// Gera posições aleatórias dentro do chão mas fora da zona central da fazenda
function generateTreePositions(count, seed) {
  const { minX, maxX, minZ, maxZ } = GROUND_BOUNDS;
  const clear = FARM_CLEAR_ZONE;
  const positions = [];

  // Aleatório mas não é realmente aleatório (semente fixa)
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };

  while (positions.length < count) {
    const x = minX + rand() * (maxX - minX);
    const z = minZ + rand() * (maxZ - minZ);

    const inClear =
      x > clear.minX &&
      x < clear.maxX &&
      z > clear.minZ &&
      z < clear.maxZ;

    if (!inClear && isInsideRoundedGround(x, z)) {
      positions.push({ x, z });
    }
  }

  return positions;
}

// Cria um plano para o chão da fazenda com bordas arredondadas e textura
function createGroundMesh(gl, attribs) {
  const { minX, maxX, minZ, maxZ } = GROUND_BOUNDS;
  const y = 0.01;

  const radius = Math.min(
    GROUND_RADIUS,
    (maxX - minX) / 2,
    (maxZ - minZ) / 2
  );

  const vertices2D = [];

  function addCorner(cx, cz, startAngle, endAngle) {
    for (let i = 0; i <= GROUND_CORNER_SEGMENTS; i++) {
      const t = i / GROUND_CORNER_SEGMENTS;
      const angle = startAngle + (endAngle - startAngle) * t;

      const x = cx + Math.cos(angle) * radius;
      const z = cz + Math.sin(angle) * radius;

      vertices2D.push([x, z]);
    }
  }

  // Canto superior direito
  addCorner(maxX - radius, maxZ - radius, 0, Math.PI / 2);

  // Canto superior esquerdo
  addCorner(minX + radius, maxZ - radius, Math.PI / 2, Math.PI);

  // Canto inferior esquerdo
  addCorner(minX + radius, minZ + radius, Math.PI, Math.PI * 1.5);

  // Canto inferior direito
  addCorner(maxX - radius, minZ + radius, Math.PI * 1.5, Math.PI * 2);

  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;

  const positions = [];
  const normals = [];
  const texCoords = [];

  function getTexCoord(x, z) {
    return [
      ((x - minX) / (maxX - minX)) * GROUND_TEXTURE_REPEAT_X,
      ((z - minZ) / (maxZ - minZ)) * GROUND_TEXTURE_REPEAT_Z,
    ];
  }

  // Triangula usando um fan: centro + dois pontos da borda
  for (let i = 0; i < vertices2D.length; i++) {
    const current = vertices2D[i];
    const next = vertices2D[(i + 1) % vertices2D.length];

    positions.push(
      centerX, y, centerZ,
      current[0], y, current[1],
      next[0], y, next[1]
    );

    normals.push(
      0, 1, 0,
      0, 1, 0,
      0, 1, 0
    );

    const centerUV = getTexCoord(centerX, centerZ);
    const currentUV = getTexCoord(current[0], current[1]);
    const nextUV = getTexCoord(next[0], next[1]);

    texCoords.push(
      centerUV[0], centerUV[1],
      currentUV[0], currentUV[1],
      nextUV[0], nextUV[1]
    );
  }

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  bindFloatBuffer(gl, attribs.position, positions, 3);
  bindFloatBuffer(gl, attribs.normal, normals, 3);
  bindFloatBuffer(gl, attribs.texcoord, texCoords, 2);

  gl.bindVertexArray(null);

  return [{
    vao,
    count: positions.length / 3,
    material: {
      ambient: [0.25, 0.25, 0.25],
      diffuse: GROUND_COLOR,
      specular: [0.03, 0.03, 0.03],
      shininess: 4,
      texture: loadRepeatingTexture(gl, GROUND_TEXTURE_PATH),
      hasTexture: true,
    },
  }];
}

export async function loadFarm(gl, attribs) {
  const [meshes, treeThinMeshes, treeYMeshes] = await Promise.all([
    loadOBJMeshes(gl, OBJ_PATHS.farm.obj, OBJ_PATHS.farm.mtl, attribs),
    loadOBJMeshes(gl, OBJ_PATHS.treeThin.obj, OBJ_PATHS.treeThin.mtl, attribs),
    loadOBJMeshes(gl, OBJ_PATHS.treeY.obj, OBJ_PATHS.treeY.mtl, attribs),
  ]);

  const ground = createGroundMesh(gl, attribs);

  const treeThinPositions = generateTreePositions(TREE_COUNT_THIN, 42);
  const treeYPositions = generateTreePositions(TREE_COUNT_Y, 137);

  return { meshes, ground, treeThinMeshes, treeYMeshes, treeThinPositions, treeYPositions };
}

export function drawFarm(gl, programInfo, farm, viewProjection) {
  const identity = m4.identity();

  // Primeiro desenha o chão, depois o modelo da fazenda
  drawMeshes(gl, programInfo, farm.ground, identity, viewProjection);

  const farmMatrix = m4.multiply(
    m4.identity(),
    m4.translation(FARM_OFFSET[0], FARM_OFFSET[1], FARM_OFFSET[2])
  );

  drawMeshes(gl, programInfo, farm.meshes, farmMatrix, viewProjection);

  // Árvores tree_thin (magrinhas e retorcidas)
  for (const pos of farm.treeThinPositions) {
    const mat = m4.multiply(
      m4.translation(pos.x, 0, pos.z),
      m4.scaling(TREE_THIN_SCALE, TREE_THIN_SCALE, TREE_THIN_SCALE)
    );

    drawMeshes(gl, programInfo, farm.treeThinMeshes, mat, viewProjection);
  }

  // Árvores tree_y (se dividem em y)
  for (const pos of farm.treeYPositions) {
    const mat = m4.multiply(
      m4.translation(pos.x, 0, pos.z),
      m4.scaling(TREE_Y_SCALE, TREE_Y_SCALE, TREE_Y_SCALE)
    );

    drawMeshes(gl, programInfo, farm.treeYMeshes, mat, viewProjection);
  }
}