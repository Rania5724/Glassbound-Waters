import { ShaderRenderer } from "./shader_renderer.js";
import * as mat4 from "../../../lib/gl-matrix_3.3.0/esm/mat4.js";
import { vec2 } from "../../../lib/gl-matrix_3.3.0/esm/index.js";


export class GammaShaderRenderer extends ShaderRenderer {
    constructor(regl, resource_manager) {
        super(
            regl,
            resource_manager,
            `base.vert.glsl`,
            `gamma.frag.glsl`
        );
    }

    /**
     * Render screen-space reflections only on objects marked as reflective
     */
    render(colorTexture, gamma = 1 / 1.5, enabled = true) {
        const inputs = [];

        const mesh = this.resource_manager.get_mesh("fullscreen_quad"); 
        
        const identity = mat4.create();
        inputs.push({
            mesh: mesh,
            mat_model_view_projection: identity,
            gamma:  gamma,
            colorTexture: colorTexture,
            enabled: enabled ? 1.0 : 0.0,

        });
        this.pipeline(inputs);
    }

    uniforms(regl) {
        return {
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
            colorTexture: regl.prop("colorTexture"),
            gamma: regl.prop("gamma"),
            enabled: regl.prop("enabled"),
        };
    }

    depth() {
        return {
            enable: false,
        };
    }



}
