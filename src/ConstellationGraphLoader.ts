import { GraphRenderer } from "./renderer/GraphRenderer";
import { BufferBuilder } from "./renderer/utilities/BufferBuilder";
import { Network } from "./renderer/utilities/Network";

export class ConstellationGraphLoader {

    static load = (url: string, callback: (nodePositions: Float32Array, nodeVisuals: Uint32Array, labels: string[]) => void): void => {
        Network.get(url, (status, response) => {
            if (status === 200) {
                const json = JSON.parse(response);
                
                const vertexData = json['vertex'][1]['data'];
                const nodePositions: number[] = [];
                const nodeVisuals: number[] = [];
                const labels: string[] = [];
                const vertexIds: Map<number, number> = new Map();

                for (var nodeIndex = 0; nodeIndex < vertexData.length; nodeIndex++) {
                    const vertexId = vertexData[nodeIndex]["vx_id_"] as number;
                    const x = vertexData[nodeIndex]["x"];
                    const y = vertexData[nodeIndex]["y"];
                    const z = vertexData[nodeIndex]["z"];
                    const selected = vertexData[nodeIndex]['selected'];
                    const label = vertexData[nodeIndex]['label'];
                    const radius = vertexData[nodeIndex]['nradius'];
                    const icon = vertexData[nodeIndex]['icon'];
                    const backgroundIcon = vertexData[nodeIndex]['background_icon'];

                    const red = vertexData[nodeIndex]['color']["red"];
                    const green = vertexData[nodeIndex]['color']["green"];
                    const blue = vertexData[nodeIndex]['color']["blue"];

                    const color = BufferBuilder.createColor(red, green, blue);
                    
                    BufferBuilder.appendNodePosition(x, y, z, radius, nodePositions);
                    BufferBuilder.appendNodeVisuals(0, 2, color, selected, nodeVisuals);
                    labels.push(label);
                    vertexIds.set(vertexId, nodeIndex);
                }

                const transactionData = json['transaction'][1]['data'];
                for (var transactionIndex = 0; transactionIndex < transactionData.length; transactionIndex++) {
                    const sourceIndex = vertexIds.get(transactionData[transactionIndex]["vx_src_"] as number);
                    const destinationIndex = vertexIds.get(transactionData[transactionIndex]["vx_dst_"] as number);
                    console.log(sourceIndex, destinationIndex);
                }

                callback(new Float32Array(nodePositions), new Uint32Array(nodeVisuals), labels);
            }
        });
    }
}