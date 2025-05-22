precision mediump float;

attribute vec3 vertex_positions;
attribute vec3 vertex_normal;
attribute vec2 vertex_tex_coords;

uniform mat4 mat_model_view_projection;
uniform float u_time;
uniform float u_wave_strength;

varying vec3 v_normal;
varying vec2 v_texCoord;
varying vec2 v_wavePos; // Pass displaced XY for texture animation

// Gerstner wave function without baseline offset
vec3 gerstner_wave(vec3 pos, vec2 dir, float amp, float freq, float speed, inout vec3 tangent, inout vec3 bitangent) {
    vec2 fixed_offset = vec2(5.3, 3.7);

    float phase = dot(dir, pos.xy + fixed_offset) * freq + u_time * speed;
    float waveHeight = amp * sin(phase);

    float cosPhase = cos(phase);
    float dFx = -dir.x * freq * amp * cosPhase;
    float dFy = -dir.y * freq * amp * cosPhase;

    tangent += vec3(1.0 - dFx, 0.0, dFx);
    bitangent += vec3(0.0, 1.0 - dFy, dFy);

    pos.z += waveHeight;

    return pos;
}

void main() {
    vec3 pos = vertex_positions;

    vec2 dir1 = normalize(vec2(1.0, 0.5));
    vec2 dir2 = normalize(vec2(-0.7, 1.0));
    vec2 dir3 = normalize(vec2(0.5, -1.0));
    vec2 dir4 = normalize(vec2(0.3, 0.8));

    float amp1 = 0.005 * u_wave_strength;
    float amp2 = 0.004 * u_wave_strength;
    float amp3 = 0.003 * u_wave_strength;
    float amp4 = 0.0025 * u_wave_strength;

    float freq1 = 3.5;
    float freq2 = 3.0;
    float freq3 = 3.8;
    float freq4 = 3.5;

    float speedFactor = mix(0.5, 2.0, u_wave_strength) + 1.0;
    float speed1 = 2.5 * speedFactor;
    float speed2 = 2.0 * speedFactor;
    float speed3 = 2.8 * speedFactor;
    float speed4 = 2.3 * speedFactor;

    vec3 tangent = vec3(0.0);
    vec3 bitangent = vec3(0.0);

    // Save initial z to compute displacement
    float baseZ = pos.z;

    // Sum waves normally (no offset)
    pos = gerstner_wave(pos, dir1, amp1, freq1, speed1, tangent, bitangent);
    pos = gerstner_wave(pos, dir2, amp2, freq2, speed2, tangent, bitangent);
    pos = gerstner_wave(pos, dir3, amp3, freq3, speed3, tangent, bitangent);
    pos = gerstner_wave(pos, dir4, amp4, freq4, speed4, tangent, bitangent);

    // Calculate total amplitude sum
    float totalAmp = amp1 + amp2 + amp3 + amp4;

    // Add baseline offset (e.g., 40% of total amplitude)
    float baselineOffset = totalAmp * 0.4;

    pos.z = max(pos.z, baseZ + baselineOffset);

    v_normal = normalize(cross(tangent, bitangent));
    v_texCoord = vertex_tex_coords;

    v_wavePos = pos.xy;

    gl_Position = mat_model_view_projection * vec4(pos, 1.0);
}
