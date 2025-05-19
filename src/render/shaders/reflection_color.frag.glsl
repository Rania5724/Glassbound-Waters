precision mediump float;

uniform sampler2D uvTexture;
uniform sampler2D colorTexture;
uniform vec2 u_texSize; 

varying vec2 v_texCoord;

void main() {
    int size = 6;
    float separation = 2.0;

    vec2 texSize = u_texSize;
    vec2 texCoord = v_texCoord;

    vec4 uv = texture2D(uvTexture, texCoord);

    // Removes holes in the UV map.
    if (uv.b <= 0.0) {
        uv = vec4(0.0);
        float count = 0.0;

        for (int i = -6; i <= 6; ++i) {
            for (int j = -6; j <= 6; ++j) {
                vec2 offset = vec2(float(i), float(j)) * separation;
                uv += texture2D(uvTexture, (gl_FragCoord.xy + offset) / texSize);
                count += 1.0;
            }
        }
        uv.xyz /= count;
    }

    if (uv.b <= 0.0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec4 color = texture2D(colorTexture, uv.xy);
    float alpha = clamp(uv.b, 0.0, 1.0);

    gl_FragColor = vec4(mix(vec3(0.0), color.rgb, alpha), alpha);
}