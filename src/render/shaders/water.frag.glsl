precision mediump float;

varying vec3 v_normal;
varying vec2 v_texCoord;
varying vec2 v_wavePos; 

uniform vec3 u_water_color;
uniform float u_shininess;
uniform vec3 u_light_dir;
uniform float u_time;

uniform sampler2D u_mask_texture;

uniform sampler2D u_water_texture;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 light = normalize(u_light_dir);
    vec3 view = vec3(0.0, 0.0, 1.0);

    float diff = max(dot(normal, light), 0.0);
    vec3 reflect_dir = reflect(-light, normal);
    float spec = pow(max(dot(view, reflect_dir), 0.0), u_shininess);
    float fresnel = pow(1.0 - max(dot(normal, view), 0.0), 3.0) * 1.2;

    float ambient = 0.35;
    vec3 lit = max(vec3(ambient + diff), vec3(0.5));
    vec3 baseColor = u_water_color * lit + vec3(1.0) * spec * fresnel;

    vec2 animatedUV = fract(v_texCoord + v_wavePos * 0.1 + vec2(u_time * 0.05, u_time * 0.03));
    vec3 texColor = texture2D(u_water_texture, animatedUV).rgb;

    vec3 color = baseColor * texColor;

    float caustic =
        0.05 * sin(24.0 * v_texCoord.x + u_time * 2.0)
      * cos(24.0 * v_texCoord.y + u_time * 1.5);
    color += caustic;

    float ripple = 0.0;
    for (float x = -0.05; x <= 0.05; x += 0.01) {
        for (float y = -0.05; y <= 0.05; y += 0.01) {
            vec2 sampleCoord = v_texCoord + vec2(x, y);
            vec3 maskColor = texture2D(u_mask_texture, sampleCoord).rgb;

            if (maskColor.r > 0.8 && maskColor.g < 0.2 && maskColor.b < 0.2) {
                float dist = length(vec2(x, y));
                ripple += 0.04 * (sin(60.0 * dist - u_time * 4.0) * 0.5 + 0.5) / (dist * 5.0 + 1.0);
            }
        }
    }

    vec3 rippleColor = vec3(0.5, 0.6, 0.7);
    color += ripple * rippleColor;

    color = clamp(color, 0.0, 1.0);
    gl_FragColor = vec4(color, 0.85);
}
