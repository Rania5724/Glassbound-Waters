import { ShaderRenderer } from "./shader_renderer.js";
import * as mat4 from "../../../lib/gl-matrix_3.3.0/esm/mat4.js";
import { max } from "../../../lib/gl-matrix_3.3.0/esm/vec3.js";


export class SSRShaderRenderer extends ShaderRenderer {
    constructor(regl, resource_manager) {
        super(
            regl,
            resource_manager,
            `base.vert.glsl`,
            `ssr.frag.glsl`
        );
    }

    /**
     * Render screen-space reflections only on objects marked as reflective
     */
    render(scene_state, rendered_position, rendered_normal, rendered_mask, enabled, maxDistance) {
        const scene = scene_state.scene;
        const inputs = [];

        const mesh = this.resource_manager.get_mesh("fullscreen_quad"); 
        
        const identity = mat4.create();
        inputs.push({
            mesh: mesh,
            mat_model_view_projection: identity,
            u_texSize: [rendered_mask.width, rendered_mask.height],
            enabled: enabled ? [1.0, 0.0]: [0.0, 0.0],
            lensProjection: [...scene.camera.mat.projection],
            positionTexture: rendered_position,
            normalTexture: rendered_normal,
            maskTexture: rendered_mask,
            maxDistance: maxDistance,
        });
        this.pipeline(inputs);
    }

    uniforms(regl) {
        return {
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
            lensProjection: regl.prop("lensProjection"),
            positionTexture: regl.prop("positionTexture"),
            normalTexture: regl.prop("normalTexture"),
            maskTexture: regl.prop("maskTexture"),
            enabled: regl.prop("enabled"),
            u_texSize: regl.prop("u_texSize"),
            maxDistance: regl.prop("maxDistance"),
        };
    }

    depth() {
        return {
            enable: true,
            mask: false,  
            func: "<=",
        };
    }

    blend() {
        return {
            enable: true,
            func: {
                src: 'src alpha',
                dst: 'one minus src alpha',
            },
        };
    }

}
