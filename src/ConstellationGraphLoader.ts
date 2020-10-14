import { BufferBuilder } from "./renderer/utilities/BufferBuilder";
import { Network } from "./renderer/utilities/Network";

export class ConstellationGraphLoader {

    static load = (url: string, callback: (nodePositions: Float32Array, nodeVisuals: Uint32Array, labels: string[], linkPositions: Uint32Array) => void): void => {
        Network.get(url, (status, response) => {
            if (status === 200) {
                const json = JSON.parse(response);
                
                const nodePositions: number[] = [];
                const nodeVisuals: number[] = [];
                const labels: string[] = [];
                const vertexIds: Map<number, number> = new Map();
                const linkPositions: number[] = [];

                const vertexData = json['vertex'][1]['data'];
                for (var nodeIndex = 0; nodeIndex < vertexData.length; nodeIndex++) {
                    const vertexId = vertexData[nodeIndex]["vx_id_"] as number;
                    const x = vertexData[nodeIndex]["x"];
                    const y = vertexData[nodeIndex]["y"];
                    const z = vertexData[nodeIndex]["z"];
                    const selected = vertexData[nodeIndex]['selected'];
                    const label = vertexData[nodeIndex]['label'] || "NO LABEL";
                    const radius = vertexData[nodeIndex]['nradius'] || 1;
                    const icon = vertexData[nodeIndex]['icon'];
                    const backgroundIcon = vertexData[nodeIndex]['background_icon'];

                    const color = ConstellationGraphLoader.loadColor(vertexData[nodeIndex]['color']);
                    
                    BufferBuilder.appendNodePosition(x, y, z, radius, nodePositions);
                    BufferBuilder.appendNodeVisuals(0, 2, color, selected, nodeVisuals);
                    labels.push(label);
                    vertexIds.set(vertexId, nodeIndex);
                }

                const transactionData = json['transaction'][1]['data'];
                for (var transactionIndex = 0; transactionIndex < transactionData.length; transactionIndex++) {
                    const sourceIndex = vertexIds.get(transactionData[transactionIndex]["vx_src_"] as number)!;
                    const destinationIndex = vertexIds.get(transactionData[transactionIndex]["vx_dst_"] as number)!;
                    
                    const color = ConstellationGraphLoader.loadColor(transactionData[transactionIndex]['color']);

                    BufferBuilder.appendLinkPosition(sourceIndex, destinationIndex, 0, 1, color, true, linkPositions);
                }

                callback(new Float32Array(nodePositions), new Uint32Array(nodeVisuals), labels, new Uint32Array(linkPositions));
            }
        });
    }

    private static loadColor = (colorNode: any): number => {
        const colorName = colorNode["name"];
        if (colorName) {
            console.log(colorName);
            return 0xFF0000;
        }
        const red = colorNode["red"];
        const green = colorNode["green"];
        const blue = colorNode["blue"];
        return BufferBuilder.createColor(red, green, blue);
    }
}