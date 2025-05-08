import { ShaderRenderer } from "./shader_renderer.js";

export class GlassShaderRenderer extends ShaderRenderer {

    constructor(regl, resource_manager) {
        super(
            regl,
            resource_manager,
            `glass.vert.glsl`,
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

            console.log("Glass Color:", obj.material.color);
            console.log("Opacity:", obj.material.opacity);
            console.log("Combined glass_color:", [...obj.material.color, obj.material.opacity]);

            inputs.push({
                mesh: mesh,
                mat_model_view_projection: mat_model_view_projection,
                mat_model_view: mat_model_view,
                mat_normals_model_view: mat_normals_model_view,
                glass_color: [...obj.material.color, obj.material.opacity],
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

    /**
     * Sets WebGL depth and blending options for transparent objects.
     */
    depth() {
        return {
            enable: true,
            mask: false,  // Prevents writing to the depth buffer
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

        };
    }
    
}
