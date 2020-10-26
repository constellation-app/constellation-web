import { NodeProgram } from "./programs/NodeProgram";
import { LinkProgram } from "./programs/LinkProgram";
import { GlyphProgram } from "./programs/GlyphProgram";
import { FloatTexture } from "./data/FloatTexture";
import { UIntegerTexture } from "./data/UIntegerTexture";
import { TextureArray } from "./data/TextureArray";
import { GlyphRenderer } from './GlyphRenderer';
import { ArrowProgram } from "./programs/ArrowProgram";

/**
 * A GraphRenderer renders a graph into an WebGL2RenderingContext. Currently, it has 4 passes:
 *  1. Nodes are rendered
 *  2. Links are rendered
 *  3. Link arrows are rendered
 *  4. Glyphs are rendered.
 * 
 * Currently, the buffers used to hold nodes, links and glyphs are hard-coded to a capacity of 1,048,576 elements.
 * This forces a hard upper bound on the size of graph that can be rendered. Given the poor performance of rendering
 * anything bigger than this, it is assumed that this is acceptable for now. The buffers are stored as a 1024x1024 2D
 * texture meaning that if the GPU is capable of storing bigger textures then this limit can be raised easily.
 */
export class GraphRenderer {

    readonly gl: WebGLRenderingContext;

    readonly maxIcons: number;

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
    private glyphSize: number | null = 1.0;
    private glyphRenderer: GlyphRenderer | null = null;
    private glyphColor: Float32Array | null = new Float32Array([0.5, 0.5, 0.5]);

