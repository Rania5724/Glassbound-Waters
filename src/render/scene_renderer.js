import { BlinnPhongShaderRenderer } from "./shader_renderers/blinn_phong_sr.js"
import { FlatColorShaderRenderer } from "./shader_renderers/flat_color_sr.js"
import { MirrorShaderRenderer } from "./shader_renderers/mirror_sr.js"
import { ShadowsShaderRenderer } from "./shader_renderers/shadows_sr.js"
import { MapMixerShaderRenderer } from "./shader_renderers/map_mixer_sr.js"
import { TerrainShaderRenderer } from "./shader_renderers/terrain_sr.js"
import { PreprocessingShaderRenderer } from "./shader_renderers/pre_processing_sr.js"
import { ResourceManager } from "../scene_resources/resource_manager.js"
import { GlassShaderRenderer } from "./shader_renderers/glass_sr.js"
import {MaskShaderRenderer} from "./shader_renderers/mask_sr.js"
import { NormalShaderRenderer } from "./shader_renderers/normal_sr.js"
import {PositionShaderRenderer} from "./shader_renderers/position_sr.js"
import { SSRShaderRenderer } from "./shader_renderers/ssr_sr.js"
import { SpecularShaderRenderer } from "./shader_renderers/specular_sr.js"
import { ColorShaderRenderer } from "./shader_renderers/color_sr.js"
import { ReflectionColorShaderRenderer } from "./shader_renderers/reflection_color_sr.js"
import { BoxBlurShaderRenderer } from "./shader_renderers/box_blur_sr.js"
import { ReflectionShaderRenderer } from "./shader_renderers/reflection_sr.js"
import { BaseCombineShaderRenderer } from "./shader_renderers/base_combine_sr.js"
import { BloomShaderRenderer } from "./shader_renderers/bloom_sr.js"
import { BloomBlurShaderRenderer } from "./shader_renderers/bloom_sr.js"
import { BloomExtractShaderRenderer } from "./shader_renderers/bloom_sr.js"
import { SharpenShaderRenderer } from "./shader_renderers/sharpen_sr.js"


export class SceneRenderer {

    /** 
     * Create a new scene render to display a scene on the screen
     * @param {*} regl the canvas to draw on 
     * @param {ResourceManager} resource_manager 
     */
    constructor(regl, resource_manager) {
        this.regl = regl;
        this.resource_manager = resource_manager;
        this.quad_mesh = this.resource_manager.get_mesh("fullscreen_quad"); 


        this.textures_and_buffers = {};

        // Creates the renderer object for each shader kind
        this.pre_processing = new PreprocessingShaderRenderer(regl, resource_manager);

        this.flat_color = new FlatColorShaderRenderer(regl, resource_manager);
        this.blinn_phong = new BlinnPhongShaderRenderer(regl, resource_manager);
        this.terrain = new TerrainShaderRenderer(regl, resource_manager);

        this.mirror = new MirrorShaderRenderer(regl, resource_manager);
        this.shadows = new ShadowsShaderRenderer(regl, resource_manager);
        this.map_mixer = new MapMixerShaderRenderer(regl, resource_manager);
        this.transparent = new GlassShaderRenderer(regl, resource_manager);

        this.mask = new MaskShaderRenderer(regl, resource_manager);
        this.normal = new NormalShaderRenderer(regl, resource_manager);
        this.position = new PositionShaderRenderer(regl, resource_manager);
        this.ssr = new SSRShaderRenderer(regl, resource_manager);

        this.specular = new SpecularShaderRenderer(regl, resource_manager);
        this.color = new ColorShaderRenderer(regl, resource_manager);
        this.reflection_color = new ReflectionColorShaderRenderer(regl, resource_manager);
        this.reflection = new ReflectionShaderRenderer(regl, resource_manager);
        this.base_combine = new BaseCombineShaderRenderer(regl, resource_manager);
        this.bloom = new BloomShaderRenderer(regl, resource_manager);
        this.bloom_blur = new BloomBlurShaderRenderer(regl, resource_manager);
        this.bloom_extract = new BloomExtractShaderRenderer(regl, resource_manager);
        this.box_blur = new BoxBlurShaderRenderer(regl, resource_manager);
        this.sharpen = new SharpenShaderRenderer(regl, resource_manager);

        // Create textures & buffer to save some intermediate renders into a texture
        const names = ["shadows", "base", "map_mixer", "transparency", "position", "mask", "normal", "ssr", 
            "specular", "reflection_color", "color", "box_blur", "reflection", "final_color", 
            "bloom_extract", "bloom_blur_0", "bloom_blur_1", "bloom","sharpen"];
        names.forEach(name => this.create_texture_and_buffer(name, {}));
       

    }

