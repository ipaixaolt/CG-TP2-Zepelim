#version 300 es
precision highp float;

in vec3 v_normal;
in vec3 v_worldPosition;
in vec2 v_texcoord;

// iluminação
uniform vec3 u_lightDirection;
uniform vec3 u_cameraPosition;
uniform bool u_useLighting;    // true = Phong ativo; false = cor flat (tecla L)

// Materiais
uniform vec3  u_ka;        // Coeficiente ambiente  (Ka)
uniform vec4  u_kd;        // Coeficiente difuso + alpha (Kd + d)
uniform vec3  u_ks;        // Coeficiente especular (Ks)
uniform float u_shininess; // Expoente especular    (Ns)

// Textura
uniform sampler2D u_texture;  
uniform bool      u_useTexture;

out vec4 outColor;

void main() {
  // Cor base: textura (se disponível) modulada pelo Kd, ou só Kd
  vec4 baseColor = u_useTexture
    ? texture(u_texture, v_texcoord) * u_kd
    : u_kd;

  // Sem iluminação (só a cor base)
  if (!u_useLighting) {
    outColor = baseColor;
    return;
  }

  // Modelo de Phong
  vec3 normal   = normalize(v_normal);
  vec3 lightDir = normalize(-u_lightDirection); // aponta DA superfície EM DIREÇÃO à luz
  vec3 viewDir  = normalize(u_cameraPosition - v_worldPosition);

  const float AMBIENT_STRENGTH = 0.28;

  vec3 ambient = AMBIENT_STRENGTH * baseColor.rgb;

  float diffAmt = max(dot(normal, lightDir), 0.0);
  diffAmt = 0.45 + diffAmt * 0.55;

  vec3 diffuse = diffAmt * baseColor.rgb;

  vec3  reflDir  = reflect(-lightDir, normal);
  float specAmt  = pow(max(dot(viewDir, reflDir), 0.0), u_shininess);
  vec3  specular = min(specAmt * u_ks, vec3(0.4)); // teto de 0.4 por componente

  outColor = vec4(ambient + diffuse + specular, baseColor.a);
}
