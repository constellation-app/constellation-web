import { NodeProgram } from "./programs/NodeProgram";
import { LinkProgram } from "./programs/LinkProgram";
import { GlyphProgram } from "./programs/GlyphProgram";
import { FloatTexture } from "./data/FloatTexture";
import { UIntegerTexture } from "./data/UIntegerTexture";
import { TextureArray } from "./data/TextureArray";
import { GlyphRenderer } from './GlyphRenderer';
import { ArrowProgram } from "./programs/ArrowProgram";

export class GraphRenderer {

    readonly gl: WebGLRenderingContext;

    readonly nodeProgram: NodeProgram;
    readonly linkProgram: LinkProgram;
    readonly arrowProgram: ArrowProgram;
    readonly glyphProgram: GlyphProgram;

    readonly nodePositionTexture: FloatTexture;
    readonly nodeVisualsTexture: UIntegerTexture;
    readonly linkPositionTexture: UIntegerTexture;
    readonly glyphPositionTexture: FloatTexture;
    readonly glyphFontPositionTexture: FloatTexture;

    readonly iconTexture: TextureArray;
    readonly glyphTexture: TextureArray;

    private requiresUpdate = false;

    private viewMatrix: Float32Array | null = null;
    private projectionMatrix: Float32Array | null = null;

    private nodeCount: number = 0;
    private linkCount: number = 0;
    
    private glyphCount: number = 0;
    private glyphScale: number | null = 1.0;
    private glyphRenderer: GlyphRenderer | null = null;
    private glyphColor: Float32Array | null = new Float32Array([0.5, 0.5, 0.5]);

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;

        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // gl.enable(gl.SAMPLE_COVERAGE);
        // gl.sampleCoverage(0.5, false);

        this.nodePositionTexture = new FloatTexture(gl, 0, 4, 1024, 1024);
        this.nodePositionTexture.allocate();
        
        this.nodeVisualsTexture = new UIntegerTexture(gl, 1, 2, 1024, 1024);
        this.nodeVisualsTexture.allocate();

        this.linkPositionTexture = new UIntegerTexture(gl, 2, 4, 1024, 1024);
        this.linkPositionTexture.allocate();

        this.glyphPositionTexture = new FloatTexture(gl, 3, 4, 1024, 1024);
        this.glyphPositionTexture.allocate();

        this.glyphFontPositionTexture = new FloatTexture(gl, 4, 3, 1024, 1024);
        this.glyphFontPositionTexture.allocate();

        this.iconTexture = new TextureArray(gl, 5, 4, 256, 256, 16);
        this.iconTexture.allocate();
        
        this.glyphTexture = new TextureArray(gl, 6, 1, 1024, 1024, 80);
        this.glyphTexture.allocate();

        this.nodeProgram = new NodeProgram(gl);
        this.nodeProgram.use();
        this.nodePositionTexture.use(this.nodeProgram.nodePositionAttributeLocation);
        this.nodeVisualsTexture.use(this.nodeProgram.nodeVisualsAttributeLocation);
        this.iconTexture.use(this.nodeProgram.iconTextureAttributeLocation);

        this.linkProgram = new LinkProgram(gl);
        this.linkProgram.use();
        this.nodePositionTexture.use(this.linkProgram.nodePositionAttributeLocation);
        this.linkPositionTexture.use(this.linkProgram.linkPositionAttributeLocation);

        this.arrowProgram = new ArrowProgram(gl);
        this.arrowProgram.use();
        this.nodePositionTexture.use(this.arrowProgram.nodePositionAttributeLocation);
        this.linkPositionTexture.use(this.arrowProgram.linkPositionAttributeLocation);

        this.glyphProgram = new GlyphProgram(gl);
        this.glyphProgram.use();
        this.nodePositionTexture.use(this.glyphProgram.nodePositionAttributeLocation);
        this.glyphPositionTexture.use(this.glyphProgram.glyphPositionAttributeLocation);
        this.glyphFontPositionTexture.use(this.glyphProgram.glyphFontPositionAttributeLocation);
        this.glyphTexture.use(this.glyphProgram.glyphTextureAttributeLocation);
        
