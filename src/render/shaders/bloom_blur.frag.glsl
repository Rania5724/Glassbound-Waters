precision highp float;

varying vec2 v_texCoord;
uniform sampler2D u_texture;
uniform int u_horizontal;

void main() {
    float weights[5];
    weights[0] = 0.227027;
    weights[1] = 0.1945946;
    weights[2] = 0.1216216;
    weights[3] = 0.054054;
    weights[4] = 0.016216;

    // Pass texel size as a uniform from JS
    vec2 tex_offset = vec2(1.0/512.0, 1.0/512.0); // Replace with uniform u_texelSize for dynamic size
    vec3 result = texture2D(u_texture, v_texCoord).rgb * weights[0];
    for(int i = 1; i < 5; ++i) {
        if(u_horizontal == 1) {
            result += texture2D(u_texture, v_texCoord + vec2(tex_offset.x * float(i), 0.0)).rgb * weights[i];
            result += texture2D(u_texture, v_texCoord - vec2(tex_offset.x * float(i), 0.0)).rgb * weights[i];
        } else {
            result += texture2D(u_texture, v_texCoord + vec2(0.0, tex_offset.y * float(i))).rgb * weights[i];
            result += texture2D(u_texture, v_texCoord - vec2(0.0, tex_offset.y * float(i))).rgb * weights[i];
        }
    }
    gl_FragColor = vec4(result, 1.0);
}
