
import {vec2, vec3, vec4, mat2, mat3, mat4} from "../../lib/gl-matrix_3.3.0/esm/index.js"
import { noise_functions } from "../render/shader_renderers/noise_sr.js";


/**
 * Generate procedurally a terrain mesh using some procedural noise
 * @param {*} height_map a buffer texture that contains heigth values 
 * @param {*} WATER_LEVEL 
 * @returns 
 */
export function terrain_build_mesh(height_map, WATER_LEVEL) {

	const grid_width = height_map.width;
	const grid_height = height_map.height;

	const vertices = [];
	const normals = [];
	const faces = [];

	// Map a 2D grid index (x, y) into a 1D index into the output vertex array.
	function xy_to_v_index(x, y) {
		return x + y*grid_width;
	}

	for(let gy = 0; gy < grid_height; gy++) {
		for(let gx = 0; gx < grid_width; gx++) {
			const idx = xy_to_v_index(gx, gy);
			let elevation = height_map.get(gx, gy) - 0.5; // we put the value between 0...1 so that it could be stored in a non-float texture on older browsers/GLES3, the -0.5 brings it back to -0.5 ... 0.5

			// normal as finite difference of the height map
			// dz/dx = (h(x+dx) - h(x-dx)) / (2 dx)
			normals[idx] = vec3.normalize([0, 0, 0], [
				-(height_map.get(gx+1, gy) - height_map.get(gx-1, gy)) / (2. / grid_width),
				-(height_map.get(gx, gy+1) - height_map.get(gx, gy-1)) / (2. / grid_height),
				1.,
			]);

			/*
			Generate the displaced terrain vertex corresponding to integer grid location (gx, gy). 
			The height (Z coordinate) of this vertex is determined by height_map.
			If the point falls below WATER_LEVEL:
			* it should be clamped back to WATER_LEVEL.
			* the normal should be [0, 0, 1]
	
			The XY coordinates are calculated so that the full grid covers the square [-0.5, 0.5]^2 in the XY plane.
			*/

			const vx = 1.0/grid_width * gx -0.5;
			const vy = 1.0/grid_height * gy -0.5;
			let vz = 0.;
			if (elevation <= WATER_LEVEL) {
				vz = WATER_LEVEL;
				normals[idx] = [0,0,1];
			}
			else{
				vz = elevation;
			}

			vertices[idx] = [vx, vy, vz];
		}
	}

	for(let gy = 0; gy < grid_height - 1; gy++) {
		for(let gx = 0; gx < grid_width - 1; gx++) {
			/* 
			Triangulate the grid cell whose lower lefthand corner is grid index (gx, gy).
			You will need to create two triangles to fill each square.
			*/
			const va = xy_to_v_index(gx, gy);
			const vb = xy_to_v_index(gx+1, gy);
			const vc = xy_to_v_index(gx, gy+1);
			const vd = xy_to_v_index(gx+1, gy+1);

			faces.push([va, vb, vc]);
			faces.push([vb, vd, vc]);
			// faces.push([v1, v2, v3]) // adds a triangle on vertex indices v1, v2, v3
		}
	}

	return {
		vertex_positions: vertices,
		vertex_normals: normals,
		faces: faces,
        vertex_tex_coords: []
	}
}

export function generate_floating_sand_island(height_map) {
	const grid_width = height_map.width;
	const grid_height = height_map.height;

	const vertices = [];
	const normals = [];
	const faces = [];
	const tex_coords = [];

	function xy_to_v_index(x, y) {
		return x + y * grid_width;
	}

	// === Top Surface ===
	for (let gy = 0; gy < grid_height; gy++) {
		for (let gx = 0; gx < grid_width; gx++) {
			const idx = xy_to_v_index(gx, gy);
			const vx = gx / (grid_width - 1) - 0.5;
			const vy = gy / (grid_height - 1) - 0.5;

			const dx = gx - grid_width / 2;
			const dy = gy - grid_height / 2;
			const dist = Math.sqrt(dx * dx + dy * dy) / (0.5 * Math.min(grid_width, grid_height));

			let elevation = (height_map.get(gx, gy) - 0.5) * 0.2;

			// Flat horizontal stripe along Y axis
			if (Math.abs(vy) < 0.098) {
				elevation = 0.0;
			} else {
				elevation *= Math.max(0, 1.0 - dist * dist);
			}
			const vz = elevation;

			vertices[idx] = [vx, vy, vz];

			const dxh = (height_map.get(gx + 1, gy) - height_map.get(gx - 1, gy)) * 5.5;
			const dyh = (height_map.get(gx, gy + 1) - height_map.get(gx, gy - 1)) * 5.5;
			const normal = vec3.normalize([], [-dxh, -dyh, 1.0]);
			normals[idx] = normal;

			tex_coords[idx] = [gx / (grid_width - 1), gy / (grid_height - 1)];
		}
	}

	for (let gy = 0; gy < grid_height - 1; gy++) {
		for (let gx = 0; gx < grid_width - 1; gx++) {
			const a = xy_to_v_index(gx, gy);
			const b = xy_to_v_index(gx + 1, gy);
			const c = xy_to_v_index(gx, gy + 1);
			const d = xy_to_v_index(gx + 1, gy + 1);

			faces.push([a, b, c]);
			faces.push([b, d, c]);
		}
	}

	const top_vertex_count = vertices.length;

	// === Bottom Vertices ===
	for (let i = 0; i < top_vertex_count; i++) {
		const [x, y, z] = vertices[i];
		const bottom_z = -0.009; // make it thin and floating
		vertices.push([x, y, bottom_z]);
		normals.push([0, 0, -1]);
		tex_coords.push(tex_coords[i]);
	}

	// === Bottom Faces ===
	const top_faces_copy = faces.slice();
	for (let [a, b, c] of top_faces_copy) {
		faces.push([
			c + top_vertex_count,
			b + top_vertex_count,
			a + top_vertex_count
		]);
	}

	// === Side Walls ===
	function add_side(a, b) {
		const a_bottom = a + top_vertex_count;
		const b_bottom = b + top_vertex_count;

		faces.push([a, b, b_bottom]);
		faces.push([a, b_bottom, a_bottom]);
	}

	const edge_indices = [];

	// Edges on the outer border
	for (let x = 0; x < grid_width - 1; x++) {
		edge_indices.push([xy_to_v_index(x, 0), xy_to_v_index(x + 1, 0)]);
		edge_indices.push([xy_to_v_index(x, grid_height - 1), xy_to_v_index(x + 1, grid_height - 1)]);
	}
	for (let y = 0; y < grid_height - 1; y++) {
		edge_indices.push([xy_to_v_index(0, y), xy_to_v_index(0, y + 1)]);
		edge_indices.push([xy_to_v_index(grid_width - 1, y), xy_to_v_index(grid_width - 1, y + 1)]);
	}

	for (let [a, b] of edge_indices) {
		add_side(a, b);
	}

	console.log("Mesh stats:", {
		vertices: vertices.length,
		faces: faces.length
	});

	return {
		vertex_positions: vertices,
		vertex_normals: normals,
		faces: faces,
		vertex_tex_coords: tex_coords
	};
}
