precision mediump float;

uniform sampler2D baseTexture;
uniform sampler2D reflectionTexture;
uniform sampler2D specularTexture;

uniform vec2 u_texSize;

varying vec2 v_texCoord;


void main() {
  vec2 texCoord = v_texCoord;

  vec4 base       = texture2D(baseTexture,       texCoord);
  vec4 reflection = texture2D(reflectionTexture, texCoord);
  vec4 specular   = texture2D(specularTexture,   texCoord);

  vec3 color = mix(base.rgb, reflection.rgb, clamp(reflection.a, 0.0, 1.0));
  color += specular.rgb * clamp(specular.a, 0.0, 1.0);
  color = clamp(color, 0.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
}