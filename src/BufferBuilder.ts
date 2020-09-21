export class BufferBuilder {

    static appendNodePosition = (x: number, y: number, z: number, radius: number, buffer: number[]): void => {
        buffer.push(x);
        buffer.push(y);
        buffer.push(z);
        buffer.push(radius);
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
}