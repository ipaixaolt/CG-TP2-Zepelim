# CG-TP2 - Zepelim
Alunas: Isabelle e Isadellis

Vídeo: https://youtu.be/bJki8sO5vXI

[![Assita](https://img.youtube.com/vi/bJki8sO5vXI/maxresdefault.jpg)](https://youtu.be/bJki8sO5vXI)


Trabalho prático 2 de Computação Gráfica: CEFET. Cena 3D interativa com um OVNI sobrevoando uma fazendinha.
O objetivo é praticar os conceitos de projeção perspectiva, iluminação dinâmica, modelagem hierárquica, sombreamento, modelagem e efeitos visuais.

**Para o Coutinho:** 
- A nave foi feita no blender e ficou meio esquisitinha (design is my passion)
- Tivemos alguns probleminhas por conta do tamanho dos arquivos e acabamos fazendo versionamento como os antigos: .zip

## Estrutura de arquivos

- `src/main.js`: loop principal, entrada do usuário e tela de carregamento
- `src/ufo.js`: carregamento e desenho do OVNI
- `src/farm.js`: carregamento e desenho da fazenda, chão e árvores
- `src/camera.js`: sistema de câmeras (incluindo controle de zoom e mouse)
- `src/skybox.js`: céu
- `src/gl-utils.js`: utilitários de matrizes, vetores, parsing OBJ/MTL e WebGL (basicamente tudo que tem como reaproveitar)
- `src/shaders/vertex.glsl` e `src/shaders/fragment.glsl`: shaders (:o)
- `assets/models/ufo/`: partes do OVNI (body, cabin, sphere)
- `assets/models/farm/`: modelo da fazenda
- `assets/models/trees/`: modelos de árvores (tree_thin, tree_y)
- `assets/textures/`: texturas
- `assets/video/`: vídeo de transição da tela de carregamento

## O que foi feito

### Tela de carregamento
- Texto "Carregando..." animado com letras em CSS exibido enquanto os modelos da fazenda carregam
- Transição da tela de carregamento para a cena com um vídeo `earth_zoom.mp4`

### Sistema de câmeras
- **Câmera 1** (tecla `1`): terceira pessoa atrás do OVNI, controlada pelo mouse
- **Câmera 2** (tecla `2`): fixa atrás do OVNI, acompanha automaticamente a rotação da nave
- **Câmera 3** (tecla `3`): vista de cima, seguindo o OVNI
- **Mouse**: controla yaw e pitch da câmera 1 (pointer lock ao clicar no canvas)
- **Scroll**: zoom independente por câmera (distância mínima 4, máxima 40)
- **Esc**: libera o cursor (sai do pointer lock)
- Câmera reseta para posição padrão ao trocar de modo

### Iluminação Phong
- Componentes ambiente, difusa e especular
- Materiais carregados dos arquivos `.mtl` (Ka, Kd, Ks, Ns)
- Luz direcional fixa (`[-0.4, -1.0, -0.6]`)
- Toggle de iluminação pela tecla **L**

### HUD
- Posição atual do OVNI (X, Y, Z)
- Câmera ativa
- Estado da iluminação
- Legenda de controles


### Fazenda
- Modelo 3D carregado de `assets/models/farm/farm.obj`
- Plano de chão gerado proceduralmente com material verde (sem textura)
- Árvores dos tipos `tree_thin` e `tree_y` espalhadas ao redor da fazenda
- Posicionada com offset fixo no mundo

### OVNI
- **Modelagem hierárquica** com três partes independentes:
  - `ufo_body`: corpo do disco
  - `ufo_cabin`: cabine
  - `ufo_big_ring`: disco rotativo inferior maior
  - `ufo_small_ring`: disco rotativo inferior menor
- **Movimentação**
  - `W/S`: mover para frente/trás no eixo de visão
  - `A/D`: mover para os lados
  - `Q/E`: rotacionar a nave (yaw) e reorientar a câmera
  - Nos modos 1 e 2 da câmera é possível controlar a rotação da nave com o mouse.
- **Limites de área**: o OVNI não sai dos limites da fazenda

## Controles

| Tecla / Ação | Efeito |
|---|---|
| Clicar na tela | Travar cursor (ativar controle de câmera) |
| Mouse | Girar câmera / orientar nave |
| Scroll | Zoom (por câmera) |
| `W / S` | Mover frente / trás |
| `A / D` | Mover para os lados |
| `Q / E` | Rotacionar nave |
| `1 / 2 / 3` | Trocar câmera |
| `L` | Toggle iluminação |
| `Esc` | Mostrar cursor |
