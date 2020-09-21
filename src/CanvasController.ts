export enum CanvasState {
    STOPPED,
    RUNNING,
    STOPPING
}

export class CanvasController {
    readonly gl: WebGL2RenderingContext;
    private state: CanvasState = CanvasState.STOPPED;
    
    render = (gl: WebGL2RenderingContext, time: number): void => {};

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

    stop = () => {
        if (this.state === CanvasState.RUNNING) {
            this.state = CanvasState.STOPPING;
        }    
    }

    start = () => {
        if (this.state === CanvasState.STOPPED) {
            this.state = CanvasState.RUNNING;
            requestAnimationFrame(this.renderLoop);
        }
    }

    private resize = () => {
        const canvas = this.gl.canvas as HTMLCanvasElement;
        var width = canvas.clientWidth;
        var height = canvas.clientHeight;
        if (canvas.width !== width ||
            canvas.height !== height) {
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