export class BufferBuilder {

    /**
     * Creates a color value suitable for providing to other methods in the BufferBuider class.
     * 
     * @param red - the red component of the color in the range 0.0 - 1.0.
     * @param green - the green component of the color in the range 0.0 - 1.0.
     * @param blue - the blue component of the color in the range 0.0 - 1.0.
     */
    static createColor = (red: number, green: number, blue: number): number => {
        return (Math.floor(red * 255) << 16) | (Math.floor(green * 255) << 8) | Math.floor(blue * 255);
    }

    /**
     * Appends a new node to the specified node positions buffer.
     * 
     * @param x - the x position of the node.
     * @param y - the y position of the node.
     * @param z - the z position of the node.
     * @param radius - the radius of the node.
     * @param buffer - the node positions buffer to append the new node to.
     */
    static appendNodePosition = (x: number, y: number, z: number, radius: number, buffer: number[]): void => {
        buffer.push(x);
        buffer.push(y);
        buffer.push(z);
        buffer.push(radius);
    }

    /**
     * Updates the position of an existing node in the specified node positions buffer.
     * 
     * @param id - the id of the node.
     * @param x - the new x position of the node.
     * @param y - the new y position of the node.
     * @param z - the new z position of the node.
     * @param radius - the new radius of the node.
     * @param buffer - the node positions storing the position of the node.
     */
    static updateNodePosition = (id: number, x: number, y: number, z: number, radius: number, buffer: Float32Array): void => {
        const offset = id * 4;
        buffer[offset] = x;
        buffer[offset + 1] = y;
        buffer[offset + 2] = z;
        buffer[offset + 3] = radius;
    }

    /** 
     * Appends a new node to the specified node visuals buffer.
     * 
     * @param foregroundIcon - the foreground icon of the node.
     * @param backgroundIcon - the background icon of the node.
     * @param color - the color of the node.
     * @param selected - the selected status of the node.
     * @param buffer - the node positions buffer to append the node to.
     */
    static appendNodeVisuals = (foregroundIcon: number, backgroundIcon: number, color: number, selected: boolean, buffer: number[]): void => {
        buffer.push((backgroundIcon << 16) | foregroundIcon);
        buffer.push(color | (selected ? 0x1000000 : 0));
    }

    /**
     * Updates the visuals of an existing node in the specified node visuals buffer.
     * 
     * @param id - the id of the node to update.
     * @param foregroundIcon - the new foreground icon of the node.
     * @param backgroundIcon - the new background icon of the node.
     * @param color - the new color of the node.
     * @param selected - the new selected status of the node.
     * @param buffer - the node visuals buffer storing the visuals of the node.
     */
    static updateNodeVisuals = (id: number, foregroundIcon: number, backgroundIcon: number, color: number, selected: boolean, buffer: Uint32Array): void => {
        const offset = id * 2;
        buffer[offset] = (backgroundIcon << 16) | foregroundIcon;
        buffer[offset + 1] = color | (selected ? 0x1000000 : 0);
    }

    /**
     * Appends a new link to the specified link positions buffer.
     * 
     * @param sourceNode - the id of the source node of this link.
     * @param destinationNode - the id of the destination node of this link.
     * @param linkOffset - the horizontal offset of this link (0 indicates the line between the centers of the nodes).
     * @param linkWidth - the width of the link.
     * @param color - the color of the link.
     * @param arrow - whether or not the link should display an arrow at its destination end.
     * @param buffer - the link positions buffer to append the link to.
     */
    static appendLinkPosition = (
        sourceNode: number, 
        destinationNode: number,  
        linkOffset: number, 
        linkWidth: number,
        color: number,
        arrow: boolean,
        buffer: number[]): void => {

        buffer.push(sourceNode);
        buffer.push(destinationNode);
        buffer.push((Math.floor((linkOffset + 128) * 256) << 16) | Math.floor(linkWidth * 256));
        buffer.push(color | ((arrow ? 1 : 0) << 24));
    }

    /**
     * Updates a node visuals buffer to cause the specified node to be selected.
     * If the node is already selected then this call has no effect.
     * 
     * @param id - the id of the node.
     * @param nodeVisuals - the node visuals buffer storing the visuals of the node.
     */
    static selectNode(id: number, nodeVisuals: Uint32Array): void {
        nodeVisuals[id * 2 + 1] |= 0x1000000;
    }

    /**
     * Updates a node visuals buffer to cause the specified node to be deselected.
     * If the node is already deselected then this call has no effect.
     * 
     * @param id - the id of the node.
     * @param nodeVisuals - the node visuals buffer storing the visuals of the node.
     */
    static deselectNode(id: number, nodeVisuals: Uint32Array): void {
        nodeVisuals[id * 2 + 1] &= 0xFEFFFFFF;
    }

    /**
     * Returns the selected status of a node in the specified node visuals buffer.
     * 
     * @param id - the id of the node.
     * @param nodeVisuals - the node visuals buffer holding the visuals of the node.
     */
    static isSelectedNode(id: number, nodeVisuals: Uint32Array): boolean {
        return (nodeVisuals[id * 2 + 1] | 0x1000000) !== 0;
    }

    /**
     * Returns the x position of a node in the specified node positions buffer.
     * 
     * @param id - the id of the node.
     * @param nodePositions - the node positions buffer holding the position of the node.
     */
    static getNodeX(id: number, nodePositions: Float32Array): number {
        return nodePositions[id * 4];
    }

    /**
     * Returns the y position of a node in the specified node positions buffer.
     * 
     * @param id - the id of the node.
     * @param nodePositions - the node positions buffer holding the position of the node.
     */
    static getNodeY(id: number, nodePositions: Float32Array): number {
        return nodePositions[id * 4 + 1];
    }

    /**
     * Returns the z position of a node in the specified node positions buffer.
     * 
     * @param id - the id of the node.
     * @param nodePositions - the node positions buffer holding the position of the node.
     */
    static getNodeZ(id: number, nodePositions: Float32Array): number {
        return nodePositions[id * 4 + 2];
    }

    /**
     * Returns the radius of a node in the specified node positions buffer.
     * 
     * @param id - the id of the node.
     * @param nodePositions - the node positions buffer holding the position of the node.
     */
    static getNodeRadius(id: number, nodePositions: Float32Array): number {
        return nodePositions[id * 4 + 3];
    }

    /**
     * Returns the foreground icon of a node in the specified node visuals buffer.
     * 
     * @param id - the id of the node.
     * @param nodeVisuals - the node visuals buffer holding the visuals of the node.
     */
    static getNodeForegroundIcon(id: number, nodeVisuals: Uint32Array): number {
        return nodeVisuals[id * 2] & 0xFFFF;
    }

    /**
     * Returns the background icon of a node in the specified node visuals buffer.
     * 
     * @param id - the id of the node.
     * @param nodeVisuals - the node visuals buffer holding the visuals of the node.
     */
    static getNodeBackgroundIcon(id: number, nodeVisuals: Uint32Array): number {
        return nodeVisuals[id * 2] >> 16;
    }

    /**
     * Returns the color of a node in the specified node visuals buffer.
     * 
     * @param id - the id of the node.
     * @param nodeVisuals - the node visuals buffer holding the visuals of the node.
     */
    static getNodeColor(id: number, nodeVisuals: Uint32Array): number {
        return nodeVisuals[id * 2 + 1] & 0xFFFFFF;
    }
}