import { Camera } from "../Camera";
import { GraphRenderer } from "../GraphRenderer";
import { Selector } from "../utilities/Selector";
import { GraphRendererUtilities } from "../utilities/GraphRendererUtilities";

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
        var canvasBounds = this.canvas.getBoundingClientRect();
        this.update(event.clientX - canvasBounds.left, event.clientY - canvasBounds.top);
    }

    update = (x: number, y: number): void => {
        const newHoverNodeId = this.closest
            ? Selector.selectClosestNode(x, y, this.camera, this.nodePositions, this.nodePositions.length / 4)
            : Selector.selectNode(x, y, this.camera, this.nodePositions, this.nodePositions.length / 4);

        if (newHoverNodeId !== this.hoverNodeId) {

            if (this.hoverNodeId !== null) {
                GraphRendererUtilities.deselectNode(this.graphRenderer, this.nodeVisuals, this.hoverNodeId);
            }

            if (newHoverNodeId !== null) {
                GraphRendererUtilities.selectNode(this.graphRenderer, this.nodeVisuals, newHoverNodeId);
            }

            this.hoverNodeId = newHoverNodeId;
        }
    }
}