import {texture_data, light_to_cam_view} from "../../cg_libraries/cg_render_utils.js"
import { ResourceManager } from "../../scene_resources/resource_manager.js";
import {ShaderRenderer} from "./shader_renderer.js"


export class WaterShaderRenderer extends ShaderRenderer {
    constructor(regl, resource_manager) {
        super(
            regl,
            resource_manager,
            `water.vert.glsl`,
            `water.frag.glsl`
        );
    }

    render(scene_state, u_wave_strength = 1.0, u_mask_texture ) {
        const scene = scene_state.scene;
        for (const obj of scene.objects) {
            if (obj.mesh_reference !== "mesh_water") continue;
            const mesh = this.resource_manager.get_mesh("mesh_water");
            const matrices = scene.camera.object_matrices.get(obj);
            if (!matrices) {
                console.warn("Missing matrices for mesh_water", obj);
                continue;
            }
            const { mat_model_view_projection } = matrices;
            this.pipeline([{
                mesh: mesh,
                mat_model_view_projection: mat_model_view_projection,
                u_time: scene_state.time,
                u_water_color: [0.0, 0.4, 0.45],
                u_shininess: 16.0,
                u_light_dir:  [0.6, 1.0, 0.3],
                u_wave_strength: u_wave_strength,
                u_mask_texture: u_mask_texture,
                u_water_texture: this.resource_manager.get('water.jpg')


            }]);
        }
    }

   

    uniforms(regl) {
        return {
            mat_model_view_projection: regl.prop('mat_model_view_projection'),
            u_time: regl.prop('u_time'),
            u_water_color: regl.prop('u_water_color'),
            u_shininess: regl.prop('u_shininess'),
            u_light_dir: regl.prop('u_light_dir'),
            u_wave_strength: regl.prop('u_wave_strength'),
            u_mask_texture: regl.prop('u_mask_texture'),
            u_water_texture: regl.prop('u_water_texture'),
        };
    }
}

