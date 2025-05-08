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

export class BottleScene extends Scene {

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

    this.mesh = this.resource_manager.get_mesh("bottle.obj");
    this.resource_manager.add_procedural_mesh("mesh_sphere_env_map", cg_mesh_make_uv_sphere(16));
    this.bottle_visible = true;

    this.render_mesh(this.static_objects, 'mesh_sphere_env_map', MATERIALS.sunset_sky, [0, 0, 0], [80., 80., 80.]);
    this.render_mesh(this.static_objects, 'bottle.obj', MATERIALS.glass_material, [0, 0, 0], [1, 1, 1]);
    this.render_mesh(this.static_objects, 'boat.obj', MATERIALS.wood, [0, 0, 0.05], [1, 1, 1]);
    this.render_mesh(this.static_objects, 'water.obj', MATERIALS.water, [0, 0, 0], [1, 1, 1]);




    this.objects = this.static_objects.concat(this.dynamic_objects);

    this.lights.push({
      position : [0.0 , -2.0, 2.5],
      color: [1.0, 1.0, 0.9]
    });

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
        distance_factor : 0.1,
        angle_z : -1.5707963267948966,
        angle_y : 0,
        look_at : [0, 0, 0]
      })
    });

    create_hotkey_action("Toggle bottle", "B", () => {
      if (this.bottle_visible) {
        this.static_objects = this.static_objects.filter(obj => obj.mesh_reference !== 'bottle.obj');
      } else {
        /*this.static_objects.push({
          translation: [0, 0, 0],
          scale: [1, 1, 1],
          mesh_reference: 'bottle.obj',
          material: MATERIALS.mirror,
        });*/
        this.render_mesh(this.static_objects, 'bottle.obj', MATERIALS.glass_material, [0, 0, 0], [1, 1, 1]);
      }
    
      this.bottle_visible = !this.bottle_visible;
      this.objects = this.static_objects.concat(this.dynamic_objects);
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
