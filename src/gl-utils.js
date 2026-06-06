export const v3 = {
  subtract(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; },

  normalize(v) {
    const len = Math.hypot(v[0], v[1], v[2]);
    return len > 1e-6 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 0];
  },

  cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
  },

  dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; },
  add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; },
  scale(v, s) { return [v[0] * s, v[1] * s, v[2] * s]; },
};

export const m4 = {
  identity() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },

  translation(tx, ty, tz) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1,
    ];
  },

  xRotation(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
  },

  yRotation(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  },

  zRotation(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  },

  scaling(sx, sy, sz) {
    return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1];
  },

  perspective(fovRad, aspect, near, far) {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fovRad);
    const r = 1.0 / (near - far);
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * r, -1,
      0, 0, near * far * r * 2, 0,
    ];
  },

  multiply(a, b) {
    const dst = new Array(16);
    const b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3];
    const b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7];
    const b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
    const b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    dst[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30; dst[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
    dst[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32; dst[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
    dst[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30; dst[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
    dst[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32; dst[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
    dst[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30; dst[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
    dst[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32; dst[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
    dst[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30; dst[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
    dst[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32; dst[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
    return dst;
  },

  lookAt(cameraPosition, target, up) {
    const zAxis = v3.normalize(v3.subtract(cameraPosition, target));
    const xAxis = v3.normalize(v3.cross(up, zAxis));
    const yAxis = v3.normalize(v3.cross(zAxis, xAxis));
    return [
      xAxis[0], xAxis[1], xAxis[2], 0,
      yAxis[0], yAxis[1], yAxis[2], 0,
      zAxis[0], zAxis[1], zAxis[2], 0,
      cameraPosition[0], cameraPosition[1], cameraPosition[2], 1,
    ];
  },

  inverse(m) {
    const m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3], m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
    const m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11], m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];
    const t0 = m22 * m33, t1 = m32 * m23, t2 = m12 * m33, t3 = m32 * m13, t4 = m12 * m23, t5 = m22 * m13;
    const t6 = m02 * m33, t7 = m32 * m03, t8 = m02 * m23, t9 = m22 * m03, t10 = m02 * m13, t11 = m12 * m03;
    const t12 = m20 * m31, t13 = m30 * m21, t14 = m10 * m31, t15 = m30 * m11, t16 = m10 * m21, t17 = m20 * m11;
    const t18 = m00 * m31, t19 = m30 * m01, t20 = m00 * m21, t21 = m20 * m01, t22 = m00 * m11, t23 = m10 * m01;
    const c0 = (t0 * m11 + t3 * m21 + t4 * m31) - (t1 * m11 + t2 * m21 + t5 * m31);
    const c1 = (t1 * m01 + t6 * m21 + t9 * m31) - (t0 * m01 + t7 * m21 + t8 * m31);
    const c2 = (t2 * m01 + t7 * m11 + t10 * m31) - (t3 * m01 + t6 * m11 + t11 * m31);
    const c3 = (t5 * m01 + t8 * m11 + t11 * m21) - (t4 * m01 + t9 * m11 + t10 * m21);
    const d = 1.0 / (m00 * c0 + m10 * c1 + m20 * c2 + m30 * c3);
    return [
      d * c0, d * c1, d * c2, d * c3,
      d * ((t1 * m10 + t2 * m20 + t5 * m30) - (t0 * m10 + t3 * m20 + t4 * m30)),
      d * ((t0 * m00 + t7 * m20 + t8 * m30) - (t1 * m00 + t6 * m20 + t9 * m30)),
      d * ((t3 * m00 + t6 * m10 + t11 * m30) - (t2 * m00 + t7 * m10 + t10 * m30)),
      d * ((t4 * m00 + t9 * m10 + t10 * m20) - (t5 * m00 + t8 * m10 + t11 * m20)),
      d * ((t12 * m13 + t15 * m23 + t16 * m33) - (t13 * m13 + t14 * m23 + t17 * m33)),
      d * ((t13 * m03 + t18 * m23 + t21 * m33) - (t12 * m03 + t19 * m23 + t20 * m33)),
      d * ((t14 * m03 + t19 * m13 + t22 * m33) - (t15 * m03 + t18 * m13 + t23 * m33)),
      d * ((t17 * m03 + t20 * m13 + t23 * m23) - (t16 * m03 + t21 * m13 + t22 * m23)),
      d * ((t14 * m22 + t17 * m32 + t13 * m12) - (t16 * m32 + t12 * m12 + t15 * m22)),
      d * ((t20 * m32 + t12 * m02 + t19 * m22) - (t18 * m22 + t21 * m32 + t13 * m02)),
      d * ((t18 * m12 + t23 * m32 + t15 * m02) - (t22 * m32 + t14 * m02 + t19 * m12)),
      d * ((t22 * m22 + t16 * m02 + t21 * m12) - (t20 * m12 + t23 * m22 + t17 * m02)),
    ];
  },

  transpose(m) {
    return [
      m[0], m[4], m[8], m[12],
      m[1], m[5], m[9], m[13],
      m[2], m[6], m[10], m[14],
      m[3], m[7], m[11], m[15],
    ];
  },
};

export function parseRad(degrees) {
  return degrees * (Math.PI / 180);
}

export function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Erro ao compilar shader:\n${log}`);
  }
  return shader;
}

export function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Erro ao linkar programa:\n${log}`);
  }
  return program;
}

export async function loadShaderSource(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Não foi possível carregar o shader: ${url}`);
  return response.text();
}

export function createDefaultTexture(gl) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([255, 255, 255, 255]));
  return texture;
}

export function loadTexture(gl, url) {
  const texture = createDefaultTexture(gl);
  const urls = Array.isArray(url) ? url : [url];

  const image = new Image();
  let currentUrl = 0;

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

    // Evita repetição e vazamento de cores da textura atlas
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  };

  image.onerror = () => {
    currentUrl++;

    if (currentUrl < urls.length) {
      image.src = urls[currentUrl];
      return;
    }

    console.warn(`Não foi possível carregar a textura: ${urls.join(" | ")}`);
  };

  image.src = urls[currentUrl];
  return texture;
}

function isPow2(v) { return (v & (v - 1)) === 0; }

export function defaultMaterial(gl) {
  return {
    ambient: [0.2, 0.2, 0.2],
    diffuse: [0.8, 0.8, 0.8, 1.0],
    specular: [0.5, 0.5, 0.5],
    shininess: 32,
    texture: createDefaultTexture(gl),
    hasTexture: false,
  };
}

export function bindFloatBuffer(gl, attribLocation, data, size) {
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  if (attribLocation >= 0) {
    gl.enableVertexAttribArray(attribLocation);
    gl.vertexAttribPointer(attribLocation, size, gl.FLOAT, false, 0, 0);
  }
}

export async function loadOBJMeshes(gl, objUrl, mtlUrl, attribs) {
  const [groups, matLib] = await Promise.all([
    loadOBJ(objUrl),
    mtlUrl ? loadMTL(gl, mtlUrl) : Promise.resolve({}),
  ]);

  const meshes = [];
  for (const [matName, geo] of Object.entries(groups)) {
    if (geo.positions.length === 0) continue;
    const material = matLib[matName] ?? matLib["default"] ?? defaultMaterial(gl);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    bindFloatBuffer(gl, attribs.position, geo.positions, 3);
    bindFloatBuffer(gl, attribs.normal, geo.normals, 3);
    bindFloatBuffer(gl, attribs.texcoord, geo.texCoords, 2);
    gl.bindVertexArray(null);
    meshes.push({ vao, count: geo.positions.length / 3, material });
  }
  return meshes;
}

// Desenha uma mesh com base nos dados de material e textura
export function drawMeshes(gl, programInfo, meshes, worldMatrix, viewProjectionMatrix, colorOverride = null) {
  const uniforms = programInfo.uniforms;
  const worldViewProjection = m4.multiply(viewProjectionMatrix, worldMatrix);
  const worldInverseTranspose = m4.transpose(m4.inverse(worldMatrix));

  gl.uniformMatrix4fv(uniforms.world, false, worldMatrix);
  gl.uniformMatrix4fv(uniforms.worldViewProjection, false, worldViewProjection);
  gl.uniformMatrix4fv(uniforms.worldInverseTranspose, false, worldInverseTranspose);

  for (const mesh of meshes) {
    gl.uniform3fv(uniforms.ka, mesh.material.ambient);
    gl.uniform4fv(uniforms.kd, colorOverride ?? mesh.material.diffuse);
    gl.uniform3fv(uniforms.ks, mesh.material.specular);
    gl.uniform1f(uniforms.shininess, mesh.material.shininess);

    gl.activeTexture(gl.TEXTURE0);
    if (mesh.material.texture) gl.bindTexture(gl.TEXTURE_2D, mesh.material.texture);
    gl.uniform1i(uniforms.texture, 0);
    gl.uniform1i(uniforms.useTexture, mesh.material.hasTexture ? 1 : 0);

    gl.bindVertexArray(mesh.vao);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
    gl.bindVertexArray(null);
  }
}

async function loadOBJ(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Não foi possível carregar o OBJ: ${url}`);
  const text = await response.text();

  const objPositions = [[0, 0, 0]];
  const objtexCoords = [[0, 0]];
  const objNormals = [[0, 0, 1]];

  const groups = {};
  let currentGroup = "default";
  groups[currentGroup] = newGeoGroup();

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(/\s+/);
    const keyword = parts[0];

    switch (keyword) {
      case "v": objPositions.push(parts.slice(1, 4).map(Number)); break;
      case "vt": objtexCoords.push(parts.slice(1, 3).map(Number)); break;
      case "vn": objNormals.push(parts.slice(1, 4).map(Number)); break;
      case "usemtl":
        currentGroup = parts[1] ?? "default";
        if (!groups[currentGroup]) groups[currentGroup] = newGeoGroup();
        break;
      case "f": {
        const fv = parts.slice(1);
        for (let i = 1; i < fv.length - 1; i++) {
          addVertex(fv[0], groups[currentGroup], objPositions, objtexCoords, objNormals);
          addVertex(fv[i], groups[currentGroup], objPositions, objtexCoords, objNormals);
          addVertex(fv[i + 1], groups[currentGroup], objPositions, objtexCoords, objNormals);
        }
        break;
      }
    }
  }
  return groups;
}

function newGeoGroup() { return { positions: [], texCoords: [], normals: [] }; }

// Mapeia indíces dos .obj para os arrays de posição, textura e normal
function addVertex(vertText, group, positions, texCoords, normals) {
  const idx = vertText.split("/");
  const posIdx = parseOBJIndex(idx[0], positions.length);
  const texIdx = parseOBJIndex(idx[1], texCoords.length);
  const norIdx = parseOBJIndex(idx[2], normals.length);

  const pos = positions[posIdx];
  const tex = texCoords[texIdx] ?? [0, 0];
  const nor = normals[norIdx] ?? [0, 0, 1];

  group.positions.push(pos[0], pos[1], pos[2]);
  group.texCoords.push(tex[0], tex[1]);
  group.normals.push(nor[0], nor[1], nor[2]);
}

// Converte índices do OBJ
function parseOBJIndex(value, arrayLength) {
  if (!value || value === "") return 0;
  const i = parseInt(value, 10);
  return i >= 0 ? i : arrayLength + i;
}

// Carregar e mapear materiais dos arquivos .mtl
async function loadMTL(gl, url) {
  const matLib = {};
  const response = await fetch(url);
  if (!response.ok) {
    console.warn(`MTL não encontrado: ${url}`);
    matLib["default"] = defaultMaterial(gl);
    return matLib;
  }

  const text = await response.text();
  const baseDir = url.substring(0, url.lastIndexOf("/") + 1);
  let current = null;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(/\s+/);
    const keyword = parts[0];

    switch (keyword) {
      case "newmtl":
        current = parts[1];
        matLib[current] = {
          ambient: [0.2, 0.2, 0.2], diffuse: [0.8, 0.8, 0.8, 1.0],
          specular: [0.5, 0.5, 0.5], shininess: 32,
          texture: createDefaultTexture(gl), hasTexture: false,
        };
        break;
      case "Ka": if (current) matLib[current].ambient = parts.slice(1, 4).map(Number); break;
      case "Kd": if (current) {
        const kd = parts.slice(1, 4).map(Number);
        matLib[current].diffuse = [kd[0], kd[1], kd[2], matLib[current].diffuse[3]];
        break;
      }
      case "Ks": if (current) matLib[current].specular = parts.slice(1, 4).map(Number); break;
      case "Ns": if (current) matLib[current].shininess = Math.max(1, Number(parts[1])); break;
      case "d": if (current) matLib[current].diffuse[3] = Number(parts[1]); break;
      case "map_Kd": if (current) {
        const texPath = parts.slice(1).join(" ");
        const fileName = texPath.split("/").pop().split("\\").pop();

        const texUrl = texPath.startsWith("http")
          ? texPath
          : `assets/textures/${fileName}`;

        matLib[current].texture = loadTexture(gl, texUrl);
        matLib[current].hasTexture = true;
        break;
      }
    }
  }
  return matLib;
}
