export class BufferBuilder {

    static createColor = (red: number, green: number, blue: number): number => {
        return (Math.floor(red * 255) << 16) | (Math.floor(green * 255) << 8) | Math.floor(blue * 255);
    }

    static appendNodePosition = (x: number, y: number, z: number, radius: number, buffer: number[]): void => {
        buffer.push(x);
        buffer.push(y);
        buffer.push(z);
        buffer.push(radius);
    }

    static updateNodePosition = (nodePos: number, x: number, y: number, z: number, radius: number, buffer: number[]): void => {
        const xPos = nodePos * 4;
        buffer[xPos] = x;
        buffer[xPos + 1] = y;
        buffer[xPos + 2] = z;
        buffer[xPos + 3] = radius;
    }

    static appendNodeVisuals = (backgroundIcon: number, foregoundIcon: number, color: number, selected: boolean, buffer: number[]): void => {
        buffer.push((backgroundIcon << 16) | foregoundIcon);
        buffer.push(color | (selected ? 0x1000000 : 0));
    }

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

    static selectNode(id: number, nodeVisuals: Uint32Array): void {
        nodeVisuals[id * 2 + 1] |= 0x1000000;
    }

    static deselectNode(id: number, nodeVisuals: Uint32Array): void {
        nodeVisuals[id * 2 + 1] &= 0xFEFFFFFF;
    }
}