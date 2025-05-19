precision highp float;

uniform sampler2D u_scene;
uniform sampler2D u_bloom;
uniform float u_intensity;
uniform vec2 enabled;

varying vec2 v_texCoord;


void main() {
    if (enabled.x == 0.0) {
        gl_FragColor = vec4(texture2D(u_scene, v_texCoord).rgb * 1.2, 1.0); // Adjust brightness if bloom is disabled just to avoid it being too dark
        return;
    }
    vec3 sceneColor = texture2D(u_scene, v_texCoord).rgb;
    vec3 bloomColor = texture2D(u_bloom, v_texCoord).rgb;
    gl_FragColor = vec4(clamp(sceneColor + bloomColor * u_intensity, 0.0, 1.0), 1.0);
}
