import { ViewProjectionProgram } from './ViewProjectionProgram';


export class LinkProgram extends ViewProjectionProgram {

    static vertexShaderSource = `#version 300 es
     
        precision highp float;
        
        const float ARROW_WIDTH = 3.0;
        const float ARROW_LENGTH = 6.0;

        const vec2 CORNER_OFFSETS[6] = vec2[6](
            vec2(-0.5, 0.0),
            vec2(-0.5, 1.0),
            vec2(0.5, 0.0),
            vec2(-0.5, 1.0),
            vec2(0.5, 1.0),
            vec2(0.5, 0.0)
        );

        uniform mat4 view_matrix;
        uniform mat4 projection_matrix;
        uniform sampler2D node_position_sampler;
        uniform highp usampler2D link_position_sampler;
        
        flat out vec3 link_color;

        void main() {
         
            int id = gl_VertexID / 6;
            
            uvec4 link_position = texelFetch(link_position_sampler, ivec2(id & 0x3FF, id >> 10), 0);
            int source_id = int(link_position.x);
            int destination_id = int(link_position.y);
            float link_offset = float(link_position.z >> 16) / 256.0 - 128.0;
            float link_width = float(link_position.z & 0xFFFFu) / 256.0;
            link_color = vec3(
                float((link_position.w >> 16) & 0xFFu) / 255.0,
                float((link_position.w >> 8) & 0xFFu) / 255.0,
                float(link_position.w & 0xFFu) / 255.0
            );
            float arrow_shortening = ((link_position.w & 0x1000000u) == 0u) ? 0.0 : (link_width * ARROW_LENGTH);

            vec4 source_position = texelFetch(node_position_sampler, ivec2(source_id & 0x3FF, source_id >> 10), 0);
            vec4 destination_position = texelFetch(node_position_sampler, ivec2(destination_id & 0x3FF, destination_id >> 10), 0);
            
            float source_radius = source_position.w;
            float destination_radius = destination_position.w;

            source_position.w = 1.0;
            destination_position.w = 1.0;

            source_position = view_matrix * source_position;
            destination_position = view_matrix * destination_position;

            vec3 long_axis = destination_position.xyz - source_position.xyz;
            vec3 long_direction = normalize(long_axis);

            source_position.xyz += long_direction * source_radius;
            long_axis.xyz -= long_direction * (source_radius + destination_radius + arrow_shortening);

            vec3 short_direction = cross(long_direction, vec3(0, 0, 1));

            vec2 corner_offset = CORNER_OFFSETS[gl_VertexID - id * 6];

            vec3 position = source_position.xyz + long_axis * corner_offset.y + (link_offset + (corner_offset.x * link_width)) * short_direction;
            
            gl_Position = projection_matrix * vec4(position, 1);
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
        super(gl, LinkProgram.vertexShaderSource, LinkProgram.fragmentShaderSource);

        this.nodePositionAttributeLocation = gl.getUniformLocation(this.program, "node_position_sampler")!;
        this.linkPositionAttributeLocation = gl.getUniformLocation(this.program, "link_position_sampler")!;
    }

    render = (linkCount: number) => {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, linkCount * 6);
    }
}