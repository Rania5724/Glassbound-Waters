precision mediump float;

uniform sampler2D colorTexture;
uniform float gamma;
uniform float enabled;

varying vec2 v_texCoord;

void main() {
    vec4 color = texture2D(colorTexture, v_texCoord);

    if (enabled == 0.0) {
        gl_FragColor = color;
        return;
    }
    color.rgb = pow(color.rgb, vec3(1.0 / gamma));

    gl_FragColor = color;
}
