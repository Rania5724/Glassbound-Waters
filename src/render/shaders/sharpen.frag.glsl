precision mediump float;

uniform sampler2D colorTexture;
uniform vec2 enabled;
uniform vec2 u_texSize;

varying vec2 v_texCoord;

void main() {
  float amount = 0.3;

  if (enabled.x != 1.0) {
    gl_FragColor = texture2D(colorTexture, v_texCoord);
    return;
  }

  vec2 texel = 1.0 / u_texSize;

  float neighbor = amount * -1.0;
  float center   = amount * 4.0 + 1.0;

  vec3 color =
      texture2D(colorTexture, v_texCoord + texel * vec2( 0.0,  1.0)).rgb * neighbor +
      texture2D(colorTexture, v_texCoord + texel * vec2(-1.0,  0.0)).rgb * neighbor +
      texture2D(colorTexture, v_texCoord + texel * vec2( 0.0,  0.0)).rgb * center   +
      texture2D(colorTexture, v_texCoord + texel * vec2( 1.0,  0.0)).rgb * neighbor +
      texture2D(colorTexture, v_texCoord + texel * vec2( 0.0, -1.0)).rgb * neighbor;

  gl_FragColor = vec4(color, texture2D(colorTexture, v_texCoord).a);
}
