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
    this.bloom_enabled = true;
    this.bloom_intensity = 0.2;
    this.bloom_threshold = 0.3;

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
      {width: 96, height: 96, mouse_offset: [-12.24, 8.15]}
    );
    this.water_mesh = generate_wavy_sea_mesh_from_heightmap(height_map, 0.02);
    this.resource_manager.add_procedural_mesh("mesh_water", this.water_mesh);


    this.render_mesh(this.static_objects, "mesh_water", MATERIALS.water, [2, 6, -2.8], [60, 30, 170]);
    this.render_mesh(this.static_objects, 'mesh_sphere_env_map', MATERIALS.sunset_sky, [0, 0, 0], [80., 80., 80.]);
    this.render_mesh(this.dynamic_objects, 'boat2.obj', MATERIALS.boat_material, [-1, 0, 0.25], [2, 2, 2]);
    this.render_mesh(this.dynamic_objects, 'bottle2.obj', MATERIALS.mirror, [0, 0, 0], [2.5, 2.5, 2.5]);
    this.actors["boat"] = this.dynamic_objects[0];
    this.actors["bottle"] = this.dynamic_objects[1];

    this.objects = this.static_objects.concat(this.dynamic_objects);
 
  }

  /**
   * Initialize the evolve function that describes the behaviour of each actor 
   */
  initialize_actor_actions() {
    this.phase = 0;

    this.actors["boat"].evolve = (dt) => {
      const frequency = 0.25;
      this.phase += dt * 2 * Math.PI * frequency;
      this.phase %= 2 * Math.PI;

      const base_translation = this.actors["boat"].translation ?? [0, 0.3, 0];
      const base_scale = this.actors["boat"].scale ?? [1, 1, 1];

      const bob_amplitude = 0.03;
      const bob = Math.sin(this.phase) * bob_amplitude;

      const sway_amplitude = 0.015;
      const sway = Math.sin(this.phase * 1.5) * sway_amplitude;

      this.actors["boat"].translation = [
        base_translation[0] + sway, 
        base_translation[1] + bob,  
        base_translation[2]
      ];

      this.actors["boat"].scale = base_scale;
  };

  this.actors["bottle"].evolve = (dt) => {
    const frequency = 0.25;
    this.phase += dt * 2 * Math.PI * frequency;
    this.phase %= 2 * Math.PI;

    const base_translation = this.actors["bottle"].translation ?? [0, 0.0, 0];
    const base_scale = this.actors["bottle"].scale ?? [1, 1, 1];

    const bob_amplitude = 0.015; 
    const bob = Math.sin(this.phase) * bob_amplitude;

    const sway_amplitude = 0.005;
    const sway = Math.sin(this.phase * 1.2) * sway_amplitude;

    this.actors["bottle"].translation = [
      base_translation[0] + sway,
      base_translation[1] + bob,
      base_translation[2]
    ];

    this.actors["bottle"].scale = base_scale;
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
        angle_y: 0.06140122440170073,
        angle_z: 14.512318530717959,
        look_at : [0, 0, 0]
      })
    });

    create_hotkey_action("Log angles", "5", () => {
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
    });

    create_button_with_hotkey("Toggle Bloom", "L", () => {
      this.bloom_enabled = !this.bloom_enabled;

    });

    create_slider("Bloom Intensity", [0, 10], (value) => {
        this.bloom_intensity = value / 10.0;
    }); 

    create_slider("Bloom Threshold", [0, 10], (value) => {
        this.bloom_threshold = value / 10.0;
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
