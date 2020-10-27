import { BufferBuilder } from "../utilities/BufferBuilder";
import { Matrix } from "../utilities/Matrix";
import { NodeHoverSelector } from "./NodeHoverSelector";
import { GraphRendererUtilities } from '../utilities/GraphRendererUtilities';

export class DragGesture {
    readonly nodeHoverSelector: NodeHoverSelector;

    private hoverNodeId: number | null = null;

    private readonly mouseStartingLocalPosition = Matrix.createVector();
    private readonly nodeStartingLocalPosition = Matrix.createVector();

    private readonly mouseCurrentLocalPosition = Matrix.createVector();
    private readonly nodeCurrentLocalPosition = Matrix.createVector();

    private readonly nodeCurrentWorldPosition = Matrix.createVector();
    private readonly vertexChangCallback: any;
    
    constructor(nodeHoverSelector: NodeHoverSelector, callback: (pos: number, x: number, y: number, z: number) => void) {
        this.nodeHoverSelector = nodeHoverSelector;
        this.vertexChangCallback = callback;

        nodeHoverSelector.canvas.addEventListener('mousedown', this.handleMouseDown);
        nodeHoverSelector.canvas.addEventListener('mousemove', this.handleMouseMove);
        nodeHoverSelector.canvas.addEventListener('mouseup', this.handleMouseUp);
        nodeHoverSelector.canvas.addEventListener('mouseout', this.handleMouseUp);
    }

    handleMouseDown = (event: MouseEvent): void => {
        if (event.button === 0) {

            // Adjust the mouse position to account for the position of the canvas in the window.
            const canvasBounds = this.nodeHoverSelector.canvas.getBoundingClientRect();
            const mouseX = event.clientX - canvasBounds.left;
            const mouseY = event.clientY - canvasBounds.top;

            // If the mouse is currently hovering over a node - start the drag operation
            this.hoverNodeId = this.nodeHoverSelector.getHoverNode();

            if (this.hoverNodeId !== null) {

                console.log("DEBUG: DRAG started for: " + this.hoverNodeId + ', x=' + this.nodeHoverSelector.nodePositions[this.hoverNodeId * 4]);

                // Find the position of the hover node in local camera coordinates.
                Matrix.world2LocalPoint(this.nodeHoverSelector.nodePositions, this.hoverNodeId * 4, this.nodeHoverSelector.camera.viewMatrix, this.nodeStartingLocalPosition);

                // Find the vector that represents the direction of the mouse in local camera coordinates.
                this.nodeHoverSelector.camera.updatePixelVector(mouseX, mouseY, this.mouseStartingLocalPosition);

                // Project the mouse vector out to intersect with the plane at the same depth as the hover node.
                Matrix.scale(this.mouseStartingLocalPosition, this.nodeStartingLocalPosition[2] / this.mouseStartingLocalPosition[2], this.mouseStartingLocalPosition);
            }
        }
    }

    handleMouseMove = (event: MouseEvent): void => {
        if (event.button === 0) {
            // Adjust the mouse position to account for the position of the canvas in the window.
            const canvasBounds = this.nodeHoverSelector.canvas.getBoundingClientRect();
            const mouseX = event.clientX - canvasBounds.left;
            const mouseY = event.clientY - canvasBounds.top;

            // If a drag operation is currently underway...
            if (this.hoverNodeId !== null) {

                // Find the point where the mouse cursor would intersect with the plane at the same depth as the hover node.
                this.nodeHoverSelector.camera.updatePixelVector(mouseX, mouseY, this.mouseCurrentLocalPosition);
                Matrix.scale(this.mouseCurrentLocalPosition, this.nodeStartingLocalPosition[2] / this.mouseCurrentLocalPosition[2], this.mouseCurrentLocalPosition);

                // Find the new hover node position by adding the new mouse position and subtracting the starting mouse position from the nodes starting position.
                Matrix.copyVector(this.nodeStartingLocalPosition, this.nodeCurrentLocalPosition);
                Matrix.add(this.nodeCurrentLocalPosition, this.mouseCurrentLocalPosition, this.nodeCurrentLocalPosition);
                Matrix.subtract(this.nodeCurrentLocalPosition, this.mouseStartingLocalPosition, this.nodeCurrentLocalPosition);

                // Map the new hover node position back into world space.
                Matrix.local2WorldPoint(this.nodeCurrentLocalPosition, 0, this.nodeHoverSelector.camera.viewMatrix, this.nodeCurrentWorldPosition);

                // Update the position of the hover node in the graph renderer.
                GraphRendererUtilities.updateNodePosition(this.nodeHoverSelector.graphRenderer, this.nodeHoverSelector.nodePositions, this.hoverNodeId, this.nodeCurrentWorldPosition[0],
                    this.nodeCurrentWorldPosition[1],
                    this.nodeCurrentWorldPosition[2],
                    BufferBuilder.getNodeRadius(this.hoverNodeId, this.nodeHoverSelector.nodePositions));
            }
        }
    }

    handleMouseUp = (event: MouseEvent): void => {
        if (event.button === 0) {
            if (this.hoverNodeId !== null) {
                console.log("DEBUG: DRAG is completed for: " + this.hoverNodeId + ', x=' + this.nodeHoverSelector.nodePositions[this.hoverNodeId * 4]);
                this.vertexChangCallback(this.hoverNodeId, this.nodeCurrentWorldPosition[0], this.nodeCurrentWorldPosition[1], this.nodeCurrentWorldPosition[2]);
            }
            this.hoverNodeId = null;
        }
    }
}