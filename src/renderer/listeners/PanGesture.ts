import { Matrix } from "../utilities/Matrix";
import { NodeHoverSelector } from "./NodeHoverSelector";

export class PanGesture {
    readonly nodeHoverSelector: NodeHoverSelector;

    readonly savedTargetVector = Matrix.createVector();

    readonly newEyeVector = Matrix.createVector();
    readonly newTargetVector = Matrix.createVector();
    readonly newViewMatrix = Matrix.createMatrix();

    private hoverNodeId: number | null = null;
    private hoverNodePosition = Matrix.createVector();
    private dragStartPosition = Matrix.createVector();

    private localPixelVector = Matrix.createVector();
    private worldPixelVector = Matrix.createVector();

    constructor(nodeHoverSelector: NodeHoverSelector) {
        this.nodeHoverSelector = nodeHoverSelector;

        nodeHoverSelector.canvas.addEventListener('mousedown', this.handleMouseDown);
        nodeHoverSelector.canvas.addEventListener('mousemove', this.handleMouseMove);
        nodeHoverSelector.canvas.addEventListener('mouseup', this.handleMouseUp);
        nodeHoverSelector.canvas.addEventListener('mouseout', this.handleMouseUp);
    }

    handleMouseDown = (event: MouseEvent): void => {
        if (!event.shiftKey) {
            this.hoverNodeId = this.nodeHoverSelector.getHoverNode();
            if (this.hoverNodeId !== null) {
                Matrix.world2LocalPoint(this.nodeHoverSelector.nodePositions, this.hoverNodeId * 4, this.nodeHoverSelector.camera.viewMatrix, this.hoverNodePosition);

                this.nodeHoverSelector.camera.updatePixelVector(event.clientX, event.clientY, this.localPixelVector);
                Matrix.local2WorldVector(this.localPixelVector, 0, this.nodeHoverSelector.camera.viewMatrix, this.worldPixelVector);
                Matrix.scale(this.worldPixelVector, -this.hoverNodePosition[2], this.worldPixelVector);
                Matrix.add(this.worldPixelVector, this.nodeHoverSelector.camera.eye, this.dragStartPosition);

                Matrix.copyVector(this.nodeHoverSelector.camera.target, this.savedTargetVector);
                Matrix.subtract(this.savedTargetVector, this.nodeHoverSelector.camera.eye, this.savedTargetVector);
            }
        }
    }

    handleMouseMove = (event: MouseEvent): void => {
        if (this.hoverNodeId !== null) {
            this.nodeHoverSelector.camera.updatePixelVector(event.clientX, event.clientY, this.localPixelVector);
            
            Matrix.local2WorldVector(this.localPixelVector, 0, this.nodeHoverSelector.camera.viewMatrix, this.worldPixelVector);
            Matrix.scale(this.worldPixelVector, this.hoverNodePosition[2], this.worldPixelVector);
            Matrix.add(this.worldPixelVector, this.dragStartPosition, this.newEyeVector);

            Matrix.add(this.newEyeVector, this.savedTargetVector, this.newTargetVector);

            this.nodeHoverSelector.camera.lookAt(this.newEyeVector, this.newTargetVector, this.nodeHoverSelector.camera.up);
        }
    }

    handleMouseUp = (event: MouseEvent): void => {
        this.hoverNodeId = null;
    }
}