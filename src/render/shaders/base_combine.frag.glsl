precision mediump float;

uniform sampler2D baseTexture;
uniform sampler2D reflectionTexture;
uniform sampler2D specularTexture;

uniform vec2 u_texSize;

const float reflectionScale = 0.5; 
const float specularScale = 0.5;  


void main() {
  vec2 texCoord = gl_FragCoord.xy / u_texSize;

  vec4 base       = texture2D(baseTexture,       texCoord);
  vec4 reflection = texture2D(reflectionTexture, texCoord);
  vec4 specular   = texture2D(specularTexture,   texCoord);
  vec4 fragColor = base;
  fragColor.rgb  = mix(fragColor.rgb, reflection.rgb, clamp(reflection.a, 0.0, 1.0));
  fragColor.rgb += specular.rgb * clamp(specular.a, 0.0, 1.0);

  gl_FragColor = fragColor;
}
