export class Program {

    static createShader = (gl: WebGL2RenderingContext, type: GLenum, source: string) : WebGLShader | null => {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    static createProgram = (gl: WebGL2RenderingContext, vertexShader: any, fragmentShader: any) : WebGLProgram | null => {
        var program = gl.createProgram()!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
          return program;
        }
       
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    static createProgramFromSource(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram | null {
        let vertexShader = Program.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        let fragmentShader = Program.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        return Program.createProgram(gl, vertexShader, fragmentShader);
    }

    readonly gl: WebGL2RenderingContext;
    readonly program: WebGLProgram;

    constructor(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
        this.gl = gl;
        this.program = Program.createProgramFromSource(gl, vertexShaderSource, fragmentShaderSource)!;
    }

    use = () => {
        this.gl.useProgram(this.program);
    }
}