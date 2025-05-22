const default_texture = null; 
const default_base_color = [1.0, 0.0, 1.0];  // magenta, used when no texture is provided
const default_shininess = 8.0;
const default_specular = [0.2, 0.2, 0.2];
const default_opacity = 1.0;
const default_ior = 1.5; // index of refraction for glass


/*---------------------------------------------------------------
	Materials
---------------------------------------------------------------*/
/**
 * Materials are defined by parameters that describe how 
 * different objects interact with light.
 * 
 * The `properties` array can be used to indicate by 
 * which shaders will process this material. 
 * ShaderRenderer classes have an `exclude()` function whose
 * behavior can be customized to adapt to different material properties.
 */

class Material {

    constructor(){
        this.texture = default_texture;
        this.color = default_base_color;
        this.shininess = default_shininess;
        this.specular = default_specular;
        this.opacity = default_opacity;
        this.ior = default_ior;
        this.isReflective = false;
        this.normal_map = null;
        this.properties = [];
    }
}

class BackgroundMaterial extends Material {

    constructor({
        texture = default_texture,
        shininess = 0.0,
        specular = [0.0, 0.0, 0.0],
    }){
        super()
        this.texture = texture;
        this.shininess = shininess;
        this.specular = specular;
        this.properties.push("environment");
        this.properties.push("no_blinn_phong");
    }
}

class DiffuseMaterial extends Material {

    constructor({
        texture = null, 
        color = default_base_color, 
        shininess = 4.0,
        specular = [0.05, 0.05, 0.05],
    }){
        super()
        this.texture = texture;
        this.color = color;
        this.shininess = shininess;
        this.texture = texture;
        this.specular = specular;
    }
}

class ReflectiveMaterial extends Material {
    constructor({
        shininess = 10.0,
        specular = [0.9, 0.9, 0.9],
        color = [0.8, 0.8, 0.8],
    } = {}){
        super()
        this.shininess = shininess;
        this.specular = specular;
        this.color = color;
        this.properties.push("reflective");
    }
}

class TransparentMaterial extends Material {
    constructor({
        opacity = 0.2,
        shininess = 40,
        specular = [0.8, 0.9, 1.0],
        texture = null,
        color = [0.6, 0.8, 1.0],
        isReflective=true,
     
    } = {}) {
        super();
        this.color = color;
        this.opacity = opacity;
        this.shininess = shininess;
        this.texture = texture;
        this.specular = specular;
        this.isReflective = isReflective;

        this.properties.push("transparent");
        //this.properties.push("no_blinn_phong");

    }
}

class TerrainMaterial extends Material {
    constructor({
        water_color = [0.29, 0.51, 0.62],
        water_shininess = 30.,
        grass_color = [0.33, 0.43, 0.18],
        grass_shininess = 5.,
        peak_color = [0.9, 0.9, 0.9],
        peak_shininess = 10.
    }){
        super()
        this.water_color = water_color;
        this.water_shininess = water_shininess;
        this.grass_color = grass_color 
        this.grass_shininess = grass_shininess;
        this.peak_color = peak_color;
        this.peak_shininess = peak_shininess;

        this.properties.push("terrain");
    }
}

class BeachTerrainMaterial extends Material {
    constructor({
        color = [0.9, 0.8, 0.6], 
        shininess =  8.0,
        specular = [0.05, 0.05, 0.05],
    } = {}) {
        super();
        this.color = color;
        this.shininess = shininess;
        this.specular = specular;
    }
}


class WaterMaterial extends Material {
    constructor({
        color = [0.0, 0.4, 0.45], //[0.635, 0.91, 0.91], 
        opacity = 0.3,
        shininess = 60.0, 
        specular = [0.5, 0.6, 0.7],
        isReflective = true,
        texture = 'water.jpg',
        normal_map = 'water-normal.jpg',
    } = {}) {
        super();
        this.color = color;
        this.opacity = opacity;
        this.shininess = shininess;
        this.specular = specular;
        this.isReflective = isReflective;
        this.texture = texture;
        this.normal_map = normal_map;

        this.properties.push("transparent");
    }
}


/*---------------------------------------------------------------
	Material Instantiation
---------------------------------------------------------------*/
/**
 * Here materials are defined to later be assigned to objects.
 * Choose the material class, and specify its customizable parameters.
 */
export const sunset_sky = new BackgroundMaterial({
    texture: 'kloppenheim_07_puresky_blur.jpg'
});

export const sunset_sky_2 = new BackgroundMaterial({
    texture: 'belfast_sunset_puresky.jpg',
    
});

export const sky = new BackgroundMaterial({
    texture: 'aristea_wreck_puresky.jpg',
});

export const gray = new DiffuseMaterial({
    color: [0.4, 0.4, 0.4],
    shininess: 0.5
});

export const gold = new DiffuseMaterial({
    texture: 'tex_gold',
    shininess: 14.0
});

export const pine = new DiffuseMaterial({
    texture: 'pine.png',
    shininess: 0.5
});

export const terrain = new TerrainMaterial({
    water_color: [0.29, 0.51, 0.62],
    grass_color: [0.33, 0.43, 0.18],
    peak_color: [0.8, 0.5, 0.4]
});

export const mirror = new ReflectiveMaterial();

export const glass_material = new TransparentMaterial({
    color: [0.6, 0.8, 1.0], 
    opacity: 0.2,
    ior: 1.4,
});

export const boat_material = new DiffuseMaterial({
    texture: 'wood.png',
    shininess: 14.0,
    color: [0.6, 0.4, 0.2]
});

export const water = new WaterMaterial({});

export const sand =  new BeachTerrainMaterial();


