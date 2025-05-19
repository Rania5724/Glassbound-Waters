precision mediump float;

uniform vec2 gamma;
uniform sampler2D colorTexture;
uniform vec2 u_texSize; 

varying vec2 v_texCoord; 

void main() {
  vec2 texCoord = gl_FragCoord.xy / u_texSize;
  vec4 color = texture2D(colorTexture, texCoord);
  color.rgb = pow(color.rgb, vec3(gamma.y));
  gl_FragColor = color;
}
