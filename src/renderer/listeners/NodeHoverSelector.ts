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

    // Index into nodePositions array that is being hovered over
    private hoverNodeIndex: number | null = null;

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
        return this.hoverNodeIndex;
    }

    mouseMoveHandler = (event: MouseEvent): void => {
        var canvasBounds = this.canvas.getBoundingClientRect();
        this.update(event.clientX - canvasBounds.left, event.clientY - canvasBounds.top);
    }

    update = (x: number, y: number): void => {
        const newHoverNodeIndex = this.closest
            ? Selector.selectClosestNode(x, y, this.camera, this.nodePositions, this.nodePositions.length / 4)
            : Selector.selectNode(x, y, this.camera, this.nodePositions, this.nodePositions.length / 4);

        if (newHoverNodeIndex !== this.hoverNodeIndex) {
            if (this.hoverNodeIndex !== null) {
                GraphRendererUtilities.deselectNode(this.graphRenderer, this.nodeVisuals, this.hoverNodeIndex);
            }

            if (newHoverNodeIndex !== null) {
                GraphRendererUtilities.selectNode(this.graphRenderer, this.nodeVisuals, newHoverNodeIndex);
            }

            this.hoverNodeIndex = newHoverNodeIndex;
        }
    }
}