precision mediump float;

uniform vec4 u_glassColor;

varying vec3 v2f_frag_pos;
varying vec3 v2f_normal;

void main() {
    vec3 v = normalize(-v2f_frag_pos); // Camera direction
    vec3 n = normalize(v2f_normal); // Normal vector

    // Fresnel effect
    float fresnel = pow(1.0 - dot(v, n), 3.0);

    // Final alpha based on the glass color's alpha and the fresnel effect
    float final_alpha = u_glassColor.a + fresnel * 0.15;

    // If the alpha is near zero, discard the fragment (for transparency)
    if (final_alpha < 0.01) {
        discard; // Discards the fragment if it's almost fully transparent
    }

    // Output the color with the calculated transparency
    gl_FragColor = vec4(u_glassColor.rgb, final_alpha); // Set the color with the final alpha
}
