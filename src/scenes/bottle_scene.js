import { TurntableCamera } from "../scene_resources/camera.js"
import * as MATERIALS from "../render/materials.js"
import { cg_mesh_make_uv_sphere } from "../cg_libraries/cg_mesh.js"
import { create_slider, create_button_with_hotkey, create_hotkey_action, clear_overlay, create_offset_form } from "../cg_libraries/cg_web.js";
import { Scene } from "./scene.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";
import { Material } from "../../lib/webgl-obj-loader_2.0.8/webgl-obj-loader.module.js";
import { terrain_build_mesh, generate_floating_sand_island, generate_wavy_sea_mesh_from_heightmap } from "../scene_resources/terrain_generation.js";
import { ProceduralTextureGenerator } from "../render/procedural_texture_generator.js"
import { vec3 } from "../../lib/gl-matrix_3.3.0/esm/index.js"
import { noise_functions } from "../render/shader_renderers/noise_sr.js";

export class BottleScene extends Scene {

  /**
   * A scene to be completed, used for the introductory tutorial
   * @param {ResourceManager} resource_manager 
   */
  constructor(resource_manager, procedural_texture_generator){
    super();

    this.procedural_texture_generator = procedural_texture_generator;
    this.resource_manager = resource_manager;

    this.static_objects = [];
    this.dynamic_objects = [];

    this.bottle_visible = true;
    this.boat_visible = true;
    this.water_visible = true;
    this.ssr_enabled = true;
    this.ssr_max_distance = 1.2;
    this.bloom_enabled = true;
    this.bloom_intensity = 0.2;
    this.bloom_threshold = 0.3;
    this.sharpen_enabled = true;
    this.ssr_roughness = 0.1;
    this.gamma_enabled = true;
    this.gamma = 1.0 / 1.5;
    this.water_enabled = true;
    this.wave_strength = 0.1;
    this.has_fallen = false;

    // Add a map to store removed dynamic objects and their states
    this.removed_dynamic_objects = {};

    this.initialize_scene();
    this.initialize_actor_actions();
  }

  /**
   * Scene setup
   */
  initialize_scene(){

    this.lights.push({
      position : [-4,-5,7],
      color: [0.75, 0.53, 0.45]
    });
    this.lights.push({
      position : [6,4,6],
      color: [0.0, 0.0, 0.3]
    });


    this.resource_manager.add_procedural_mesh("mesh_sphere_env_map", cg_mesh_make_uv_sphere(16));
  
    const height_map = this.procedural_texture_generator.compute_texture(
      "perlin_heightmap", 
      noise_functions.FBM, 
      {width: 128, height: 128, mouse_offset: [-12.24, 8.15]}
    );
    this.water_mesh = generate_wavy_sea_mesh_from_heightmap(height_map, 0.02);
    this.resource_manager.add_procedural_mesh("mesh_water", this.water_mesh);
    this.sand_mesh = generate_floating_sand_island(height_map, 0.02);
    this.resource_manager.add_procedural_mesh("mesh_sand", this.sand_mesh);


    this.render_mesh(this.static_objects, "mesh_water", MATERIALS.water, [2, 6, -2.8], [60, 30, 170]);
    this.render_mesh(this.static_objects, 'mesh_sphere_env_map', MATERIALS.sunset_sky_2, [0, 0, 0], [80., 80., 80.]);
    this.render_mesh(this.dynamic_objects, 'boat2.obj', MATERIALS.boat_material, [-1, 0, 0.28], [2, 2, 2]);
    this.render_mesh(this.dynamic_objects, 'bottle2.obj', MATERIALS.mirror, [0, 0, 0.1], [2.5, 2.5, 2.5]);
    this.actors["boat"] = this.dynamic_objects[0];
    this.actors["bottle"] = this.dynamic_objects[1];
    this.actors["boat"].base_translation = this.actors["boat"].translation ?? [-1, 0, 0.28];
    this.actors["bottle"].base_translation = this.actors["bottle"].translation ?? [0, 0, 0.1];


    this.objects = this.static_objects.concat(this.dynamic_objects);
 
  }

