import { ShaderRenderer } from "./shader_renderer.js";
import * as mat4 from "../../../lib/gl-matrix_3.3.0/esm/mat4.js";


export class ReflectionShaderRenderer extends ShaderRenderer {

    /**
     * Used to render the mix between the 
     * two texture maps: shadows & blinn_phong colors
     * @param {*} regl 
     * @param {ResourceManager} resource_manager 
     */
    constructor(regl, resource_manager){
        super(
            regl, 
            resource_manager, 
            `base.vert.glsl`, 
            `reflection.frag.glsl`
        );
    }
    
    /**
     * Render result if the mix of the two texture passed as arguments
     * @param {*} scene_state 
     * @param {*} rendered_shadows a texture containing the shadows information
     * @param {*} rendered_blinn_phong a texture with the objects colors & shading 
     */
    render(colorTexture, colorBlurTexture, maskTexture){
        const inputs = [];

        const mesh = this.resource_manager.get_mesh("fullscreen_quad"); 
        
        const identity = mat4.create();
        inputs.push({
            mesh: mesh,
            mat_model_view_projection: identity,
            colorTexture: colorTexture,
            colorBlurTexture: colorBlurTexture,
            maskTexture: maskTexture,
        });
        this.pipeline(inputs);
    }

    uniforms(regl){
        return{
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
            colorTexture: regl.prop('colorTexture'),
            colorBlurTexture: regl.prop('colorBlurTexture'),
            maskTexture: regl.prop('maskTexture'),
        };
    }

    depth(){
        return {
            enable: false,
        };
    }

    blend(){
        return{
            enable: false,
        }
    }
}

