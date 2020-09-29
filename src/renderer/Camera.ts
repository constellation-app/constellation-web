import { GraphRenderer } from "./GraphRenderer";
import { Matrix } from "./utilities/Matrix";

export class Camera {
    readonly graphRenderer: GraphRenderer;

    fieldOfView: number = Math.PI * 0.5;
    width: number = 1024;
    height: number = 1024;
    aspectRatio: number = 1;
    near: number = 1;
    far: number = 1000;

    readonly eye: Float32Array = Matrix.createVector();
    readonly target: Float32Array = Matrix.createVector();
    readonly up: Float32Array = Matrix.createVector();
    
    readonly projectionMatrix: Float32Array = Matrix.createMatrix();
    readonly viewMatrix: Float32Array = Matrix.createMatrix();

    constructor(graphRenderer: GraphRenderer) {
        this.graphRenderer = graphRenderer;
    }

    setProjection = (width: number, height: number, fieldOfView: number, near: number, far: number): void => {
        this.fieldOfView = fieldOfView;
        this.near = near;
        this.far = far;
        this.setSize(width, height);
    }

    setSize = (width: number, height: number): void => {
        this.width = width;
        this.height = height;
        this.aspectRatio = width / height;
        this.updateProjectionMatrix();
    }

    updateProjectionMatrix = (): void => {
        Matrix.updateProjectionMatrix(this.fieldOfView, this.aspectRatio, this.near, this.far, this.projectionMatrix);
        this.graphRenderer.setProjectionMatrix(this.projectionMatrix);
    }

    lookAt = (eye: Float32Array, target: Float32Array, up: Float32Array): void => {
        Matrix.copyVector(eye, this.eye);
        Matrix.copyVector(target, this.target);
        Matrix.copyVector(up, this.up);
        this.updateViewMatrix();
    }

    updateViewMatrix = (): void => {
        Matrix.updateViewMatrix(this.eye, this.target, this.up, this.viewMatrix);
        this.graphRenderer.setViewMatrix(this.viewMatrix);
    }

    updatePixelVector = (x: number, y: number, vector: Float32Array): void => {
        let dy = Math.tan(this.fieldOfView * 0.5);
        let dx = dy * this.aspectRatio;

        vector[1] = dy * (1.0 - y * 2.0 / this.height);
        vector[0] = dx * (x * 2.0 / this.width - 1.0);
        vector[2] = -1;
    }

    createPixelVector = (x: number, y: number): Float32Array => {
        let pixelVector = Matrix.createVector();
        this.updatePixelVector(x, y, pixelVector);
        return pixelVector;
    }
}