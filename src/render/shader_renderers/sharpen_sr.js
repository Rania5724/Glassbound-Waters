import { ShaderRenderer } from "./shader_renderer.js";
import * as mat4 from "../../../lib/gl-matrix_3.3.0/esm/mat4.js";


export class SharpenShaderRenderer extends ShaderRenderer {
    constructor(regl, resource_manager) {
        super(
            regl,
            resource_manager,
            `base.vert.glsl`,
            `sharpen.frag.glsl`
        );
    }

    /**
     * Render screen-space reflections only on objects marked as reflective
     */
    render(colorTexture, enabled) {
        const inputs = [];

        const mesh = this.resource_manager.get_mesh("fullscreen_quad"); 
        
        const identity = mat4.create();
        inputs.push({
            mesh: mesh,
            mat_model_view_projection: identity,
            u_texSize: [colorTexture.width, colorTexture.height],
            enabled: enabled ? [1.0, 0.0]: [0.0, 0.0],
            colorTexture: colorTexture,

        });
        this.pipeline(inputs);
    }

    uniforms(regl) {
        return {
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
            colorTexture: regl.prop("colorTexture"),
            enabled: regl.prop("enabled"),
            u_texSize: regl.prop("u_texSize"),
        };
    }

    depth() {
        return {
            enable: false,
        };
    }



}
