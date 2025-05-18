precision mediump float;

uniform sampler2D colorTexture;
uniform vec2 parameters; // x = size, y = separation
uniform vec2 u_texSize;

const int MAX_SIZE = 5; // maximum blur radius

void main() {
  vec2 texSize  = u_texSize;
  vec2 texCoord = gl_FragCoord.xy / texSize;

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
      // skip samples beyond current blur size
      if (abs(float(i)) > size || abs(float(j)) > size) {
        continue;
      }

      vec2 offset = vec2(float(i), float(j)) * separation;
      vec2 sampleCoord = (gl_FragCoord.xy + offset) / texSize;
      colorSum += texture2D(colorTexture, sampleCoord).rgb;
      count += 1.0;
    }
  }

  vec3 averagedColor = colorSum / count;
  gl_FragColor = vec4(averagedColor, 1.0);
}