    /**
     * Helper function to create regl texture & regl buffers
     * @param {*} name the name for the texture (used to save & retrive data)
     * @param {*} parameters use if you need specific texture parameters
     */
    create_texture_and_buffer(name, {wrap = 'clamp', format = 'rgba', type = 'float'}){
        const regl = this.regl;
        const framebuffer_width = window.innerWidth;
        const framebuffer_height = window.innerHeight;

        // Create a regl texture and a regl buffer linked to the regl texture
        const text = regl.texture({ width: framebuffer_width, height: framebuffer_height, wrap: wrap, format: format, type: type })
        const buffer = regl.framebuffer({ color: [text], width: framebuffer_width, height: framebuffer_height, })
        
        this.textures_and_buffers[name] = [text, buffer]; 
    }

    /**
     * Function to run a rendering process and save the result in the designated texture
     * @param {*} name of the texture to render in
     * @param {*} render_function that is used to render the result to be saved in the texture
     * @returns 
     */
    render_in_texture(name, render_function){
        const regl = this.regl;
        const [texture, buffer] = this.textures_and_buffers[name];
        regl({ framebuffer: buffer })(() => {
            regl.clear({ color: [0,0,0,1], depth: 1 });
            render_function();
          });
        return texture;
    }

    /**
     * Retrieve a render texture with its name
     * @param {*} name 
     * @returns 
     */
    texture(name){
        const [texture, buffer] = this.textures_and_buffers[name];
        return texture;
    }
    
    /**
     * Render the bloom passes
     * @param {*} passes the number of passes to perform
     * @returns the texture containing the bloom result
     * @description The bloom effect is done by first extracting the bright parts of the image,
     *             then blurring them in two passes (horizontal and vertical) and finally
     *            combining them with the original image.
     */
    render_bloom_passes(passes) {
        let horizontal = true;
        let read_texture = this.textures_and_buffers["bloom_extract"][0];

        for (let i = 0; i < passes; i++) {
            const write_name = horizontal ? "bloom_blur_0" : "bloom_blur_1";
            this.render_in_texture(write_name, () => {
                this.bloom_blur.render(read_texture, horizontal ? 0 : 1);
            });
            read_texture = this.textures_and_buffers[write_name][0];
            horizontal = !horizontal;
        }
        return read_texture;
    }


