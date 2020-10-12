import { ViewProjectionProgram } from './ViewProjectionProgram';

export class GlyphProgram extends ViewProjectionProgram {

    static vertexShaderSource = `#version 300 es
     
        precision highp float;
        
        const vec2 CORNER_OFFSETS[6] = vec2[6](
          vec2(0, 0),
          vec2(0, 1),
          vec2(1, 1),
          vec2(0, 0),
          vec2(1, 1),
          vec2(1, 0)
        );

        const float GLYPH_FAR_SIZE = 0.002;
        const float GLYPH_FAR_MULTIPLIER = 200.0;

        uniform mat4 view_matrix;
        uniform mat4 projection_matrix;
        uniform sampler2D node_position_sampler;
        uniform sampler2D glyph_position_sampler;
        uniform sampler2D glyph_font_position_sampler;

        uniform int glyph_rows_per_page;
        uniform float glyph_row_height;
        uniform float scale;

        out vec2 texture_coord;
        flat out int glyph_page;
        flat out float glyph_alpha;

        void main() {
         
          int id = gl_VertexID / 6;
          int corner = gl_VertexID - id * 6;

          vec4 glyph_position = texelFetch(glyph_position_sampler, ivec2(id & 0x3FF, id >> 10), 0);

          int node_id = int(glyph_position.y);
          vec4 position = texelFetch(node_position_sampler, ivec2(node_id & 0x3FF, node_id >> 10), 0);
          
          float node_radius = position.w;
          position.w = 1.0;
          
          position = view_matrix * position;

          float apparent_node_radius = node_radius / -position.z;
          
          if (apparent_node_radius <= GLYPH_FAR_SIZE) {
            gl_Position = vec4(10, 10, 10, 1);

          } else {
            int glyph_id = int(glyph_position.x);
            vec4 glyph_font_position = texelFetch(glyph_font_position_sampler, ivec2(glyph_id & 0x3FF, glyph_id >> 10), 0);
            int glyph_row = int(glyph_font_position.x);

            glyph_alpha = clamp((apparent_node_radius - GLYPH_FAR_SIZE) * GLYPH_FAR_MULTIPLIER, 0.0, 1.0);

            vec2 corner_offset = CORNER_OFFSETS[corner];
          
            position.x += (glyph_font_position.z * corner_offset.x + glyph_position.z) * scale / glyph_row_height;
            if (glyph_position.w < 0.0) {
              position.y -= -node_radius + (corner_offset.y + glyph_position.w) * scale;
            } else {
              position.y -= node_radius + (corner_offset.y + glyph_position.w) * scale;
            }
            position.z += 0.1;
            
            glyph_page = glyph_row / glyph_rows_per_page;
            float glyph_row_on_page = float(glyph_row - glyph_page * glyph_rows_per_page);

            gl_Position = projection_matrix * position;
            
            texture_coord = vec2(
              glyph_font_position.y + corner_offset.x * glyph_font_position.z, 
              (glyph_row_on_page + corner_offset.y) * glyph_row_height
            );
          }
        }
    `;

    static fragmentShaderSource = `#version 300 es
         
        precision highp float;
         
        in vec2 texture_coord;
        flat in int glyph_page;
        flat in float glyph_alpha;

        uniform highp sampler2DArray glyph_texture_sampler;
        uniform vec3 glyph_color;
        
        out vec4 out_color;
         
        void main() {
          float alpha = texture(glyph_texture_sampler, vec3(texture_coord, glyph_page)).r * glyph_alpha;
          if (alpha < 0.5) {
            discard;
          } else {
            out_color = vec4(glyph_color, alpha);
          }
        }
    `;

    readonly nodePositionAttributeLocation: WebGLUniformLocation;
    readonly glyphPositionAttributeLocation: WebGLUniformLocation;
    readonly glyphFontPositionAttributeLocation: WebGLUniformLocation;
    readonly glyphTextureAttributeLocation: WebGLUniformLocation;
    
    readonly glyphColorAttributeLocation: WebGLUniformLocation;
    readonly glyphRowsPerPageAttributeLocation: WebGLUniformLocation;
    readonly glyphRowHeightAttributeLocation: WebGLUniformLocation;
    readonly scaleAttributeLocation: WebGLUniformLocation;

    constructor(gl: WebGL2RenderingContext) {
        super(gl, GlyphProgram.vertexShaderSource, GlyphProgram.fragmentShaderSource);

        this.nodePositionAttributeLocation = gl.getUniformLocation(this.program, "node_position_sampler")!;
        this.glyphPositionAttributeLocation = gl.getUniformLocation(this.program, "glyph_position_sampler")!;
        this.glyphFontPositionAttributeLocation = gl.getUniformLocation(this.program, "glyph_font_position_sampler")!;
        this.glyphTextureAttributeLocation = gl.getUniformLocation(this.program, "glyph_texture_sampler")!;
        
        this.glyphColorAttributeLocation = gl.getUniformLocation(this.program, "glyph_color")!;
        this.glyphRowsPerPageAttributeLocation = gl.getUniformLocation(this.program, "glyph_rows_per_page")!;
        this.glyphRowHeightAttributeLocation = gl.getUniformLocation(this.program, "glyph_row_height")!;
        this.scaleAttributeLocation = gl.getUniformLocation(this.program, "scale")!;
    }

    setRowHeight = (rowHeight: number): void => {
      this.gl.uniform1f(this.glyphRowHeightAttributeLocation, rowHeight);
      this.gl.uniform1i(this.glyphRowsPerPageAttributeLocation, Math.floor(1.0 / rowHeight));
    }

    setScale = (scale: number): void => {
      this.gl.uniform1f(this.scaleAttributeLocation, scale);
    }

    setGlyphColor = (color: Float32Array): void => {
      this.gl.uniform3f(this.glyphColorAttributeLocation, color[0], color[1], color[2]);
    }

    render = (glyphCount: number) => {
      this.gl.drawArrays(this.gl.TRIANGLES, 0, glyphCount * 6);
    }
}