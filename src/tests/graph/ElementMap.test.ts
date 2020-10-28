import { ElementMap } from "../../graph/ElementMap";

const initialParentCapacity = 8;
const initialChildCapacity = 8;

var e: ElementMap;

beforeEach(() => {
    e = new ElementMap(initialParentCapacity, initialChildCapacity);
});

describe('Random add/delete test', () => {

    test('elements match test', () => {
        const parentCount = 10;
        const childCount = 20;

        e.setParentCapacity(parentCount);
        e.setChildCapacity(childCount);

        const children = new Array<number[]>(parentCount);
        for (let parentId = 0; parentId < parentCount; parentId++) {
            children[parentId] = [];
        }
        const parents = new Array<number>(childCount);
        for (let childId = 0; childId < childCount; childId++) {
            parents[childId] = -1;
        }

        for (let trial = 0; trial < 100; trial++) {
            const childId = Math.floor(Math.random() * childCount);
            let parentId = parents[childId];
            if (parentId === -1) {
                parentId = Math.floor(Math.random() * parentCount);
                children[parentId].push(childId);
                parents[childId] = parentId;
                e.addChild(parentId, childId);
                // console.log("Added: ", childId, " to: ", parentId);
            } else {
                parents[childId] = -1
                children[parentId] = children[parentId].filter((value) => value !== childId);
                e.deleteChild(childId);
                // console.log("Removed: ", childId, " from: ", parentId);
            }

            for (let parentId = 0; parentId < parentCount; parentId++) {
                let count = e.getChildCount(parentId);
                expect(count).toBe(children[parentId].length);

                if (count > 0) {
                    let childId = e.getFirstChild(parentId);
                    for (let childPosition = count - 1; childPosition >= 0; childPosition--) {
                        expect(childId).toBe(children[parentId][childPosition]);
                        childId = e.getNextChild(childId);
                    }
                }
            }
        }
    });

});