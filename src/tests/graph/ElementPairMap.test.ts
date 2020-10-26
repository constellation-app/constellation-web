import { ElementPairMap } from "../../graph/ElementPairMap";

const initialParentCapacity = 8;
const initialChildCapacity = 8;

describe('Random add/delete test', () => {

    test('elements match test', () => {
        const linkCount = 16;
        const nodeCount = 1024;
        const linkLowNodes = new Array<number>(linkCount);
        const linkHighNodes = new Array<number>(linkCount);
        const included = new Array<boolean>(linkCount);

        for (let linkId = 0; linkId < linkCount; linkId++) {
            included[linkId] = false;
        }

        const e = new ElementPairMap(linkLowNodes, linkHighNodes, 16);

        for (let trial = 0; trial < 100; trial++) {
            const linkId = Math.floor(Math.random() * linkCount);
            if (included[linkId]) {
                e.deleteValue(linkId);
                included[linkId] = false;
            } else {
                let lowNode = Math.floor(Math.random() * nodeCount);
                let highNode = Math.floor(Math.random() * nodeCount);
                let exists = true;
                while (exists) {
                    lowNode = Math.floor(Math.random() * nodeCount);
                    highNode = Math.floor(Math.random() * nodeCount);
                    exists = false;
                    for (let i = 0; i < linkCount; i++) {
                        if (linkLowNodes[i] === lowNode && linkHighNodes[i] === highNode) {
                            exists = true;
                            break;
                        }
                    }
                }
                linkLowNodes[linkId] = lowNode;
                linkHighNodes[linkId] = highNode;
                included[linkId] = true;
                e.addValue(linkId);
            }


            for (let i = 0; i < linkCount; i++) {
                const linkId = e.getValue(linkLowNodes[i], linkHighNodes[i]);
                expect(linkId !== -1).toBe(included[i]);
            }
        }

        console.log("Bucket sized: ", e.getBucketSizes(), ", Average search length: ", e.getAverageSearchLength());
    });

});