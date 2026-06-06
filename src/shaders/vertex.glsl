#version 300 es

in vec3 a_position;
in vec3 a_normal;
in vec2 a_texcoord;

uniform mat4 u_world;               
uniform mat4 u_worldViewProjection;  
uniform mat4 u_worldInverseTranspose;

out vec3 v_normal;
out vec3 v_worldPosition; // Posição do vértice no espaço mundo (para Phong)
out vec2 v_texcoord;   

void main() {
  gl_Position = u_worldViewProjection * vec4(a_position, 1.0);

  v_normal = mat3(u_worldInverseTranspose) * a_normal;
  v_worldPosition = (u_world * vec4(a_position, 1.0)).xyz;
  v_texcoord = a_texcoord;
}
