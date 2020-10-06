import { GraphRenderer } from "./renderer/GraphRenderer";
import { BufferBuilder } from "./renderer/utilities/BufferBuilder";

export class TestGraphs {

    // static loadConstellationGraph = (url: string, graphRenderer: GraphRenderer): void => {
    //     var xmlHttp = new XMLHttpRequest();
    //     xmlHttp.onreadystatechange = function() { 
    //         if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
    //             callback(xmlHttp.responseText);
    //     }
    //     xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    //     xmlHttp.send(null);
    // }

    static center = () => {
        var nodePositions: number[] = [];
        var nodeVisuals: number[] = [];

        BufferBuilder.appendNodePosition(10, 0, 10, 3, nodePositions);
        BufferBuilder.appendNodeVisuals(0, 2, 0x00FF00, false, nodeVisuals);

        return {
            nodePositions: new Float32Array(nodePositions),
            nodeVisuals: new Uint32Array(nodeVisuals),
            linkPositions: new Uint32Array(0)
        };
    }

    static closestNeighbours = (nodeCount: number, radius: number, transactionLength: number): any => {

        const colors = [0x0000FF, 0x00FF00, 0xFF0000]
        const backgroundImages = [0, 1];
        const foregroundImages = [2, 3];
        
        var nodePositions: number[] = [];
        var nodeVisuals: number[] = [];
        var createdNodeCount = 0;
        while (createdNodeCount < nodeCount) {
          const x = Math.random() * radius * 2 - radius;
          const y = Math.random() * radius * 2 - radius;
          const z = Math.random() * radius * 2 - radius;
          if (x * x + y * y + z * z < radius * radius) {
            BufferBuilder.appendNodePosition(x, y, z, 3, nodePositions);
            BufferBuilder.appendNodeVisuals(
                backgroundImages[Math.floor(Math.random() * backgroundImages.length)], 
                foregroundImages[Math.floor(Math.random() * foregroundImages.length)],
                colors[Math.floor(Math.random() * colors.length)],
                false,
                nodeVisuals
            );

            createdNodeCount += 1;
          }
        }

        
        var links: number[] = [];
        for (var i = 0; i < nodeCount; i++) {
            for (var j = i + 1; j < nodeCount; j++) {
                const dx = nodePositions[i * 4] - nodePositions[j * 4];
                const dy = nodePositions[i * 4 + 1] - nodePositions[j * 4 + 1];
                const dz = nodePositions[i * 4 + 2] - nodePositions[j * 4 + 2];
                if (dx * dx + dy * dy + dz * dz < transactionLength * transactionLength) {
                    const offset = 0;
                    const width = Math.random() + 0.125;
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    const arrow = Math.random() > 0.5;
                    BufferBuilder.appendLinkPosition(i, j, offset, width, color, arrow, links);
                }
            }
        }
        
        return {
            nodePositions: new Float32Array(nodePositions),
            nodeVisuals: new Uint32Array(nodeVisuals),
            linkPositions: new Uint32Array(links)
        };
    }
}