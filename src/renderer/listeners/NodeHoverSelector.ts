import { BufferBuilder } from "../utilities/BufferBuilder";
import { Camera } from "../Camera";
import { GraphRenderer } from "../GraphRenderer";
import { Selector } from "../utilities/Selector";

export class NodeHoverSelector {

    readonly canvas: HTMLCanvasElement;
    readonly camera: Camera;
    readonly graphRenderer: GraphRenderer;
    readonly nodePositions: Float32Array;
    readonly nodeVisuals: Uint32Array;
    readonly closest: boolean;

    private hoverNodeId: number | null = null;

    constructor(canvas: HTMLCanvasElement, camera: Camera, graphRenderer: GraphRenderer, nodePositions: Float32Array, nodeVisuals: Uint32Array, closest: boolean = false) {
        this.canvas = canvas;
        this.camera = camera;
        this.graphRenderer = graphRenderer;
        this.nodePositions = nodePositions;
        this.nodeVisuals = nodeVisuals;
        this.closest = closest;

        canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }

    getHoverNode = (): number | null => {
        return this.hoverNodeId;
    }

    mouseMoveHandler = (event: MouseEvent): void => {
        const newHoverNodeId = this.closest
            ? Selector.selectClosestNode(event.clientX, event.clientY, this.camera, this.nodePositions, this.nodePositions.length / 4)
            : Selector.selectNode(event.clientX, event.clientY, this.camera, this.nodePositions, this.nodePositions.length / 4);

        if (newHoverNodeId !== this.hoverNodeId) {

            if (this.hoverNodeId !== null) {
                BufferBuilder.deselectNode(this.hoverNodeId, this.nodeVisuals);
                this.graphRenderer.updateNodeVisuals(this.nodeVisuals, this.hoverNodeId, this.hoverNodeId + 1);
            }

            if (newHoverNodeId !== null) {
                BufferBuilder.selectNode(newHoverNodeId, this.nodeVisuals);
                this.graphRenderer.updateNodeVisuals(this.nodeVisuals, newHoverNodeId, newHoverNodeId + 1);
            }

            this.hoverNodeId = newHoverNodeId;
        }
    }
}