precision mediump float;

varying vec3 v_normal; 

void main() {
  // Encode normal from [-1,1] to [0,1]
  gl_FragColor = vec4(normalize(v_normal) * 0.5 + 0.5, 1.0);
}
