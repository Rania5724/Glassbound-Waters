precision mediump float;

uniform vec4 u_glassColor;
uniform float u_ior;        // Index of refraction, e.g., 1.5

varying vec3 v2f_frag_pos;
varying vec3 v2f_normal;



void main() {
    vec3 v = normalize(-v2f_frag_pos); // Camera direction
    vec3 n = normalize(v2f_normal); // Normal vector

    float final_alpha = u_glassColor.a;

    if (final_alpha < 0.01) {
        discard; 
    }

    // Output the color with the calculated transparency
    gl_FragColor = vec4(u_glassColor.rgb, final_alpha); // Set the color with the final alpha

}
