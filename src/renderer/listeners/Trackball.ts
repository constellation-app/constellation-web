import { Camera } from "../Camera";
import { Matrix } from "../utilities/Matrix";

export class Trackball {
    readonly canvas: HTMLCanvasElement;
    readonly camera: Camera;

    private mouseDown = false;
    private mouseDownPoint = Matrix.createVector();

    private originalEye = Matrix.createVector();
    private originalUp = Matrix.createVector();
    private originalViewMatrix = Matrix.createMatrix();

    private currentMousePoint = Matrix.createVector();
    private axisOfRotation = Matrix.createVector();
    private rotationMatrix = Matrix.createMatrix();

    private eyeOffset = Matrix.createVector();
    private rotatedEyeOffset = Matrix.createVector();

    private rotatedUp = Matrix.createVector();

    constructor(canvas: HTMLCanvasElement, camera: Camera) {
        this.canvas = canvas;
        this.camera = camera;

        canvas.addEventListener('mousedown', this.handleMouseDown);
        canvas.addEventListener('mousemove', this.handleMouseMove);
        canvas.addEventListener('mouseup', this.handleMouseUp);
    }

    handleMouseDown = (event: MouseEvent): void => {
        Trackball.mapPoint(event.clientX, event.clientY, this.canvas.width, this.canvas.height, this.mouseDownPoint);
        this.mouseDown = true;
        Matrix.copyVector(this.camera.eye, this.originalEye);
        Matrix.copyVector(this.camera.up, this.originalUp);
        Matrix.copyMatrix(this.camera.viewMatrix, this.originalViewMatrix);

        console.log(this.mouseDownPoint);
    }

    handleMouseMove = (event: MouseEvent): void => {
        if (this.mouseDown) {
            Trackball.mapPoint(event.clientX, event.clientY, this.canvas.width, this.canvas.height, this.currentMousePoint);
            Matrix.cross(this.mouseDownPoint, this.currentMousePoint, this.axisOfRotation);
            Matrix.normalize(this.axisOfRotation, this.axisOfRotation);
            const angle = Math.acos(Matrix.dot(this.mouseDownPoint, this.currentMousePoint));

            Matrix.local2WorldVector(this.axisOfRotation, 0, this.originalViewMatrix, this.axisOfRotation);
            
            Matrix.rotateAroundAxis(angle, this.axisOfRotation, this.rotationMatrix);


            Matrix.subtract(this.originalEye, this.camera.target, this.eyeOffset);
            Matrix.world2LocalVector(this.eyeOffset, 0, this.rotationMatrix, this.rotatedEyeOffset);
            Matrix.add(this.rotatedEyeOffset, this.camera.target, this.rotatedEyeOffset);

            Matrix.world2LocalVector(this.originalUp, 0, this.rotationMatrix, this.rotatedUp);

            this.camera.lookAt(this.rotatedEyeOffset, this.camera.target, this.rotatedUp);
        }
    }

    handleMouseUp = (event: MouseEvent): void => {
        this.mouseDown = false;
    }

    private static mapPoint2 = (x: number, y: number, width: number, height: number, point: Float32Array): void => {
        if (width > height) {
            point[0] = (x - width * 0.5) * 2 / height;
            point[1] = (y - height * 0.5) * -2 / height; 
        } else {
            point[0] = (x - width * 0.5) * 2 / width;
            point[1] = (y - height * 0.5) * -2 / width; 
        }

        let distanceSquared = x * x + y * y;

        if (distanceSquared <= 0.5) {
            point[2] = 1.0 - Math.sqrt(1 - distanceSquared);
        } else {
            point[2] = 1.0 - 0.5 / Math.sqrt(distanceSquared);
        }

        Matrix.normalize(point, point);
    }

    private static mapPoint = (x: number, y: number, width: number, height: number, point: Float32Array): void => {
        if (width > height) {
            point[0] = (x - width * 0.5) * 2 / height;
            point[1] = (y - height * 0.5) * -2 / height; 
        } else {
            point[0] = (x - width * 0.5) * 2 / width;
            point[1] = (y - height * 0.5) * -2 / width; 
        }

        let distanceSquared = point[0] * point[0] + point[1] * point[1];
        if (distanceSquared > 1.0) {
            const distance = Math.sqrt(distanceSquared);
            point[0] /= distance;
            point[1] /= distance;
            distanceSquared = 1.0;
        }

        point[2] = Math.sqrt(1 - distanceSquared);
    }
}