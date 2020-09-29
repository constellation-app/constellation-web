import { Matrix } from "../utilities/Matrix";
import { NodeHoverSelector } from "./NodeHoverSelector";

export class ZoomGesture {
    readonly nodeHoverSelector: NodeHoverSelector;

    readonly newEyeVector = Matrix.createVector();
    readonly newTargetVector = Matrix.createVector();
    readonly newViewMatrix = Matrix.createMatrix();

    constructor(nodeHoverSelector: NodeHoverSelector) {
        this.nodeHoverSelector = nodeHoverSelector;

        nodeHoverSelector.canvas.addEventListener('wheel', this.handleScroll);
    }

    handleScroll = (event: WheelEvent): boolean => {
        const hoverNodeId = this.nodeHoverSelector.getHoverNode();
        const camera = this.nodeHoverSelector.camera;

        if (hoverNodeId !== null) {
            let dx = (this.nodeHoverSelector.nodePositions[hoverNodeId * 4] - camera.eye[0]) * event.deltaY * 0.01;
            let dy = (this.nodeHoverSelector.nodePositions[hoverNodeId * 4 + 1] - camera.eye[1]) * event.deltaY * 0.01;
            let dz = (this.nodeHoverSelector.nodePositions[hoverNodeId * 4 + 2] - camera.eye[2]) * event.deltaY * 0.01;

            Matrix.copyVector(camera.eye, this.newEyeVector);
            this.newEyeVector[0] += dx;
            this.newEyeVector[1] += dy;
            this.newEyeVector[2] += dz;
            
            Matrix.copyVector(camera.target, this.newTargetVector);
            this.newTargetVector[0] += dx;
            this.newTargetVector[1] += dy;
            this.newTargetVector[2] += dz;

            camera.lookAt(this.newEyeVector, this.newTargetVector, camera.up);
        }
        return false;
    }
}