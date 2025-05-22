import { ShaderRenderer } from "./shader_renderer.js";
import * as mat4 from "../../../lib/gl-matrix_3.3.0/esm/mat4.js";

export class BoxBlurShaderRenderer extends ShaderRenderer {
    constructor(regl, resource_manager) {
        super(
            regl,
            resource_manager,
            `base.vert.glsl`, // or your fullscreen quad vertex shader
            `box_blur.frag.glsl`
        );
    }


    render(colorTexture) {
        const mesh = this.resource_manager.get_mesh("fullscreen_quad");
        const identity = mat4.create();

        const inputs = [{
            mesh: mesh,
            mat_model_view_projection: identity,
            colorTexture: colorTexture,
            u_texSize: [colorTexture.width, colorTexture.height],
            parameters: [5.0, 2],
        }];

        this.pipeline(inputs);
    }

    uniforms(regl) {
        return {
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
            colorTexture: regl.prop('colorTexture'),
            u_texSize: regl.prop('u_texSize'),
            parameters: regl.prop('parameters'),
        };
    }

    depth() {
        return { enable: false };
    }

}