    /**
     * Creates a new GraphRenderer.
     * 
     * @param gl - the WebGL2RenderingContext to render into.
     * @param maxIcons - the maximum number of different icons that this graph render can display (defaults to 256).
     */
    constructor(gl: WebGL2RenderingContext, maxIcons: number = 256) {
        this.gl = gl;
        this.maxIcons = maxIcons;

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

        this.iconTexture = new TextureArray(gl, 5, 4, 256, 256, maxIcons);
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

    /**
     * Causes the renderer to re-render on the next animation frame.
     */
    requireUpdate = (): void => {
        this.requiresUpdate = true;
    }

    /**
     * Sets the view matrix for this GraphRenderer. This is the matrix
     * that will be used to transform world coordinates into local camera coordinates.
     * This will cause the renderer to re-render on the next animation frame.
     * See Matrix.ts for methods to create this matrix.
     * @param viewMatrix - the new view matrix.
     */
    setViewMatrix = (viewMatrix: Float32Array): void => {
        this.viewMatrix = viewMatrix;
        this.requiresUpdate = true;
    }

    /**
     * Sets the projection matrix for this GraphRenderer. This is the matrix
     * that will be used to transform local camera coordinates into screen
     * coordinates. See Matrix.ts for methods to create this matrix.
     * @param projectionMatrix - the new projection matrix.
     */
    setProjectionMatrix = (projectionMatrix: Float32Array): void => {
        this.projectionMatrix = projectionMatrix;
        this.requiresUpdate = true;
    }

    /**
     * Sets the clear color for this GraphRenderer. This is the color that will be 
     * used as the background of the graph. When a new graph renderer is created, the clear
     * color defaults to black.
     * 
     * @param clearColor - the new clear color specified as [Red, Green, Blue] values 0.0 - 1.0.
     */
    setClearColor = (clearColor: Float32Array): void => {
        this.gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
        this.requiresUpdate = true;
    }

    /**
     * Replaces the nodes in this GraphRenderer. The two arrays should be the same length and can be built
     * using methods in the BufferBuilder.ts class.
     * @param nodePositions - the positions of the new nodes (x, y, z, radius)
     * @param nodeVisuals - the visual characteristics of the new nodes (foreground icon, background icon, background color, selected)
     * @param nodeCount - the number of nodes to render. If not provided this reverts to the size of the nodePositions buffer.
     */
    setNodes = (nodePositions: Float32Array, nodeVisuals: Uint32Array, nodeCount: number | null = null): void => {
        this.nodeCount = nodeCount !== null ? nodeCount : (nodePositions.length / this.nodePositionTexture.elements);
        this.nodePositionTexture.replace(nodePositions);
        this.nodeVisualsTexture.replace(nodeVisuals);
        this.requiresUpdate = true;
    }

    /**
     * Updates the number of nodes that will be rendered. This will not change and of the data associated with the nodes
     * meaning that the nodeCount can later be restored and the nodes will be rendered as they were.
     * 
     * @param nodeCount - the new number of nodes to be rendered.
     */
    setNodeCount = (nodeCount: number): void => {
        this.nodeCount = nodeCount;
        this.requiresUpdate = true;
    }

    /**
     * Updates the positions of a range of nodes.
     * 
     * @param nodePositions - the node positions buffer.
     * @param start - the start of the range (inclusive)
     * @param end - the end of the range (exclusive)
     */
    updateNodePositions = (nodePositions: Float32Array, start: number, end: number): void => {
        this.nodePositionTexture.update(nodePositions, start, end);
        this.requiresUpdate = true;
    }

    /**
     * Updates the visuals of a range of nodes.
     * 
     * @param nodeVisuals - the node visuals buffer to copy the node visual information from.
     * @param start - the start of the range (inclusive)
     * @param end  - the end of the range (exclusive)
     */
    updateNodeVisuals = (nodeVisuals: Uint32Array, start: number, end: number): void => {
        this.nodeVisualsTexture.update(nodeVisuals, start, end);
        this.requiresUpdate = true;
    }

    setLinks = (linkPositions: Uint32Array, linkCount: number | null = null): void => {
        this.linkCount = linkCount !== null ? linkCount : (linkPositions.length / this.linkPositionTexture.elements);
        this.linkPositionTexture.replace(linkPositions);
        this.requiresUpdate = true;
    }

    /**
     * Updates the number of links that will be rendered. This will not change and of the data associated with the links
     * meaning that the link count can later be restored and the links will be rendered as they were.
     * 
     * @param linkCount - the new number of links to be rendered.
     */
    setLinkCount = (linkCount: number): void => {
        this.linkCount = linkCount;
        this.requiresUpdate = true;
    }

    /**
     * Sets the size that glyphs will be rendered in the graph.
     * 
     * @param glyphSize - the new size that glyphs will be rendered in the graph.
     */
    setGlyphSize = (glyphSize: number): void => {
        this.glyphSize = glyphSize;
        this.requiresUpdate = true;
    }

    /**
     * Sets the glyphs that will be rendered in the graph. This will replace any previous glyphs that were being rendered.
     * The provided buffer can be created by calling the renderText method on the GlyphRenderer that has been provided to this
     * graph renderer.
     * 
     * @param glyphPositions - the buffer storing the new glyphs to be rendered.
     */
    setGlyphs = (glyphPositions: Float32Array): void => {
        this.glyphCount = glyphPositions.length / this.glyphPositionTexture.elements;
        this.glyphPositionTexture.replace(glyphPositions);
        this.requiresUpdate = true;
    }

    /**
     * Sets the glyph renderer that will be used to render glyphs on this graph.
     * 
     * @param glyphRenderer - the new glyph renderer for this graph.
     */
    setGlyphRenderer = (glyphRenderer: GlyphRenderer): void => {
        this.glyphRenderer = glyphRenderer;
        this.requiresUpdate = true;
    }

    /**
     * Sets the color that the glyphs in the graph will be rendered in.
     * 
     * @param glyphColor - the new color of the glyphs as [Red, Green, Blue] in values in the range 0.0 - 1.0.
     */
    setGlyphColor = (glyphColor: Float32Array): void => {
        this.glyphColor = glyphColor;
        this.requiresUpdate = true;
    }

    /**
     * Causes this graph renderer to re-render its contents to its canvas. If nothing has changed that would cause
     * the rendering to produce a differnt image, the rendering is not performed.
     */
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
        if (this.glyphSize) {
            this.glyphProgram.setScale(this.glyphSize);
            this.glyphSize = null;
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