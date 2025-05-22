precision mediump float;

attribute vec3 vertex_positions;  
attribute vec3 vertex_normal;   
attribute vec2 vertex_tex_coords;


uniform mat4 mat_model_view;
uniform mat4 mat_model_view_projection;
uniform mat3 mat_normals_model_view;

varying vec3 v_position; 
varying vec3 v_normal; 
varying vec2 v_texCoord;  

void main() {
    vec4 view_pos = mat_model_view * vec4(vertex_positions,1.0);
    v_position = view_pos.xyz;

    v_normal = normalize(mat_normals_model_view * vertex_normal);
    v_texCoord = vertex_tex_coords;

    gl_Position = mat_model_view_projection * vec4(vertex_positions, 1.0);
}
