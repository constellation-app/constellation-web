import { ViewProjectionProgram } from './ViewProjectionProgram';


export class ArrowProgram extends ViewProjectionProgram {

    static vertexShaderSource = `#version 300 es
     
        precision highp float;
        
        const float ARROW_WIDTH = 3.0;
        const float ARROW_LENGTH = 6.0;

        const vec2 CORNER_OFFSETS[3] = vec2[3] (
            vec2(0.0, 0.0),
            vec2(ARROW_WIDTH * 0.5, -ARROW_LENGTH),
            vec2(ARROW_WIDTH * -0.5, -ARROW_LENGTH)
        );

        const vec4 DONT_DRAW = vec4(10, 10, 10, 1);
        const uint ARROW_MASK = 0x1000000u;

        uniform mat4 view_matrix;
        uniform mat4 projection_matrix;
        uniform sampler2D node_position_sampler;
        uniform highp usampler2D link_position_sampler;
        
        flat out vec3 link_color;

        void main() {
         
            int id = gl_VertexID / 3;
            
            uvec4 link_position = texelFetch(link_position_sampler, ivec2(id & 0x3FF, id >> 10), 0);
            if ((link_position.w & ARROW_MASK) == 0u) {
                gl_Position = DONT_DRAW;

            } else {
                int source_id = int(link_position.x);
                int destination_id = int(link_position.y);
                float link_offset = float(link_position.z >> 16) / 256.0 - 128.0;
                float link_width = float(link_position.z & 0xFFFFu) / 256.0;
                link_color = vec3(
                    float((link_position.w >> 16) & 0xFFu) / 255.0,
                    float((link_position.w >> 8) & 0xFFu) / 255.0,
                    float(link_position.w & 0xFFu) / 255.0
                );

                vec4 source_position = texelFetch(node_position_sampler, ivec2(source_id & 0x3FF, source_id >> 10), 0);
                vec4 destination_position = texelFetch(node_position_sampler, ivec2(destination_id & 0x3FF, destination_id >> 10), 0);
                
                float destination_radius = destination_position.w;

                source_position.w = 1.0;
                destination_position.w = 1.0;

                source_position = view_matrix * source_position;
                destination_position = view_matrix * destination_position;

                vec3 long_axis = destination_position.xyz - source_position.xyz;
                vec3 long_direction = normalize(long_axis);

                destination_position.xyz -= long_direction * destination_radius;

                vec3 short_direction = cross(long_direction, vec3(0, 0, 1));

                vec2 corner_offset = CORNER_OFFSETS[gl_VertexID - id * 3];
                
                vec3 position = destination_position.xyz + (short_direction * corner_offset.x + long_direction * corner_offset.y) * link_width;
                
                gl_Position = projection_matrix * vec4(position, 1);
            }
        }
    `;

    static fragmentShaderSource = `#version 300 es
         
        precision highp float;
         
        flat in vec3 link_color;
        
        out vec4 out_color;
         
        void main() {
          out_color = vec4(link_color, 1);
        }
    `;

    readonly nodePositionAttributeLocation: WebGLUniformLocation;
    readonly linkPositionAttributeLocation: WebGLUniformLocation;

    constructor(gl: WebGL2RenderingContext) {
        super(gl, ArrowProgram.vertexShaderSource, ArrowProgram.fragmentShaderSource);

        this.nodePositionAttributeLocation = gl.getUniformLocation(this.program, "node_position_sampler")!;
        this.linkPositionAttributeLocation = gl.getUniformLocation(this.program, "link_position_sampler")!;
    }

    render = (linkCount: number) => {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, linkCount * 3);
    }
}