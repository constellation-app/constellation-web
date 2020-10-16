import { Camera } from "../Camera";
import { Matrix } from "../utilities/Matrix";

export class Rotator {
    readonly canvas: HTMLCanvasElement;
    readonly camera: Camera;

    mouseDown = false;

    readonly originalEyeOffset = Matrix.createVector();
    readonly originalUp = Matrix.createVector();
    readonly originalViewMatrix = Matrix.createMatrix();
    
    readonly mouseDownPoint = Matrix.createVector();
    readonly mouseDownDirection = Matrix.createVector();

    readonly currentMousePoint = Matrix.createVector();
    readonly mouseMoveVector = Matrix.createVector();
    
    readonly axisOfRotation = Matrix.createVector();
    private rotationMatrix = Matrix.createMatrix();

    private targetOffset = Matrix.createVector();
    private rotatedEye = Matrix.createVector();
    private rotatedUp = Matrix.createVector();

    constructor(canvas: HTMLCanvasElement, camera: Camera) {
        this.canvas = canvas;
        this.camera = camera;

        canvas.addEventListener('mousedown', this.handleMouseDown);
        canvas.addEventListener('mousemove', this.handleMouseMove);
        canvas.addEventListener('mouseup', this.handleMouseUp);
        canvas.addEventListener('mouseout', this.handleMouseUp);
    }

    handleMouseDown = (event: MouseEvent): void => {
        if (event.shiftKey) {
            this.normalizeScreenPoint(event.clientX, event.clientY, this.mouseDownPoint);
            Matrix.subtract(this.camera.eye, this.camera.target, this.originalEyeOffset);
            Matrix.copyVector(this.camera.up, this.originalUp);
            Matrix.copyMatrix(this.camera.viewMatrix, this.originalViewMatrix);
            this.mouseDown = true;
        }
    }

    handleMouseMove = (event: MouseEvent): void => {
        if (this.mouseDown) {
            this.normalizeScreenPoint(event.clientX, event.clientY, this.currentMousePoint);
            Matrix.subtract(this.currentMousePoint, this.mouseDownPoint, this.mouseMoveVector);
            
            const mouseMoveDistance = Matrix.vectorLength(this.mouseMoveVector);
            Matrix.scale(this.mouseMoveVector, 1.0 / mouseMoveDistance, this.mouseMoveVector);

            const x = this.mouseMoveVector[0];
            this.mouseMoveVector[0] = this.mouseMoveVector[1];
            this.mouseMoveVector[1] = -x;

            Matrix.local2WorldVector(this.mouseMoveVector, 0, this.originalViewMatrix, this.axisOfRotation);
            Matrix.rotateAroundAxis(mouseMoveDistance, this.axisOfRotation, this.rotationMatrix);
            
            Matrix.local2WorldVector(this.originalEyeOffset, 0, this.rotationMatrix, this.rotatedEye);
            Matrix.add(this.rotatedEye, this.camera.target, this.rotatedEye);

            Matrix.local2WorldVector(this.originalUp, 0, this.rotationMatrix, this.rotatedUp);

            this.camera.lookAt(this.rotatedEye, this.camera.target, this.rotatedUp);
        }
    }

    handleMouseUp = (event: MouseEvent): void => {
        this.mouseDown = false;
    }

    private normalizeScreenPoint = (x: number, y: number, point: Float32Array): void => {
        point[1] = y * -2.0 / this.camera.height + 1.0;
        point[0] = (x * 2.0 / this.camera.width - 1.0) * this.camera.aspectRatio;
        
    }
}