export enum CanvasState {
    STOPPED,
    RUNNING,
    STOPPING
}

/**
 * The CanvasController controls the rendering of a canvas, including the synchronization of
 * the rendering with the frame rate of the canvas, and the adjustment of the canvas size
 * as the user changes the size of the window etc.
 */
export class CanvasController {
    readonly gl: WebGL2RenderingContext;
    private state: CanvasState = CanvasState.STOPPED;
    
    /**
     * This function is called each frame. It should perform rendering on the canvas as required.
     * 
     * @param gl - the GL rendering context.
     * @param time - the time of the current frame.
     */
    render = (gl: WebGL2RenderingContext, time: number): void => {};

    /**
     * This function is called each time the canvas changes size. It should update rendering elements
     * that depend on the size of the canvas such as the projection matrix of a camera etc.
     * 
     * @param width - the new width of the canvas.
     * @param height - the new height of the canvas.
     */
    updateSize = (width: number, height: number): void => {};

    constructor(canvas: HTMLCanvasElement) {
        this.gl = canvas.getContext("webgl2", { 
            alpha: false, 
            premultipliedAlpha: false, 
            preserveDrawingBuffer: true, 
            antialias: true,
            powerPreference: "high-performance"
        })!;
    }

    getState = (): CanvasState => {
        return this.state;
    }

    /**
     * Stops the canvas from rendering.
     */
    stop = () => {
        if (this.state === CanvasState.RUNNING) {
            this.state = CanvasState.STOPPING;
        }    
    }

    /**
     * Starts the canvas rendering.
     */
    start = () => {
        if (this.state === CanvasState.STOPPED) {
            this.state = CanvasState.RUNNING;
            requestAnimationFrame(this.renderLoop);
        }
    }

    private resize = () => {
        const canvas = this.gl.canvas as HTMLCanvasElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            this.gl.viewport(0, 0, width, height);
            this.updateSize(width, height);
        }
    }

    private renderLoop = (time: number) => {
        if (this.state === CanvasState.RUNNING) {
            this.resize();
            this.render(this.gl, time);
            requestAnimationFrame(this.renderLoop);
        }
    }
}