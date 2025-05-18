import { ShaderRenderer } from "./shader_renderer.js";

export class NormalShaderRenderer extends ShaderRenderer {
  constructor(regl, resource_manager) {
    super(
      regl,
      resource_manager,
      `basic.vert.glsl`,
      `normal.frag.glsl`
    );
  }

  render(scene_state) {
    const scene = scene_state.scene;
    const inputs = [];

    for (const obj of scene.objects) {
      const mesh = this.resource_manager.get_mesh(obj.mesh_reference);

      if (this.exclude_object(obj)) continue;

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
      });
    }

    this.pipeline(inputs);
  }
  
  exclude_object(obj) {
    return obj.material.properties.includes("environment");
  }

  uniforms(regl) {
    return {
      mat_model_view_projection: regl.prop("mat_model_view_projection"),
      mat_normals_model_view: regl.prop("mat_normals_model_view"),
      mat_model_view: regl.prop("mat_model_view"),
    };
  }

  depth() {
    return {
      enable: true,
      mask: true,
      func: "<=",
    };
  }

}
