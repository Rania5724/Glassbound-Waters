precision mediump float;

uniform vec4 u_glassColor;
uniform float u_ior;       

varying vec3 v2f_frag_pos;
varying vec3 v2f_normal;



void main() {
    vec3 v = normalize(-v2f_frag_pos); 
    vec3 n = normalize(v2f_normal); 

    float final_alpha = u_glassColor.a;

    if (final_alpha < 0.01) {
        discard; 
    }

    gl_FragColor = vec4(u_glassColor.rgb, final_alpha); 

}
