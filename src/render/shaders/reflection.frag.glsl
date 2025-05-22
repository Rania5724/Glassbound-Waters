precision mediump float;

uniform sampler2D colorTexture;
uniform sampler2D colorBlurTexture;
uniform sampler2D maskTexture;
uniform float roughness;

varying vec2 v_texCoord;

void main() {
  vec2 texCoord = v_texCoord;

  vec4 mask      = texture2D(maskTexture,      texCoord);
  vec4 color     = texture2D(colorTexture,     texCoord);
  vec4 colorBlur = texture2D(colorBlurTexture, texCoord);

  float amount = clamp(mask.r, 0.0, 1.0);

  if (amount <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  gl_FragColor = mix(color, colorBlur, roughness);
  
}
