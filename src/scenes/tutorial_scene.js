import { TurntableCamera } from "../scene_resources/camera.js"
import * as MATERIALS from "../render/materials.js"
import { cg_mesh_make_uv_sphere } from "../cg_libraries/cg_mesh.js"

import { 
  create_slider, 
  create_button_with_hotkey, 
  create_hotkey_action 
} from "../cg_libraries/cg_web.js";
import { Scene } from "./scene.js";
import { ResourceManager } from "../scene_resources/resource_manager.js";
import { Material } from "../../lib/webgl-obj-loader_2.0.8/webgl-obj-loader.module.js";

export class TutorialScene extends Scene {

  /**
   * A scene to be completed, used for the introductory tutorial
   * @param {ResourceManager} resource_manager 
   */
  constructor(resource_manager){
    super();
    
    this.resource_manager = resource_manager;

    this.static_objects = [];
    this.dynamic_objects = [];

    this.initialize_scene();
    this.initialize_actor_actions();
  }

  /**
   * Scene setup
   */
  initialize_scene(){
    this.ui_params = { 
      obj_height: 0.1,
      is_mirror_active: true
    };

    this.mesh = this.resource_manager.get_mesh("suzanne.obj");
    this.resource_manager.add_procedural_mesh("mesh_sphere_env_map", cg_mesh_make_uv_sphere(16));

    this.static_objects.push({
      translation: [0, 0, 0],
      scale: [80., 80., 80.],
      mesh_reference: 'mesh_sphere_env_map',
      material: MATERIALS.sunset_sky
    });

    this.dynamic_objects.push({
          translation: [0, this.ui_params.obj_height, 0],
          scale: [0.1, 0.1, 0.1],
          mesh_reference: 'suzanne.obj',
          material: MATERIALS.mirror,
      }
    );

    this.objects = this.static_objects.concat(this.dynamic_objects);
    this.actors["object"] = this.dynamic_objects[0];

    this.lights.push({
      position : [0.0 , -2.0, 2.5],
      color: [1.0, 1.0, 0.9]
    });

  }

  /**
   * Initialize the evolve function that describes the behaviour of each actor 
   */
  initialize_actor_actions(){
    this.phase = 0;  // local phase tracker

    this.actors["object"].evolve = (dt) => {

      const frequency = 0.25; // oscillations per second
      this.phase += dt * 2 * Math.PI * frequency;

      this.phase %= 2 * Math.PI;

      const grow_factor = 0.2;
      const scale_new = 1 + Math.cos(this.phase) * grow_factor;
      this.actors["object"].scale = [scale_new, scale_new, scale_new];
      this.actors["object"].translation = [0, this.ui_params.obj_height, 0];
    };

  }

  /**
   * Initialize custom scene-specific UI parameters to allow interactive control of selected scene elements.
   * This function is called in main() if the scene is active.
   */
  initialize_ui_params(){

    create_hotkey_action("Preset view", "1", () => {
      this.camera.set_preset_view({
        distance_factor : 0.2,
        angle_z : -1.5707963267948966,
        angle_y : 0,
        look_at : [0, 0, 0]
      })
    });

    const n_steps_slider = 100;
    const min_obj_height = 0;
    const max_obj_height = 3;
    create_slider("Suzanne's position ", [0, n_steps_slider], (i) => {
      this.ui_params.obj_height = min_obj_height + i * (max_obj_height - min_obj_height) / n_steps_slider;
    });

    create_button_with_hotkey("Mirror Effect", "M", () => {
      this.ui_params.is_mirror_active = !this.ui_params.is_mirror_active;
      
    
    });
    


  }

}
