precision highp float;


uniform sampler2D u_scene;
uniform float u_threshold;

varying vec2 v_texCoord;

void main() {
    vec3 color = texture2D(u_scene, v_texCoord).rgb;
    float brightness = max(max(color.r, color.g), color.b);
    gl_FragColor = brightness > u_threshold ? vec4(color, 1.0) : vec4(0.0);
}
