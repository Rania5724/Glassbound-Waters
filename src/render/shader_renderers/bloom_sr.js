import { ShaderRenderer } from "./shader_renderer.js";
import * as mat4 from "../../../lib/gl-matrix_3.3.0/esm/mat4.js";



export class BloomShaderRenderer extends ShaderRenderer {

    /**
     * Its render function can be used to render scene objects with 
     * just a color or a texture (wihtout shading effect)
     * @param {*} regl 
     * @param {ResourceManager} resource_manager 
     */
    constructor(regl, resource_manager){
        super(
            regl, 
            resource_manager, 
            `base.vert.glsl`, 
            `bloom.frag.glsl`
        );
    }

    /**
     * Render the objects of the scene_state with its shader
     */
    render(colorTexture, enabled) {
        const inputs = [];
        const mesh = this.resource_manager.get_mesh("fullscreen_quad");
        const identity = mat4.create();
        inputs.push({
            mesh: mesh,
            mat_model_view_projection: identity,
            colorTexture: colorTexture,
            enabled: enabled ? [1.0, 0.0]: [0.0, 0.0],
            u_texSize: [colorTexture.width, colorTexture.height],
        });

        this.pipeline(inputs);
    }

    
    depth(){
        return {
            enable: false};
    }

    blend(){    
        return {
            enable: true,
            func: {
                src: 'src alpha',
                dst: 'one minus src alpha',
            },
        };
    }

    uniforms(regl){        
        return {
            // View (camera) related matrix
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
    
            // Material data
            colorTexture: regl.prop('colorTexture'),
            enabled: regl.prop('enabled'),
            u_texSize: regl.prop('u_texSize'),
        };
    }
}