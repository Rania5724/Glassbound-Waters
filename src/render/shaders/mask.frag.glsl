precision mediump float;

uniform float u_isReflective;

void main() {
  gl_FragColor = vec4(u_isReflective, 0.0, 0.0, 1.0);
}
