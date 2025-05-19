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
            `bloom_combine.frag.glsl`
        );
    }

    /**
     * Render the objects of the scene_state with its shader
     */
    render(u_scene, enabled, u_bloom, u_intensity) {
        const inputs = [];
        const mesh = this.resource_manager.get_mesh("fullscreen_quad");
        const identity = mat4.create();
        inputs.push({
            mesh: mesh,
            mat_model_view_projection: identity,
            u_scene: u_scene,
            enabled: enabled ? [1.0, 0.0]: [0.0, 0.0],
            u_bloom: u_bloom,
            u_intensity: u_intensity,
            
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
                src: 'src alpha', //one
                dst: 'one minus src alpha', //one
            },
        };
    }

    uniforms(regl){        
        return {
            // View (camera) related matrix
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
    
            // Material data
            u_scene: regl.prop('u_scene'),
            enabled: regl.prop('enabled'),
            u_bloom: regl.prop('u_bloom'),
            u_intensity: regl.prop('u_intensity'),
        };
    }
}
export class BloomExtractShaderRenderer extends ShaderRenderer {

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
            `bloom_extract.frag.glsl`
        );
    }

    /**
     * Render the objects of the scene_state with its shader
     */
    render(u_scene, u_threshold) {
        const inputs = [];
        const mesh = this.resource_manager.get_mesh("fullscreen_quad");
        const identity = mat4.create();
        inputs.push({
            mesh: mesh,
            mat_model_view_projection: identity,
            u_scene: u_scene,
            u_threshold: u_threshold,
        });

        this.pipeline(inputs);
    }

    
    depth(){
        return {
            enable: false};
    }


    uniforms(regl){        
        return {
            // View (camera) related matrix
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
    
            // Material data
            u_scene: regl.prop('u_scene'),
            u_threshold: regl.prop('u_threshold'),
        
        };
    }
}
export class BloomBlurShaderRenderer extends ShaderRenderer {

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
            `bloom_blur.frag.glsl`
        );
    }

    /**
     * Render the objects of the scene_state with its shader
     */
    render(u_texture, u_horizontal){
        const inputs = [];
        const mesh = this.resource_manager.get_mesh("fullscreen_quad");
        const identity = mat4.create();
        inputs.push({
            mesh: mesh,
            mat_model_view_projection: identity,
            u_texture: u_texture,
            u_horizontal: u_horizontal,
        });

        this.pipeline(inputs);
    }

    
    depth(){
        return {
            enable: false};
    }


    uniforms(regl){        
        return {
            // View (camera) related matrix
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
    
            // Material data
            u_texture: regl.prop('u_texture'),
            u_horizontal: regl.prop('u_horizontal'),
        };
    }
}