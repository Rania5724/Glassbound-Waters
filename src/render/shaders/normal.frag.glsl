precision mediump float;

uniform float hasNormalMap;
uniform sampler2D normal_map;
varying vec3 v_normal;
varying vec2 v_texCoord;  

void main() {

  vec3 normal = v_normal;

  if (hasNormalMap == 1.0) {  
    vec3 sampledNormal = texture2D(normal_map, v_texCoord).rgb;
    normal = normalize(sampledNormal * 2.0 - 1.0);
  } 

  gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
}