    /**
     * Core function to render a scene
     * Call the render passes in this function
     * @param {*} scene_state the description of the scene, time, dynamically modified parameters, etc.
     */
    render(scene_state) {
        
        const scene = scene_state.scene;
        const frame = scene_state.frame;

        /*---------------------------------------------------------------
             Camera Setup
        ---------------------------------------------------------------*/

        // Update the camera ratio in case the windows size changed
        scene.camera.update_format_ratio(frame.framebufferWidth, frame.framebufferHeight);
        
        // Compute the objects matrices at the beginning of each frame
        // Note: for optimizing performance, some matrices could be precomputed and shared among different objects
        scene.camera.compute_objects_transformation_matrices(scene.objects);

        /*---------------------------------------------------------------
             Base Render Passes
        ---------------------------------------------------------------*/

        // Render call: the result will be stored in the texture "base"
        this.render_in_texture("base", () =>{

            // Prepare the z_buffer and object with default black color
            this.pre_processing.render(scene_state);

            // Render the background
            this.flat_color.render(scene_state);

            // Render the terrain
            this.terrain.render(scene_state);

            // Render shaded objects
            this.blinn_phong.render(scene_state);

            // Render the reflection of mirror objects on top
            this.mirror.render(scene_state, (s_s) => {
                this.pre_processing.render(scene_state);
                this.flat_color.render(s_s);
                this.terrain.render(scene_state);
                this.blinn_phong.render(s_s);
            });
            
        })

        /*---------------------------------------------------------------
             Shadows Render Pass
        ---------------------------------------------------------------*/
        
        // Render the shadows of the scene in a black & white texture. White means shadow.
        this.render_in_texture("shadows", () =>{

            // Prepare the z_buffer and object with default black color
            this.pre_processing.render(scene_state);

            // Render the shadows
            this.shadows.render(scene_state);
        })

        /*---------------------------------------------------------------
             Transparency Render Pass
        ---------------------------------------------------------------*/
        this.render_in_texture("transparency", () => {
            this.transparent.render(scene_state);
        });

        /*---------------------------------------------------------------
                Post-processing Render Pass
        ---------------------------------------------------------------*/

        this.render_in_texture("position", () => {
            this.position.render(scene_state);
        });

        this.render_in_texture("mask", () => {
            this.mask.render(scene_state);
        });

        this.render_in_texture("normal", () => {
            this.normal.render(scene_state);
        });

        this.render_in_texture("color", () => {
            this.color.render(scene_state);
        });

        this.render_in_texture("ssr", () => {
            this.ssr.render(scene_state, this.texture("position"), this.texture("normal"), this.texture("mask"), scene_state.scene.ssr_enabled);
        });

        this.render_in_texture("specular", () => {
            this.specular.render(scene_state);
        });

        this.render_in_texture("reflection_color", () => {
            this.reflection_color.render(this.texture("ssr"), this.texture("color"));
        });

        this.render_in_texture("box_blur", () => {
            this.box_blur.render(this.texture("ssr"));
        });

        this.render_in_texture("reflection", () => {
            this.reflection.render(this.texture("reflection_color"), this.texture("box_blur"), this.texture("mask"));
        });

        /*---------------------------------------------------------------
            Compositing
        ---------------------------------------------------------------*/

        this.render_in_texture("map_mixer", () => {
            this.map_mixer.render(
                scene_state,
                this.texture("shadows"),
                this.texture("base"),);
        });


        this.render_in_texture("final_color", () => {
            this.base_combine.render(
            this.texture("base"), 
            this.texture("reflection"), 
            this.texture("specular"));
        });

        /*---------------------------------------------------------------
            Bloom
        ---------------------------------------------------------------*/

        this.render_in_texture("bloom_extract", () => {
            this.bloom_extract.render(this.texture("final_color"), scene_state.scene.bloom_threshold);}
        );

        this.render_in_texture("bloom_blur_0", () => {
            this.bloom_blur.render(this.texture("bloom_extract"), 0);
        });

        this.render_in_texture("bloom_blur_1", () => {
            this.bloom_blur.render(this.texture("bloom_blur_0"), 1);
        });

        const blurred_tex = this.render_bloom_passes(10);
        this.bloom.render(this.texture("final_color"),  scene_state.scene.bloom_enabled, blurred_tex, scene_state.scene.bloom_intensity);

        this.render_in_texture("bloom", () => {
            this.bloom.render(this.texture("final_color"),  scene_state.scene.bloom_enabled, blurred_tex, scene_state.scene.bloom_intensity);
        });

        this.render_in_texture("sharpen", () => {
            this.sharpen.render(this.texture("bloom"), scene_state.scene.sharpen_enabled);
        });


        this.sharpen.render(this.texture("bloom"), scene_state.scene.sharpen_enabled);
        
        // Visualize cubemap
        //this.mirror.env_capture.visualize();

        /*this.map_mixer.render(
            scene_state, 
            this.texture("shadows"), 
            this.texture("base"), 
        );*/

        // Visualise transparent bottle:
        /*this.flat_color.render(scene_state);
        this.blinn_phong.render(scene_state);
        this.transparent.render(scene_state);*/

        //-------------Debugging----------------
        //this.position.render(scene_state);
        //this.mask.render(scene_state);
        //this.normal.render(scene_state);
        //this.color.render(scene_state);
        //this.ssr.render(scene_state, this.texture("position"), this.texture("normal"), this.texture("mask"), scene_state.scene.ssr_enabled);
        ///this.specular.render(scene_state);
        //this.reflection_color.render(this.texture("ssr"), this.texture("color"));
        //this.box_blur.render(this.texture("ssr"));
        //this.reflection.render(this.texture("reflection_color"), this.texture("box_blur"), this.texture("mask"));
        /*this.base_combine.render(
            this.texture("base"), 
            this.texture("reflection"), 
            this.texture("specular"));*/
        //this.bloom_extract.render(this.texture("final_color"), scene_state.scene.bloom_threshold);
        //this.bloom_blur.render(this.texture("bloom_extract"), 0);
        //this.bloom_blur.render(this.texture("bloom_blur_0"), 1);
        //-----------------Debugging---------------

    }

    

}






