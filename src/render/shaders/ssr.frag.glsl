precision mediump float;

uniform mat4 lensProjection;

uniform sampler2D positionTexture;
uniform sampler2D normalTexture;
uniform sampler2D maskTexture;
uniform float maxDistance;

uniform vec2 enabled;
uniform vec2 u_texSize;

varying vec2 v_texCoord;

void main() {
    const float resolution  = 1.5;  
    const float thickness   = 0.1;
    const int MAX_STEPS     = 64;

    vec2 texSize = u_texSize;
    vec2 texCoord = v_texCoord;

    vec4 uv = vec4(0.0);

    vec4 positionFrom = texture2D(positionTexture, texCoord);
    vec4 mask         = texture2D(maskTexture, texCoord);

    if (positionFrom.w <= 0.0 || enabled.x != 1.0 || mask.r <= 0.0) {
        gl_FragColor = uv;
        return;
    }

    vec3 unitPositionFrom = normalize(positionFrom.xyz);
    vec3 normal           = normalize(texture2D(normalTexture, texCoord).xyz);
    vec3 pivot            = normalize(reflect(unitPositionFrom, normal));

    vec4 startView = vec4(positionFrom.xyz, 1.0);
    vec4 endView   = vec4(positionFrom.xyz + (pivot * maxDistance), 1.0);

    // Project to screen space
    vec4 startFrag = lensProjection * startView;
    startFrag.xyz /= startFrag.w;
    startFrag.xy = startFrag.xy * 0.5 + 0.5;
    startFrag.xy *= texSize;

    vec4 endFrag = lensProjection * endView;
    endFrag.xyz /= endFrag.w;
    endFrag.xy = endFrag.xy * 0.5 + 0.5;
    endFrag.xy *= texSize;

    vec2 delta = endFrag.xy - startFrag.xy;
    float maxDelta = max(abs(delta.x), abs(delta.y));

    // Calculate number of steps based on desired pixel step size
    float steps_f = min(float(MAX_STEPS), maxDelta / resolution);
    if (steps_f < 1.0) steps_f = 1.0;
    int steps = int(steps_f);

    // Compute increment per step
    vec2 increment = delta / float(steps);

    vec2 frag = startFrag.xy;
    uv.xy = frag / texSize;

    float search0 = 0.0;
    float search1 = 0.0;

    int hit0 = 0;
    int hit1 = 0;

    float viewDistance = startView.y;
    float depth = thickness;

    // Coarse search for intersection
    for (int i = 0; i < MAX_STEPS; ++i) {
        if (i >= steps) break;

        frag += increment;
        uv.xy = frag / texSize;
        vec4 positionTo = texture2D(positionTexture, uv.xy);

        float lerpFactorX = (frag.x - startFrag.x) / delta.x;
        float lerpFactorY = (frag.y - startFrag.y) / delta.y;
        float useX = abs(delta.x) >= abs(delta.y) ? 1.0 : 0.0;
        search1 = mix(lerpFactorY, lerpFactorX, useX);
        search1 = clamp(search1, 0.0, 1.0);

        viewDistance = (startView.y * endView.y) / mix(endView.y, startView.y, search1);
        depth = viewDistance - positionTo.y;

        if (depth > 0.0 && depth < thickness) {
            hit0 = 1;
            break;
        } else {
            search0 = search1;
        }
    }

    // Binary refinement if hit
    search1 = search0 + ((search1 - search0) / 2.0);
    int refineSteps = 5 * hit0;

    for (int i = 0; i < MAX_STEPS; ++i) {
        if (i >= refineSteps) break;

        frag = mix(startFrag.xy, endFrag.xy, search1);
        uv.xy = frag / texSize;
        vec4 positionTo = texture2D(positionTexture, uv.xy);

        viewDistance = (startView.y * endView.y) / mix(endView.y, startView.y, search1);
        depth = viewDistance - positionTo.y;

        if (depth > 0.0 && depth < thickness) {
            hit1 = 1;
            search1 = search0 + ((search1 - search0) / 2.0);
        } else {
            float temp = search1;
            search1 = search1 + ((search1 - search0) / 2.0);
            search0 = temp;
        }
    }

    vec4 positionTo = texture2D(positionTexture, frag / texSize);

    float visibility =
        float(hit1)
      * positionTo.w
      * (1.0 - max(dot(-unitPositionFrom, pivot), 0.0))
      * (1.0 - clamp(depth / thickness, 0.0, 1.0))
      * (1.0 - clamp(length(positionTo - positionFrom) / maxDistance, 0.0, 1.0))
      * (uv.x < 0.0 || uv.x > 1.0 ? 0.0 : 1.0)
      * (uv.y < 0.0 || uv.y > 1.0 ? 0.0 : 1.0);

    visibility = clamp(visibility, 0.0, 1.0);

    uv.ba = vec2(visibility);
    gl_FragColor = uv;
}
