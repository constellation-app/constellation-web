import { Camera } from "../Camera";
import { Matrix } from "../utilities/Matrix";
import { Selector } from "../utilities/Selector";

export class Rotator {
    readonly canvas: HTMLCanvasElement;
    readonly camera: Camera;
    readonly nodePositions: Float32Array;
    readonly nodeCount: number;

    private selectedNode: number | null = null;
    private vector = Matrix.createVector();

    constructor(canvas: HTMLCanvasElement, camera: Camera, nodePositions: Float32Array, nodeCount: number) {
        this.canvas = canvas;
        this.camera = camera;
        this.nodePositions = nodePositions;
        this.nodeCount = nodeCount;

        canvas.addEventListener('mousedown', this.handleMouseDown);
        canvas.addEventListener('mousemove', this.handleMouseMove);
        canvas.addEventListener('mouseup', this.handleMouseUp);
    }

    handleMouseDown = (event: MouseEvent): void => {
        this.selectedNode = Selector.selectNode(event.clientX, event.clientY, this.camera, this.nodePositions, this.nodeCount);
    }

    handleMouseMove = (event: MouseEvent): void => {
        if (this.selectedNode) {
            const offset = this.selectedNode * 4;
            this.vector[0] = this.nodePositions[offset];
            this.vector[1] = this.nodePositions[offset + 1];
            this.vector[2] = this.nodePositions[offset + 2];

            Matrix.subtract(this.vector, this.camera.target, this.vector);
            const radius = Matrix.vectorLength(this.vector);

            this.camera.updatePixelVector(event.clientX, event.clientY, this.vector);

            console.log(this.vector);
        }
    }

    handleMouseUp = (event: MouseEvent): void => {
        this.selectedNode = null;
    }
}