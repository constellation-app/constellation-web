import { Program } from './Program';

export class ViewProjectionProgram extends Program {

    readonly viewMatrixAttributeLocation: WebGLUniformLocation;
    readonly projectionMatrixAttributeLocation: WebGLUniformLocation;

    constructor(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
        super(gl, vertexShaderSource, fragmentShaderSource);
        
        this.viewMatrixAttributeLocation = gl.getUniformLocation(this.program, "view_matrix")!;
        this.projectionMatrixAttributeLocation = gl.getUniformLocation(this.program, "projection_matrix")!;
    }
    
    setViewMatrix = (matrix: Float32Array) => {
        this.gl.uniformMatrix4fv(this.viewMatrixAttributeLocation, false, matrix);
    }

    setProjectionMatrix = (matrix: Float32Array) => {
        this.gl.uniformMatrix4fv(this.projectionMatrixAttributeLocation, false, matrix);
    }
}