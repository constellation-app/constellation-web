import { ViewProjectionProgram } from './ViewProjectionProgram';


export class NodeProgram extends ViewProjectionProgram {

    static vertexShaderSource = `#version 300 es
     
        precision highp float;
        
        const vec2 CORNER_OFFSETS[6] = vec2[6](
          vec2(-0.5, -0.5),
          vec2(-0.5, 0.5),
          vec2(0.5, 0.5),
          vec2(-0.5, -0.5),
          vec2(0.5, 0.5),
          vec2(0.5, -0.5)
        );

        const float ICON_FAR_SIZE = 0.002;
        const float ICON_FAR_MULTIPLIER = 200.0;

        const uint SELECTED_MASK = 0x1000000u;

        uniform mat4 view_matrix;
        uniform mat4 projection_matrix;
        uniform sampler2D node_position_sampler;
        uniform highp usampler2D node_visuals_sampler;

        out vec2 texture_coord;
        flat out uvec2 icons;
        flat out vec3 background_color;
        flat out float icon_alpha;
        flat out int selected;

        void main() {
         
          int id = gl_VertexID / 6;
          int corner = gl_VertexID - id * 6;

          vec2 corner_offset = CORNER_OFFSETS[corner];
          vec4 node_position = texelFetch(node_position_sampler, ivec2(id & 0x3FF, id >> 10), 0);
          uvec4 node_visuals = texelFetch(node_visuals_sampler, ivec2(id & 0x3FF, id >> 10), 0);

          icons = uvec2(
            node_visuals.x >> 16,
            node_visuals.x & 0xFFFFu
          );

          background_color = vec3(
                float((node_visuals.y >> 16) & 0xFFu) / 255.0,
                float((node_visuals.y >> 8) & 0xFFu) / 255.0,
                float(node_visuals.y & 0xFFu) / 255.0
          );

          float radius = node_position.w;
          node_position.w = 1.0;
          
          node_position = view_matrix * node_position;
          
          if ((node_visuals.y & SELECTED_MASK) != 0u) {
            node_position.xy += corner_offset * radius * 4.0;
            gl_Position = projection_matrix * node_position;
            texture_coord = vec2(corner_offset.x * 2.0 + 0.5, 0.5 - corner_offset.y * 2.0);
            selected = 1;
          } else {
            node_position.xy += corner_offset * radius * 2.0;
            gl_Position = projection_matrix * node_position;
            texture_coord = vec2(corner_offset.x + 0.5, 0.5 - corner_offset.y);
            selected = 0;
          }

          icon_alpha = clamp((radius / -node_position.z - ICON_FAR_SIZE) * ICON_FAR_MULTIPLIER, 0.0, 1.0);
        }
    `;

    static fragmentShaderSource = `#version 300 es
         
        precision highp float;
         
        in vec2 texture_coord;
        flat in uvec2 icons;
        flat in vec3 background_color;
        flat in float icon_alpha;
        flat in int selected;

        uniform highp sampler2DArray icon_texture_sampler;

        out vec4 out_color;
         
        void main() {
          
          // If the node is selected
          if (selected != 0) {
            out_color = texture(icon_texture_sampler, vec3(texture_coord, icons.x));
            out_color.rgb *= background_color;

            float dx = (texture_coord.x - 0.5);
            float dy = (texture_coord.y - 0.5);
            float selection_alpha = dx * dx + dy * dy;
            
            if (selection_alpha <= 1.0) {
              selection_alpha *= selection_alpha;
              selection_alpha = 0.5 + selection_alpha * 0.5;
              out_color.r = mix(selection_alpha, out_color.r, out_color.a);
              out_color.a = 1.0 - (1.0 - out_color.a) * (1.0 - selection_alpha);
            }
          
          // If the node is not selected
          } else {
            out_color = texture(icon_texture_sampler, vec3(texture_coord, icons.x));
            out_color.rgb *= background_color;
          }

          // Mix in the foreground icon
          if (icon_alpha > 0.01) {
            vec4 foregroundColor = texture(icon_texture_sampler, vec3(texture_coord, icons.y));
            foregroundColor.a *= icon_alpha;
            out_color = vec4(mix(out_color.rgb, foregroundColor.rgb, foregroundColor.a), 1.0 - (1.0 - out_color.a) * (1.0 - foregroundColor.a));
          }

          if (out_color.a < 0.5) {
            discard;
          }
        }
    `;

    readonly nodePositionAttributeLocation: WebGLUniformLocation;
    readonly nodeVisualsAttributeLocation: WebGLUniformLocation;
    readonly iconTextureAttributeLocation: WebGLUniformLocation;

    constructor(gl: WebGL2RenderingContext) {
        super(gl, NodeProgram.vertexShaderSource, NodeProgram.fragmentShaderSource);

        this.nodePositionAttributeLocation = gl.getUniformLocation(this.program, "node_position_sampler")!;
        this.nodeVisualsAttributeLocation = gl.getUniformLocation(this.program, "node_visuals_sampler")!;
        this.iconTextureAttributeLocation = gl.getUniformLocation(this.program, "icon_texture_sampler")!;
    }

    render = (nodeCount: number) => {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, nodeCount * 6);
    }
}