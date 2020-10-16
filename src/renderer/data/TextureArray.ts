import { GraphRenderer } from "../GraphRenderer";

export class TextureArray {
    readonly gl: WebGL2RenderingContext;
    readonly textureUnit: number;
    readonly channels: number;
    readonly width: number;
    readonly height: number;
    readonly layers: number;
    readonly texture: WebGLTexture;

    constructor(gl: WebGL2RenderingContext, textureUnit: number, channels: number, width: number, height: number, layers: number) {
        this.gl = gl;
        this.textureUnit = textureUnit;
        this.channels = channels;
        this.width = width;
        this.height = height;
        this.layers = layers;
        this.texture = gl.createTexture()!;

        this.gl.activeTexture(gl.TEXTURE0 + this.textureUnit);
        this.gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture);
    }

    allocate = (): void => {
        this.gl.texStorage3D(this.gl.TEXTURE_2D_ARRAY, 1, this.internalFormat(), this.width, this.height, this.layers);

        this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

        this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    }

    setLayer = (image: HTMLImageElement, layer: number): void => {
        this.gl.activeTexture(this.gl.TEXTURE0 + this.textureUnit);
        this.gl.texSubImage3D(this.gl.TEXTURE_2D_ARRAY, 
            0, 
            0, 0, layer, 
            this.width, this.height, 1, 
            this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
    }

    setLayerFromURL = (url: string, layer: number, graphRenderer: GraphRenderer | null = null): void => {
        var image = new Image();
        image.src = url;
        image.onload = () => {
          this.setLayer(image, layer);
          if (graphRenderer) {
              graphRenderer.requireUpdate();
          }
        };
    }

    setLayerFromCanvas = (canvas: HTMLCanvasElement, layer: number): void => {
        this.gl.activeTexture(this.gl.TEXTURE0 + this.textureUnit);
        this.gl.texSubImage3D(this.gl.TEXTURE_2D_ARRAY, 
            0, 
            0, 0, layer, 
            this.width, this.height, 1, 
            this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
    }

    setLayerFromGreyscaleData(data: Uint8Array, layer: number): void {
        this.gl.activeTexture(this.gl.TEXTURE0 + this.textureUnit);
        this.gl.texSubImage3D(this.gl.TEXTURE_2D_ARRAY, 
            0, 
            0, 0, layer, 
            this.width, this.height, 1, 
            this.gl.RED, this.gl.UNSIGNED_BYTE, data);
    }

    setLayersFromGreyscaleData(data: Uint8Array, firstLayer: number, layerCount: number): void {
        this.gl.activeTexture(this.gl.TEXTURE0 + this.textureUnit);
        this.gl.texSubImage3D(this.gl.TEXTURE_2D_ARRAY, 
            0, 
            0, 0, firstLayer, 
            this.width, this.height, layerCount, 
            this.gl.RED, this.gl.UNSIGNED_BYTE, data);
    }

    use = (location: WebGLUniformLocation): void => {
        this.gl.uniform1i(location, this.textureUnit);
    }

    private internalFormat = (): number => {
        switch (this.channels) {
            case 1: return this.gl.R8;
            case 2: return this.gl.RG8;
            case 3: return this.gl.RGB8;
            case 4: return this.gl.RGBA8;
            default: return this.gl.RGBA8;
        }
    }
}