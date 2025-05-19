precision mediump float;

uniform sampler2D colorTexture;
uniform vec2 parameters; // x = size, y = separation
uniform vec2 u_texSize;

varying vec2 v_texCoord;

const int MAX_SIZE = 5; // maximum blur radius

void main() {
  vec2 texSize = u_texSize;
  vec2 texCoord = v_texCoord;

  vec4 fragColorTemp = texture2D(colorTexture, texCoord);

  float size = parameters.x;
  if (size <= 0.0) {
    gl_FragColor = fragColorTemp;
    return;
  }

  float separation = max(parameters.y, 1.0);

  vec3 colorSum = vec3(0.0);
  float count = 0.0;

  for (int i = -MAX_SIZE; i <= MAX_SIZE; ++i) {
    for (int j = -MAX_SIZE; j <= MAX_SIZE; ++j) {
      if (abs(float(i)) > size || abs(float(j)) > size) {
        continue;
      }

      vec2 offset = vec2(float(i), float(j)) * separation / texSize;
      vec2 sampleCoord = texCoord + offset;
      colorSum += texture2D(colorTexture, sampleCoord).rgb;
      count += 1.0;
    }
  }

  vec3 averagedColor = colorSum / count;
  gl_FragColor = vec4(averagedColor, 1.0);

  
}