  /**
   * Initialize the evolve function that describes the behaviour of each actor 
   */
  initialize_actor_actions() {
    this.phase = 0;
    this.actors["bottle"].evolve = (dt) => {
      if (!this.actors["bottle"]) return;

      // ---- Comment to disable bottle falling
      if (!this.water_visible ) {
        if (!this.actors["bottle"].falling ) {
          this.actors["bottle"].falling = true;
          this.actors["bottle"].frozen_fall_pos = [...this.actors["bottle"].translation];
        }
        this.actors["bottle"].translation[0] = this.actors["bottle"].frozen_fall_pos[0];
        this.actors["bottle"].translation[1] = this.actors["bottle"].frozen_fall_pos[1];
        this.actors["bottle"].translation[2] -= 80.0 * dt;
        this.actors["bottle"].scale = this.actors["bottle"].scale ?? [1, 1, 1];
        if (this.actors["bottle"].translation[2] < -150) {
          this.actors["bottle"].translation[2] = -150;
          return;
        }
        return;
      }

      this.actors["bottle"].falling = false;
      delete this.actors["bottle"].frozen_fall_pos;
      // ----

      const frequency = 0.25;
      this.phase += dt * 2 * Math.PI * frequency;
      this.phase %= 2 * Math.PI;

      const base_translation = this.actors["bottle"].base_translation;
      const bob_amplitude = 0.12 * (1 + this.wave_strength) * 1.5;
      const bob = Math.sin(this.phase) * bob_amplitude;

      const sway_amplitude = 0.06 * (1 + this.wave_strength) * 1.5;
      const sway = Math.sin(this.phase * 1.2) * sway_amplitude;

      this.actors["bottle"].translation = [
        base_translation[0] + sway,
        base_translation[1] + bob,
        base_translation[2]
      ];
  };
    this.actors["boat"].evolve = (dt) => {
      if (!this.actors["boat"]) return;

      // ---- Comment to disable boat falling
      if (!this.water_visible ) {
        if (!this.actors["boat"].falling) {
          this.actors["boat"].falling = true;
          this.actors["boat"].frozen_fall_pos = [...this.actors["boat"].translation];
        }
        this.actors["boat"].translation[0] = this.actors["boat"].frozen_fall_pos[0];
        this.actors["boat"].translation[1] = this.actors["boat"].frozen_fall_pos[1];
        this.actors["boat"].translation[2] -= 80.0 * dt;
        this.actors["boat"].scale = this.actors["boat"].scale ?? [1, 1, 1];
        if (this.actors["boat"].translation[2] < -150) {
          this.actors["boat"].translation[2] = -150;
          return;
        }
        
        return;
      }

      this.actors["boat"].falling = false;
      delete this.actors["boat"].frozen_fall_pos;
      // ----

      const frequency = 0.25;
      this.phase += dt * 2 * Math.PI * frequency;
      this.phase %= 2 * Math.PI;

      const base_translation = this.actors["boat"].base_translation;
      const bob_amplitude = 0.12 * (1 + this.wave_strength) * 1.5;
      const bob = Math.sin(this.phase) * bob_amplitude;

      const sway_amplitude = 0.06 * (1 + this.wave_strength) * 1.5;
      const sway = Math.sin(this.phase * 1.2) * sway_amplitude;

      this.actors["boat"].translation = [
        base_translation[0] + sway,
        base_translation[1] + bob,
        base_translation[2]
      ];
    };

}


  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
  initialize_ui_params(){

    create_hotkey_action("Preset view", "1", () => {
      this.camera.set_preset_view({
        distance_factor : 1,
        angle_z : -1.5707963267948966,       
        angle_y : 0,
        look_at : [0, 0, 0]
      })
    });

    create_hotkey_action("Preset view", "2", () => {
      this.camera.set_preset_view({
        distance_factor : 1.5,
        angle_y: -0.22359877559829877,
        angle_z: 1.270318530717959,
        look_at : [0, 0, 0]
      })
    });

    create_hotkey_action("Preset view", "3", () => {
      this.camera.set_preset_view({
        distance_factor : 1.5,
        angle_y: -0.157598775598299,
        angle_z: -9.45168146928204,
        look_at : [0, 0, 0]
      })
    });

    create_hotkey_action("Preset view", "4", () => {
      this.camera.set_preset_view({
        distance_factor : 1.5,
        angle_y: -0.9825987755983001,
        angle_z: 14.242318530717966,
        look_at : [0, 0, 0]
      })
    });

    create_hotkey_action("Preset view", "5", () => {
      this.camera.set_preset_view({
        distance_factor : 1.5,
        angle_y: -0.5805987755983,
        angle_z: 11.629318530717976,
        look_at : [0, 0, 0]
      })
    }
    );

    create_hotkey_action("Log angles", "6", () => {
      console.log("Camera angles:", {
        angle_z: this.camera.angle_z,
        angle_y: this.camera.angle_y,
      });
    });

    create_button_with_hotkey("Toggle bottle", "B", () => {
      if (this.bottle_visible) {
        this.removed_dynamic_objects['bottle'] = this.actors["bottle"];
        this.dynamic_objects = this.dynamic_objects.filter(obj => obj.mesh_reference !== 'bottle2.obj');
      } else {
        const bottleState = this.removed_dynamic_objects['bottle'];
        this.render_mesh(this.dynamic_objects, 'bottle2.obj', MATERIALS.mirror, bottleState.translation, bottleState.scale);
        this.actors["bottle"] = this.dynamic_objects[this.dynamic_objects.length - 1];
        this.actors["bottle"].evolve = bottleState.evolve;
        this.actors["bottle"].base_translation = bottleState.base_translation;

      }
    
      this.bottle_visible = !this.bottle_visible;
      this.objects = this.static_objects.concat(this.dynamic_objects);
    });

    create_button_with_hotkey("Toggle boat", "T", () => {
      if (this.boat_visible) {
        this.removed_dynamic_objects['boat'] = this.actors["boat"];
        this.dynamic_objects = this.dynamic_objects.filter(obj => obj.mesh_reference !== 'boat2.obj');
      } else {
        const boatState = this.removed_dynamic_objects['boat'];
        this.render_mesh(this.dynamic_objects, 'boat2.obj', MATERIALS.boat_material, boatState.translation, boatState.scale);
        this.actors["boat"] = this.dynamic_objects[this.dynamic_objects.length - 1];
        this.actors["boat"].evolve = boatState.evolve;
        this.actors["boat"].base_translation = boatState.base_translation;

      }
    
      this.boat_visible = !this.boat_visible;
      this.objects = this.static_objects.concat(this.dynamic_objects);
    });

    create_button_with_hotkey("Toggle terrain", "S", () => {
      if (this.water_visible) {
        this.static_objects = this.static_objects.filter(obj => obj.mesh_reference !== 'mesh_water');
      } else {
        this.render_mesh(this.static_objects, "mesh_water", MATERIALS.water, [2, 6, -2.8], [50, 30, 170]);

      }
      this.water_visible = !this.water_visible;
      this.objects = this.static_objects.concat(this.dynamic_objects);
    });

    create_button_with_hotkey("Toggle SSR", "R", () => {
      this.ssr_enabled = !this.ssr_enabled;
      console.log("SSR enabled:", this.ssr_enabled);
    });

    create_slider("Reflection Distance", [12, 250], (value) => {
        this.ssr_max_distance = value / 10.0; ;
        console.log("SSR max distance:", this.ssr_max_distance);
    }); 

    create_slider("Reflection Blur", [1, 6], (value) => {
        this.ssr_roughness = value / 10.0;
        console.log("SSR roughness:", this.ssr_roughness);
    });

    create_button_with_hotkey("Toggle Bloom", "L", () => {
      this.bloom_enabled = !this.bloom_enabled;
      console.log("Bloom enabled:", this.bloom_enabled);

    });

    create_slider("Bloom Intensity", [2, 10], (value) => {
        this.bloom_intensity = value / 10.0;
        console.log("Bloom intensity:", this.bloom_intensity);
    }); 

    create_slider("Bloom Threshold", [3, 10], (value) => {
        this.bloom_threshold = value / 10.0;
        console.log("Bloom threshold:", this.bloom_threshold);
    }); 

    create_button_with_hotkey("Toggle Sharpen", "Z", () => {
      this.sharpen_enabled = !this.sharpen_enabled;
      console.log("Sharpen enabled:", this.sharpen_enabled);
    });

    create_button_with_hotkey("Toggle Gamma", "G", () => {
      this.gamma_enabled = !this.gamma_enabled;
      console.log("Gamma enabled:", this.gamma_enabled);
    });

    create_slider("Gamma", [1, 10], (value) => {
        this.gamma =  (1/3) + (value - 1) * (3.0 - 1/3) / (10 - 1);
        console.log("Gamma:", this.gamma);
    });

    create_button_with_hotkey("Toggle Waves", "W", () => {
      this.water_enabled = !this.water_enabled;
      console.log("Water enabled:", this.water_enabled);
    });

    create_slider("Wave Strength", [2, 10], (value) => {
      this.wave_strength = value / 10.0;
      console.log("Wave strength:", this.wave_strength);
    });


  }

  render_mesh(static_objects, name_mesh, material, translation, scale){
    static_objects.push({
      translation: translation,
      scale: scale,
      mesh_reference: name_mesh,
      material: material,
    })

  }
  


}
