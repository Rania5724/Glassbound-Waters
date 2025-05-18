import { ShaderRenderer } from "./shader_renderer.js";
import * as mat4 from "../../../lib/gl-matrix_3.3.0/esm/mat4.js";


export class BaseCombineShaderRenderer extends ShaderRenderer {

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
            `base_combine.frag.glsl`
        );
    }
    
    /**
     * Render result if the mix of the two texture passed as arguments
     * @param {*} scene_state 
     * @param {*} rendered_shadows a texture containing the shadows information
     * @param {*} rendered_blinn_phong a texture with the objects colors & shading 
     */
    render(baseTexture, reflectionTexture, specularTexture){
        const inputs = [];

        const mesh = this.resource_manager.get_mesh("fullscreen_quad"); 
        
        const identity = mat4.create();
        inputs.push({
            mesh: mesh,
            mat_model_view_projection: identity,
            u_texSize: [reflectionTexture.width, reflectionTexture.height],
            baseTexture: baseTexture,
            reflectionTexture: reflectionTexture,
            specularTexture: specularTexture,
            
        });
        this.pipeline(inputs);
    }

    uniforms(regl){
        return{
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
            u_texSize: regl.prop('u_texSize'),
            baseTexture: regl.prop('baseTexture'),
            reflectionTexture: regl.prop('reflectionTexture'),
            specularTexture: regl.prop('specularTexture'),
            enabled: regl.prop('enabled'),
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

