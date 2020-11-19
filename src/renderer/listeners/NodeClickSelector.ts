import { BufferBuilder } from "../utilities/BufferBuilder";
import { Camera } from "../Camera";
import { GraphRenderer } from "../GraphRenderer";
import { Selector } from "../utilities/Selector";

export class NodeClickSelector {

    readonly canvas: HTMLCanvasElement;
    readonly camera: Camera;
    readonly graphRenderer: GraphRenderer;
    readonly nodePositions: Float32Array;
    readonly nodeVisuals: Uint32Array;
    readonly closest: boolean;
    readonly component: any;

    constructor(component: any, canvas: HTMLCanvasElement, camera: Camera, graphRenderer: GraphRenderer, nodePositions: Float32Array, nodeVisuals: Uint32Array, closest: boolean = false) {
        this.component = component;
        this.canvas = canvas;
        this.camera = camera;
        this.graphRenderer = graphRenderer;
        this.nodePositions = nodePositions;
        this.nodeVisuals = nodeVisuals;
        this.closest = closest;

        canvas.addEventListener("click", this.mouseClickHandler);
    }

    mouseClickHandler = (event: MouseEvent): void => {
        var canvasBounds = this.canvas.getBoundingClientRect();
        this.update(event.clientX - canvasBounds.left, event.clientY - canvasBounds.top);
    }

    update = (x: number, y: number): void => {
        const selectedNodeIndex = this.closest
            ? Selector.selectClosestNode(x, y, this.camera, this.nodePositions, this.nodePositions.length / 4)
            : Selector.selectNode(x, y, this.camera, this.nodePositions, this.nodePositions.length / 4);

        if (selectedNodeIndex) {
            this.component.selectedNode(selectedNodeIndex);
            BufferBuilder.selectNode(selectedNodeIndex, this.nodeVisuals);
            this.graphRenderer.updateNodeVisuals(this.nodeVisuals, selectedNodeIndex, selectedNodeIndex + 1);
        }
    }
}