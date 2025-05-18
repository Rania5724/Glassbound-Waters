import { ShaderRenderer } from "./shader_renderer.js";
import * as mat4 from "../../../lib/gl-matrix_3.3.0/esm/mat4.js";


export class ReflectionColorShaderRenderer extends ShaderRenderer {
    constructor(regl, resource_manager) {
        super(
            regl,
            resource_manager,
            `base.vert.glsl`,
            `reflection_color.frag.glsl`
        );
    }

    render( uvTexture, colorTexture) {
        const mesh = this.resource_manager.get_mesh("fullscreen_quad");
        const identity = mat4.create();

        const inputs = [{
            mesh: mesh,
            mat_model_view_projection: identity,
            uvTexture: uvTexture,
            colorTexture: colorTexture,
            u_texSize: [uvTexture.width, uvTexture.height],
        }];

        this.pipeline(inputs);
    }

    uniforms(regl) {
        return {
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
            uvTexture: regl.prop('uvTexture'),
            colorTexture: regl.prop('colorTexture'),
            u_texSize: regl.prop('u_texSize'),
        };
    }

    depth() {
        return { enable: false };
    }

    blend() {
        return { enable: false };   
    }

    

}