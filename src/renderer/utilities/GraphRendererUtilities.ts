import { GraphRenderer } from '../GraphRenderer';
import { BufferBuilder } from './BufferBuilder';

export class GraphRendererUtilities {

    /**
     * Updates the position (x, y, z, radius) of a specified node. This will cause the graph renderer to re-render on the next animation frame.
     * 
     * @param graphRenderer - the graph renderer that is rendering the node.
     * @param nodePositions - the node positions buffer storing the positions of the nodes.
     * @param id - the id of the node to update.
     * @param x - the new x position of the node.
     * @param y - the new y position of the node.
     * @param z - the new z position of the node.
     * @param radius - the new radius of the node.
     */
    static updateNodePosition = (graphRenderer: GraphRenderer, nodePositions: Float32Array, id: number, x: number, y: number, z: number, radius: number): void => {
        BufferBuilder.updateNodePosition(id, x, y, z, radius, nodePositions);
        graphRenderer.updateNodePositions(nodePositions, id, id + 1);
    }

    /**
     * Updates the visuals (foreground icon, background icon, color, selected) of a specified node. This will cause the graph renderer to re-render
     * on the next update frame.
     * 
     * @param graphRenderer - the graph renderer that is rendering the node.
     * @param nodeVisuals - the node visuals buffer storing the visuals of the nodes.
     * @param id - the id of the node to update.
     * @param foregroundIcon - the new foreground icon of the node.
     * @param backgroundIcon - the new background icon of the node.
     * @param color - the new color of the node.
     * @param selected - the new selected status of the node.
     */
    static updateNodeVisuals = (graphRenderer: GraphRenderer, nodeVisuals: Uint32Array, id: number, foregroundIcon: number, backgroundIcon: number, color: number, selected: boolean): void => {
        BufferBuilder.updateNodeVisuals(id, backgroundIcon, foregroundIcon, color, selected, nodeVisuals);
        graphRenderer.updateNodeVisuals(nodeVisuals, id, id + 1);
    }

    /**
     * Selects a node in the graph. This will cause the graph renderer to re-render on the next update frame.
     * 
     * @param graphRenderer - the graph renderer that is rendering the node.
     * @param nodeVisuals - the node visuals buffer storing the visuals of the nodes.
     * @param index - the index into the nodeVisuals array of the node to update.
     */
    static selectNode = (graphRenderer: GraphRenderer, nodeVisuals: Uint32Array, index: number): void => {
        BufferBuilder.selectNode(index, nodeVisuals);
        graphRenderer.updateNodeVisuals(nodeVisuals, index, index + 1);
    }

    /**
     * Deselects a node in the graph. This will cause the graph renderer to re-render on the next update frame.
     * 
     * @param graphRenderer - the graph renderer that is rendering the node.
     * @param nodeVisuals - the node visuals buffer storing the visuals of the nodes.
     * @param index - the index into the nodeVisuals array of the node to update.
     */
    static deselectNode = (graphRenderer: GraphRenderer, nodeVisuals: Uint32Array, index: number): void => {
        BufferBuilder.deselectNode(index, nodeVisuals);
        graphRenderer.updateNodeVisuals(nodeVisuals, index, index + 1);
    }
}
