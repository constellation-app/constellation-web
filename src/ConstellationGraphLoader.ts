import { BufferBuilder } from "./renderer/utilities/BufferBuilder";
import { Network } from "./renderer/utilities/Network";
import { IconManager} from "./renderer/IconManager";

export class ConstellationGraphLoader {

    static load = (url: string, icon_manager: IconManager, callback: (nodePositions: Float32Array, nodeVisuals: Uint32Array, labels: string[],
                                           linkPositions: Uint32Array, vxIdPosMap: Map<number, number>,
                                           txIdPosMap: Map<number, number>) => void): void => {
        Network.get(url, (status, response) => {
            if (status === 200) {

                const json = JSON.parse(response);
                const nodePositions: number[] = [];
                const nodeVisuals: number[] = [];
                const labels: string[] = [];
                const vertexIds: Map<number, number> = new Map();
                const transactionIds: Map<number, number> = new Map();
                const linkPositions: number[] = [];

                const vertexData = json['vertex'][1]['data'];
                for (var nodeIndex = 0; nodeIndex < vertexData.length; nodeIndex++) {
                    const vertexId = vertexData[nodeIndex]["vx_id_"] as number;
                    const x = vertexData[nodeIndex]["x"];
                    const y = vertexData[nodeIndex]["y"];
                    const z = vertexData[nodeIndex]["z"];
                    const selected = vertexData[nodeIndex]['selected'];
                    const label = vertexData[nodeIndex]['Label'] || "vx" + vertexId;
                    const radius = vertexData[nodeIndex]['lradius'] || 1;
                    const icon = icon_manager.getIconId(vertexData[nodeIndex]['icon']);
                    const backgroundIcon = icon_manager.getIconId(vertexData[nodeIndex]['background_icon']);
                    const color = ConstellationGraphLoader.loadColor(vertexData[nodeIndex]['color']);

                    BufferBuilder.appendNodePosition(x, y, z, radius, nodePositions);
                    BufferBuilder.appendNodeVisuals(icon, backgroundIcon, color, selected, nodeVisuals);
                    labels.push(label);
                    vertexIds.set(vertexId, nodeIndex);
                }

                const transactionData = json['transaction'][1]['data'];
                for (var transactionIndex = 0; transactionIndex < transactionData.length; transactionIndex++) {
                    const transactionId = transactionData[transactionIndex]["tx_id_"] as number;
                    const sourceIndex = vertexIds.get(transactionData[transactionIndex]["vx_src_"] as number)!;
                    const destinationIndex = vertexIds.get(transactionData[transactionIndex]["vx_dst_"] as number)!;
                    
                    const color = ConstellationGraphLoader.loadColor(transactionData[transactionIndex]['color']);

                    BufferBuilder.appendLinkPosition(sourceIndex, destinationIndex, 0, 0.05, color, true, linkPositions);
                    transactionIds.set(transactionId, transactionIndex);
                }
                callback(new Float32Array(nodePositions), new Uint32Array(nodeVisuals), labels, new Uint32Array(linkPositions), vertexIds, transactionIds);
            }
            // Added to handle the case when an invalid ID of the graph was requested.
            else if(status === 404) {
                // TODO: Code to clear the buffers when no graph is available. 
                console.log("TODO: status = 404");
                const nodePositions: number[] = [];
                const nodeVisuals: number[] = [];
                const labels: string[] = [];
                const linkPositions: number[] = [];
                BufferBuilder.appendNodePosition(0, 0, 0, 0, nodePositions);
                BufferBuilder.appendNodeVisuals(0, 0, 0, false, nodeVisuals);
                BufferBuilder.appendLinkPosition(0, 0, 0, 0, 0, false, linkPositions);
                callback(new Float32Array(nodePositions), new Uint32Array(nodeVisuals), labels, new Uint32Array(linkPositions), new Map(), new Map());
            }
        });
    }

    static colorMap: Map<string, Array<number>> = new Map([
        ["Amethyst", [155,89,182,255]],
        ["Azure", [46,105,197,255]],
        ["Banana", [254,255,106,255]],
        ["Black", [0,0,0,255]],
        ["Blue", [0,0,255,255]],
        ["Blueberry", [153,179,255,255]],
        ["Brown", [102,51,0,255]],
        ["Carrot", [230,126,34,255]],
        ["Cherry", [222,36,70,255]],
        ["Chocolate", [119,95,77,255]],
        ["Clouds", [236,240,241,255]],
        ["Cyan", [0,255,255,255]],
        ["DarkGreen", [0,127,0,255]],
        ["DarkGrey", [169,169,169,255]],
        ["DarkOrange", [255,127,127,255]],
        ["Emerald", [46,204,79,255]],
        ["GoldenRod", [218,165,32,255]],
        ["Green", [0,204,0,255]],
        ["Grey", [153,153,153,255]],
        ["LightBlue", [51,153,255,255]],
        ["LightGreen", [0,255,51,255]],
        ["Magenta", [255,0,255,255]],
        ["Manilla", [255,230,153,255]],
        ["Melon", [179,230,179,255]],
        ["Musk", [255,116,147,255]],
        ["Navy", [0,0,128,255]],
        ["Night Sky", [27,30,36,255]],
        ["Olive", [128,128,0,255]],
        ["Orange", [255,102,0,255]],
        ["Peach", [255,218,185,255]],
        ["Pink", [255,192,203,255]],
        ["Purple", [102,0,153,255]],
        ["Red", [255,0,0,255]],
        ["Teal", [0,128,128,255]],
        ["Turquoise", [64,244,208,255]],
        ["Violet", [238,130,238,255]],
        ["White", [255,255,255,255]],
        ["Yellow", [255,255,0,255]]
    ]);

    private static loadColor = (colorNode: any): number => {
        const colorName = colorNode["name"];
        if (colorName) {
            if (ConstellationGraphLoader.colorMap.has(colorName) ) {
                var colorCodes = ConstellationGraphLoader.colorMap.get(colorName);
                // @ts-ignore
                var result = BufferBuilder.createColor(colorCodes[0], colorCodes[1], colorCodes[2]);
                return result;
            }
            console.log(colorName + ' is not found');
            return 0xFF0000;
        }

        const red = colorNode["red"];
        const green = colorNode["green"];
        const blue = colorNode["blue"];
        return BufferBuilder.createColor(red, green, blue);
    }
}