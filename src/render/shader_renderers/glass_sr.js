import { ShaderRenderer } from "./shader_renderer.js";

export class GlassShaderRenderer extends ShaderRenderer {

    constructor(regl, resource_manager) {
        super(
            regl,
            resource_manager,
            `mirror.vert.glsl`,
            `glass.frag.glsl`
        );
    }

    /**
     * Render transparent glass objects (e.g. bottle)
     */
    render(scene_state) {
        const scene = scene_state.scene;
        const inputs = [];
        
        for (const obj of scene.objects) {
            if (this.exclude_object(obj)) continue;

            const mesh = this.resource_manager.get_mesh(obj.mesh_reference);

            const {
                mat_model_view,
                mat_model_view_projection,
                mat_normals_model_view,
            } = scene.camera.object_matrices.get(obj); 


            inputs.push({
                mesh: mesh,
                mat_model_view_projection: mat_model_view_projection,
                mat_model_view: mat_model_view,
                mat_normals_model_view: mat_normals_model_view,
                glass_color: [...obj.material.color, obj.material.opacity],
                u_ior: obj.material.ior,
            });
        }

        this.pipeline(inputs);
    }

    /**
     * Determine if the object is glass.
     */
    exclude_object(obj) {
        return !obj.material.properties.includes("transparent");
    }

    compute_cube_map(scene_state, obj, render_scene_function){
        // Remove the objects from which we render the cube map from the scene_objects, 
        const index = scene_state.scene.objects.indexOf(obj);
        if (index !== -1) {
            scene_state.scene.objects.splice(index, 1);
        }

        // Computation of the cube map
        this.env_capture.capture_scene_cubemap(
            scene_state, 
            obj.translation, 
            render_scene_function,
            scene_state.background_color
        );

        // Place back the object
        scene_state.scene.objects.push(obj);

        return this.env_capture.env_cubemap;
    }


    /**
     * Sets WebGL depth and blending options for transparent objects.
     **/
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
                srcRGB: "src alpha",
                srcAlpha: "one",
                dstRGB: "one minus src alpha",
                dstAlpha: "one minus dst alpha",
            },
        };
    }

    /**
     * Declare uniforms sent to the shader.
     */
    uniforms(regl) {
        return {
            mat_model_view_projection: regl.prop("mat_model_view_projection"),
            mat_model_view: regl.prop("mat_model_view"),
            mat_normals_model_view: regl.prop("mat_normals_model_view"),
            u_glassColor: regl.prop("glass_color"),
            u_ior: regl.prop("u_ior"),
        };
    }
    
}
