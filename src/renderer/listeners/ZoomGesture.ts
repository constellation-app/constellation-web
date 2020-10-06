import { Matrix } from "../utilities/Matrix";
import { NodeHoverSelector } from "./NodeHoverSelector";

export class ZoomGesture {

    static zoomVelocity = 0.01;
    static safeDistance = 10.0;

    readonly nodeHoverSelector: NodeHoverSelector;

    readonly cameraForwardVector = Matrix.createVector();

    readonly newEyeVector = Matrix.createVector();
    readonly newTargetVector = Matrix.createVector();
    
    constructor(nodeHoverSelector: NodeHoverSelector) {
        this.nodeHoverSelector = nodeHoverSelector;

        nodeHoverSelector.canvas.addEventListener('wheel', this.handleScroll);
    }

    handleScroll = (event: WheelEvent): boolean => {
        const hoverNodeId = this.nodeHoverSelector.getHoverNode();
        
        if (hoverNodeId !== null) {
            const camera = this.nodeHoverSelector.camera;
            
            // Calculate the vector from the camera eye to the camera target.
            // Save this so that it can be restored after the zoom.
            Matrix.subtract(camera.target, camera.eye, this.newTargetVector);

            // Calculate the vector from the camera eye to the hover node
            Matrix.copyVectorFromBuffer(this.nodeHoverSelector.nodePositions, hoverNodeId * 4, this.newEyeVector);
            Matrix.subtract(this.newEyeVector, camera.eye, this.newEyeVector);

            // Normalize the eye vector
            const distance = Matrix.vectorLength(this.newEyeVector);
            Matrix.scale(this.newEyeVector, 1.0 / distance, this.newEyeVector);

            // Adjust the safe distance so that it applies in the direction the camera is facing rather
            // than in the direction towards the hove node.
            Matrix.copyForwardVector(camera.viewMatrix, this.cameraForwardVector);
            const safeDistance = ZoomGesture.safeDistance / Matrix.dot(this.newEyeVector, this.cameraForwardVector);

            // Calculate how far we should move towards the hover node.
            let moveDistance = distance * -event.deltaY * ZoomGesture.zoomVelocity;
            
            // If this will move the camera inside the safe distance then adjust the move distance so that
            // it will leave the camera exactly at the safe distance
            if (distance - moveDistance < safeDistance) {
                moveDistance = distance - safeDistance;
            }

            // Move the eye of the camera towards the hover node by the calculated distance.
            Matrix.scale(this.newEyeVector, moveDistance, this.newEyeVector);
            Matrix.add(camera.eye, this.newEyeVector, this.newEyeVector);
            
            // Restore the target position to what it was before the zoom relative the the eye position
            Matrix.add(this.newTargetVector, this.newEyeVector, this.newTargetVector);

            // Update the camera with the new eye and target positions, keeping the up direction unchanged.
            camera.lookAt(this.newEyeVector, this.newTargetVector, camera.up);
        }

        return false;
    }
}