precision mediump float;

uniform sampler2D uvTexture;
uniform sampler2D colorTexture;
uniform vec2 u_texSize; 

varying vec2 v_texCoord;

void main() {
    const int SIZE = 6; // Changed to const
    float separation = 2.0;

    vec2 texSize = u_texSize;
    vec2 texCoord = v_texCoord;

    vec4 uv = texture2D(uvTexture, texCoord);

    if (uv.b <= 0.0) {
        uv = vec4(0.0);
        float totalWeight = 0.0;
        vec2 validUV = vec2(-1.0);
        
        for (int i = -3; i <= 3; ++i) {
            for (int j = -3; j <= 3; ++j) {
                if (validUV.x >= 0.0) continue;
                
                vec2 offset = vec2(float(i), float(j)) * separation;
                vec4 sampleUV = texture2D(uvTexture, (gl_FragCoord.xy + offset) / texSize);
                
                if (sampleUV.b > 0.0) {
                    validUV = sampleUV.xy;
                }
            }
        }
        
        if (validUV.x >= 0.0) {
            for (int i = -6; i <= 6; ++i) { 
                for (int j = -6; j <= 6; ++j) { 
                    vec2 offset = vec2(float(i), float(j)) * separation;
                    float dist = length(offset) / (float(SIZE) * separation);
                    float weight = max(0.0, 1.0 - dist * dist);
                    
                    vec4 sampleUV = texture2D(uvTexture, (gl_FragCoord.xy + offset) / texSize);
                    
                    if (sampleUV.b > 0.0) {
                        float uvSimilarity = 1.0 - min(1.0, length(sampleUV.xy - validUV) * 5.0);
                        weight *= max(0.1, uvSimilarity);
                        
                        uv += sampleUV * weight;
                        totalWeight += weight;
                    }
                }
            }
            
            if (totalWeight > 0.0) {
                uv /= totalWeight;
            }
        } else {
            float count = 0.0;
            for (int i = -6; i <= 6; ++i) { 
                for (int j = -6; j <= 6; ++j) { 
                    vec2 offset = vec2(float(i), float(j)) * separation;
                    vec4 sampleUV = texture2D(uvTexture, (gl_FragCoord.xy + offset) / texSize);
                    uv += sampleUV;
                    count += 1.0;
                }
            }
            
            if (count > 0.0) {
                uv /= count;
            }
        }
    }

    if (uv.b <= 0.0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec4 color = texture2D(colorTexture, uv.xy);
    float alpha = clamp(uv.b * 0.6, 0.0, 1.0);

    float edgeFactor = smoothstep(0.0, 0.2, alpha);
    alpha *= edgeFactor;


    gl_FragColor = vec4(mix(vec3(0.0), color.rgb, alpha), alpha);
}