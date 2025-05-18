precision mediump float;

attribute vec3 vertex_positions;
attribute vec2 vertex_tex_coords;

varying vec2 v_texCoord;

uniform mat4 mat_model_view_projection;

void main() {
    gl_Position = mat_model_view_projection * vec4(vertex_positions, 1.0);
    v_texCoord = vertex_tex_coords;
}