        // Temp setup while in development
        this.iconTexture.setLayerFromURL("white_circle.png", 0, this);
        this.iconTexture.setLayerFromURL("white_rounded_rectangle.png", 1, this);
        this.iconTexture.setLayerFromURL("computer.png", 2, this);
        this.iconTexture.setLayerFromURL("earth.png", 3, this);
    }

    requireUpdate = (): void => {
        this.requiresUpdate = true;
    }

    setViewMatrix = (viewMatrix: Float32Array): void => {
        this.viewMatrix = viewMatrix;
        this.requiresUpdate = true;
    }

    setProjectionMatrix = (projectionMatrix: Float32Array): void => {
        this.projectionMatrix = projectionMatrix;
        this.requiresUpdate = true;
    }

    setClearColor = (clearColor: Float32Array): void => {
        this.gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
        this.requiresUpdate = true;
    }

    setNodes = (nodePositions: Float32Array, nodeVisuals: Uint32Array): void => {
        this.nodeCount = nodePositions.length / this.nodePositionTexture.elements;
        this.nodePositionTexture.replace(nodePositions);
        this.nodeVisualsTexture.replace(nodeVisuals);
        this.requiresUpdate = true;
    }

    updateNodePositions = (nodePositions: Float32Array, start: number, end: number): void => {
        this.nodePositionTexture.update(nodePositions, start, end);
        this.requiresUpdate = true;
    }

    updateNodeVisuals = (nodeVisuals: Uint32Array, start: number, end: number): void => {
        this.nodeVisualsTexture.update(nodeVisuals, start, end);
        this.requiresUpdate = true;
    }

    setLinks = (linkPositions: Uint32Array): void => {
        this.linkCount = linkPositions.length / this.linkPositionTexture.elements;
        this.linkPositionTexture.replace(linkPositions);
        this.requiresUpdate = true;
    }

    setGlyphScale = (glyphScale: number): void => {
        this.glyphScale = glyphScale;
        this.requiresUpdate = true;
    }

    setGlyphs = (glyphPositions: Float32Array): void => {
        this.glyphCount = glyphPositions.length / this.glyphPositionTexture.elements;
        this.glyphPositionTexture.replace(glyphPositions);
        this.requiresUpdate = true;
    }

    setGlyphRenderer = (glyphRenderer: GlyphRenderer): void => {
        this.glyphRenderer = glyphRenderer;
        this.requiresUpdate = true;
    }

    setGlyphColor = (glyphColor: Float32Array): void => {
        this.glyphColor = glyphColor;
        this.requiresUpdate = true;
    }

    render = (): void => {
        if (this.requiresUpdate) {
            const gl = this.gl;

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            this.renderNodeProgram();
            this.renderLinkProgram();
            this.renderArrowProgram();
            this.renderGlyphProgram();

            this.viewMatrix = null;
            this.projectionMatrix = null;
            this.requiresUpdate = false;
        }
    }

    private renderNodeProgram = (): void => {
        this.nodeProgram.use();
        if (this.viewMatrix) {
            this.nodeProgram.setViewMatrix(this.viewMatrix);
        }
        if (this.projectionMatrix) {
            this.nodeProgram.setProjectionMatrix(this.projectionMatrix);
        }
        if (this.nodeCount > 0) {
            this.nodeProgram.render(this.nodeCount);
        }
    }

    private renderLinkProgram = (): void => {
        this.linkProgram.use();
        if (this.viewMatrix) {
            this.linkProgram.setViewMatrix(this.viewMatrix);
        }
        if (this.projectionMatrix) {
            this.linkProgram.setProjectionMatrix(this.projectionMatrix);
        }
        if (this.linkCount > 0) {
            this.linkProgram.render(this.linkCount);
        }
    }

    private renderArrowProgram = (): void => {
        this.arrowProgram.use();
        if (this.viewMatrix) {
            this.arrowProgram.setViewMatrix(this.viewMatrix);
        }
        if (this.projectionMatrix) {
            this.arrowProgram.setProjectionMatrix(this.projectionMatrix);
        }
        if (this.linkCount > 0) {
            this.arrowProgram.render(this.linkCount);
        }
    }

    private renderGlyphProgram = (): void => {
        this.glyphProgram.use();
        if (this.viewMatrix) {
            this.glyphProgram.setViewMatrix(this.viewMatrix);
        }
        if (this.projectionMatrix) {
            this.glyphProgram.setProjectionMatrix(this.projectionMatrix);
        }
        if (this.glyphScale) {
            this.glyphProgram.setScale(this.glyphScale);
            this.glyphScale = null;
        }
        if (this.glyphColor) {
            this.glyphProgram.setGlyphColor(this.glyphColor);
            this.glyphColor = null;
        }
        if (this.glyphRenderer !== null) {
            this.glyphProgram.setRowHeight(this.glyphRenderer.rowHeight);
            this.glyphFontPositionTexture.replace(this.glyphRenderer.glyphFontPositions!);
            for (var i = 0; i < this.glyphRenderer.glyphTextures.length; i++) {
                this.glyphTexture.setLayerFromGreyscaleData(this.glyphRenderer.glyphTextures[i], i);
            }
            this.glyphRenderer = null;
        }
        if (this.glyphCount > 0) {
            this.glyphProgram.render(this.glyphCount);
        }
    }
}