precision mediump float;

uniform sampler2D colorTexture;
uniform vec2 enabled;
uniform vec2 u_texSize;

void main() {
  int size = 3;
  float separation = 0.5;
  float threshold = 0.15; 
  float thresholdSoftness = 0.1;
  float amount = 0.8;

  vec2 texSize = u_texSize;
  vec2 uv = gl_FragCoord.xy / texSize;

  if (enabled.x != 1.0 || size <= 0) {
    gl_FragColor = texture2D(colorTexture, uv);
    return;
  }

  vec4 centerColor = texture2D(colorTexture, uv);
  float brightness = dot(centerColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  
  float mask = smoothstep(threshold - thresholdSoftness, threshold + thresholdSoftness, brightness);
  vec4 brightColor = centerColor * mask;

  vec4 result = vec4(0.0);
  float count = 0.0;

  for (int i = -3; i <= 3; ++i) {
    for (int j = -3; j <= 3; ++j) {
      if (abs(float(i)) > float(size) || abs(float(j)) > float(size)) continue;

      vec2 offset = vec2(float(i), float(j)) * separation;
      vec2 sampleUV = uv + offset / texSize;

      vec4 sampleColor = texture2D(colorTexture, sampleUV);
      
      float sampleBrightness = dot(sampleColor.rgb, vec3(0.2126, 0.7152, 0.0722));
      float sampleMask = smoothstep(threshold - thresholdSoftness, threshold + thresholdSoftness, sampleBrightness);

      result += sampleColor * sampleMask;
      count += 1.0;
    }
  }

  result /= count;

  gl_FragColor = mix(centerColor, result, amount);
  //gl_FragColor = centerColor + result * (amount * 0.5);
}
