import { TurntableCamera } from "../scene_resources/camera.js"
import * as MATERIALS from "../render/materials.js"
import { cg_mesh_make_uv_sphere } from "../cg_libraries/cg_mesh.js"
import { create_slider, create_button_with_hotkey, create_hotkey_action } from "../cg_libraries/cg_web.js";
import { Scene } from "./scene.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";
import { Material } from "../../lib/webgl-obj-loader_2.0.8/webgl-obj-loader.module.js";
import { terrain_build_mesh, generate_floating_sand_island } from "../scene_resources/terrain_generation.js";
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
    this.sand_visible = true;
    this.water_visible = true;
    this.ssr_enabled = true;
    this.bloom_enabled = true;

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
      noise_functions.FBM_for_terrain, 
      {width: 96, height: 96, mouse_offset: [-12.24, 8.15]}
    );
    const floating_island_mesh = generate_floating_sand_island(height_map);
    this.resource_manager.add_procedural_mesh("mesh_floating_sand_island", floating_island_mesh);

    this.render_mesh(this.static_objects, "mesh_floating_sand_island", MATERIALS.sand, [0, 2, -2.1], [15, 15, 80]);
    this.render_mesh(this.static_objects, 'mesh_sphere_env_map', MATERIALS.sunset_sky, [0, 0, 0], [80., 80., 80.]);
    this.render_mesh(this.static_objects, 'bottle2.obj', MATERIALS.glass_material, [0, 0, 0], [1, 1, 1]);
    this.render_mesh(this.static_objects, 'boat2.obj', MATERIALS.boat_material, [0, 0, 0.05], [1, 1, 1]);
    this.render_mesh(this.static_objects, 'water2.obj', MATERIALS.water, [0, 0, 0], [1, 1, 1]);


    this.objects = this.static_objects.concat(this.dynamic_objects);
 
  }

  /**
   * Initialize the evolve function that describes the behaviour of each actor 
   */
  initialize_actor_actions(){
   

  }

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
  initialize_ui_params(){

    create_hotkey_action("Preset view", "1", () => {
      this.camera.set_preset_view({
        distance_factor : 0.5,
        angle_z : -1.5707963267948966,       
        angle_y : 0,
        look_at : [0, 0, 0]
      })
    });

    create_hotkey_action("Preset view", "2", () => {
      this.camera.set_preset_view({
        distance_factor : 1,
        angle_y: -0.22359877559829877,
        angle_z: 1.270318530717959,
        look_at : [0, 0, 0]
      })
    });

    create_hotkey_action("Log angles", "3", () => {
      console.log("Camera angles:", {
        angle_z: this.camera.angle_z,
        angle_y: this.camera.angle_y,
      });
    });

    create_button_with_hotkey("Toggle bottle", "B", () => {
      if (this.bottle_visible) {
        this.static_objects = this.static_objects.filter(obj => obj.mesh_reference !== 'bottle2.obj');
      } else {
        this.render_mesh(this.static_objects, 'bottle2.obj', MATERIALS.glass_material, [0, 0, 0], [1, 1, 1]);

      }
    
      this.bottle_visible = !this.bottle_visible;
      this.objects = this.static_objects.concat(this.dynamic_objects);
    });

    create_button_with_hotkey("Toggle boat", "T", () => {
      if (this.boat_visible) {
        this.static_objects = this.static_objects.filter(obj => obj.mesh_reference !== 'boat2.obj');
      } else {
        this.render_mesh(this.static_objects, 'boat2.obj', MATERIALS.boat_material, [0, 0, 0.05], [1, 1, 1]);
      }
    
      this.boat_visible = !this.boat_visible;
      this.objects = this.static_objects.concat(this.dynamic_objects);
    });

    create_button_with_hotkey("Toggle terrain", "S", () => {
      if (this.sand_visible) {
        this.static_objects = this.static_objects.filter(obj => obj.mesh_reference !== 'mesh_floating_sand_island');
      } else {
        this.render_mesh(this.static_objects, "mesh_floating_sand_island", MATERIALS.sand, [0, 2, -2.1], [15, 15, 80]);
      }
    
      this.sand_visible = !this.sand_visible;
      this.objects = this.static_objects.concat(this.dynamic_objects);
    });

    create_button_with_hotkey("Toggle water", "W", () => {
      if (this.water_visible) {
        this.static_objects = this.static_objects.filter(obj => obj.mesh_reference !== 'water2.obj');
      } else {
        this.render_mesh(this.static_objects, 'water2.obj', MATERIALS.water, [0, 0, 0], [1, 1, 1]);
      }
    
      this.water_visible = !this.water_visible;
      this.objects = this.static_objects.concat(this.dynamic_objects);
      
    });

    create_button_with_hotkey("Toggle SSR", "R", () => {
      this.ssr_enabled = !this.ssr_enabled;
      console.log(`SSR Enabled: ${this.ssr_enabled}`);
    });

    create_button_with_hotkey("Toggle Bloom", "L", () => {
      this.bloom_enabled = !this.bloom_enabled;
      console.log(`Bloom Enabled: ${this.bloom_enabled}`);
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
