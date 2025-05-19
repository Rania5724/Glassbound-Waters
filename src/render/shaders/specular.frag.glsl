precision mediump float;

uniform vec3 u_specular;
uniform float u_shininess;

const float MAX_SHININESS = 127.75;

void main() {
    float shininessClamped = clamp(u_shininess / MAX_SHININESS, 0.0, 1.0);
    gl_FragColor = vec4(u_specular, shininessClamped);
}
