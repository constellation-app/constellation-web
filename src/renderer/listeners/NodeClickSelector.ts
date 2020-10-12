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

    constructor(canvas: HTMLCanvasElement, camera: Camera, graphRenderer: GraphRenderer, nodePositions: Float32Array, nodeVisuals: Uint32Array, closest: boolean = false) {
        this.canvas = canvas;
        this.camera = camera;
        this.graphRenderer = graphRenderer;
        this.nodePositions = nodePositions;
        this.nodeVisuals = nodeVisuals;
        this.closest = closest;

        canvas.addEventListener("click", this.mouseClickHandler);
    }

    mouseClickHandler = (event: MouseEvent): void => {
      const selectedId = this.closest
            ? Selector.selectClosestNode(event.clientX, event.clientY, this.camera, this.nodePositions, this.nodePositions.length / 4)
            : Selector.selectNode(event.clientX, event.clientY, this.camera, this.nodePositions, this.nodePositions.length / 4);
      if (selectedId) {
        BufferBuilder.selectNode(selectedId, this.nodeVisuals);
        this.graphRenderer.updateNodeVisuals(this.nodeVisuals, selectedId, selectedId + 1);
      }
    }
}