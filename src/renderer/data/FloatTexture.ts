export class FloatTexture {
    readonly gl: WebGL2RenderingContext;
    readonly textureUnit: number;
    readonly elements: number;
    readonly width: number;
    readonly height: number;
    readonly texture: WebGLTexture;
    readonly internalFormat: GLenum;
    readonly srcFormat: GLenum;

    constructor(gl: WebGL2RenderingContext, textureUnit: number, elements: number, width: number, height: number) {
        this.gl = gl;
        this.textureUnit = textureUnit;
        this.elements = elements;
        this.width = width;
        this.height = height;
        this.texture = gl.createTexture()!;
        this.internalFormat = FloatTexture.calculateInternalFormat(gl, elements);
        this.srcFormat = FloatTexture.calculateSrcFormat(gl, elements);

        gl.activeTexture(this.gl.TEXTURE0 + this.textureUnit);
        gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }

    allocate = (): void => {
        this.gl.activeTexture(this.gl.TEXTURE0 + this.textureUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texStorage2D(this.gl.TEXTURE_2D, 1, this.internalFormat, this.width, this.height);
        
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    }

    modify = (x: number, y: number, width: number, height: number, data: number[]): void => {
        this.gl.activeTexture(this.gl.TEXTURE0 + this.textureUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        
        this.gl.texSubImage2D(this.gl.TEXTURE_2D, 
            0, 
            x, y, 
            width, height, 
            this.srcFormat, this.gl.FLOAT, new Float32Array(data));
    }

    replace = (data: Float32Array): void => {
        const rows = Math.floor(data.length / this.elements / this.width);
        const excess = data.length / this.elements - rows * this.width;
        
        this.gl.activeTexture(this.gl.TEXTURE0 + this.textureUnit);
        
        if (rows > 0) {
            this.gl.texSubImage2D(this.gl.TEXTURE_2D, 
                0, 
                0, 0, 
                this.width, rows, 
                this.srcFormat, this.gl.FLOAT, data.subarray(0, rows * this.elements * this.width));
        }

        if (excess > 0) {
            this.gl.texSubImage2D(this.gl.TEXTURE_2D, 
                0, 
                0, rows, 
                excess, 1, 
                this.srcFormat, this.gl.FLOAT, data.subarray(rows * this.elements * this.width));
        }
    }

    update = (data: Float32Array, start: number, end: number): void => {
        let count = end - start;

        let startY = Math.floor(start / this.width);
        let startX = start - startY * this.width;
        let startLength = startX === 0 ? 0 : (this.width - startX);

        this.gl.activeTexture(this.gl.TEXTURE0 + this.textureUnit);

        if (count <= startLength) {
            this.gl.texSubImage2D(this.gl.TEXTURE_2D, 
                0, 
                startX, startY, 
                count, 1, 
                this.srcFormat, this.gl.FLOAT, data.subarray(start * this.elements, end * this.elements));
        } else {
            
            if (startLength > 0) {
                this.gl.texSubImage2D(this.gl.TEXTURE_2D, 
                    0, 
                    startX, startY, 
                    startLength, 1, 
                    this.srcFormat, this.gl.FLOAT, data.subarray(start * this.elements, (start + startLength) * this.elements));
                startY += 1;
            }
            
            let endX = end % this.width;
            let endY = Math.floor(end / this.width);
            if (endX > 0) {
                this.gl.texSubImage2D(this.gl.TEXTURE_2D, 
                    0, 
                    0, endY, 
                    endX, 1, 
                    this.srcFormat, this.gl.FLOAT, data.subarray((end - endX) * this.elements));
            }

            if (endY > startY) {
                this.gl.texSubImage2D(this.gl.TEXTURE_2D, 
                    0, 
                    0, startY, 
                    this.width, endY - startY, 
                    this.srcFormat, this.gl.FLOAT, data.subarray((start + startLength) * this.elements, (end - endX) * this.elements));
            }
        }
    }

    use = (location: WebGLUniformLocation): void => {
        this.gl.uniform1i(location, this.textureUnit);
    }

    private static calculateInternalFormat = (gl: WebGL2RenderingContext, elements: number): GLenum => {
        switch (elements) {
            case 1: return gl.R32F; 
            case 2: return gl.RG32F; 
            case 3: return gl.RGB32F;
            case 4: return gl.RGBA32F; 
            default: return gl.RGBA32F; 
        }
    }

    private static calculateSrcFormat = (gl: WebGL2RenderingContext, elements: number): GLenum => {
        switch (elements) {
            case 1: return gl.ALPHA; 
            case 2: return gl.RG; 
            case 3: return gl.RGB;
            case 4: return gl.RGBA; 
            default: return gl.RGBA; 
        }
    }
}