import { AttributedGraph } from "../../graph/AttributedGraph";

const initialCapacity = 1;

var a: AttributedGraph;

beforeEach(() => {
    a = new AttributedGraph(initialCapacity, initialCapacity, initialCapacity, initialCapacity, initialCapacity);
});

describe('When an ElementList is created', () => {
    test('the count should be 0', () => {
        expect(a.getElementCount(AttributedGraph.ATTRIBUTE)).toBe(0);
    });

    test('it should have the capacity we specified', () => {
        expect(a.getElementCapacity(AttributedGraph.ATTRIBUTE)).toBe(initialCapacity);
    });

    test('all elements should not exist', () => {
        expect(a.elementExists(AttributedGraph.ATTRIBUTE, 0)).toBe(false);
    });
});

describe('Simple add/delete attribute test', () => {
    
    test('the element should have an id of 0', () => {
        const attributeId = a.addAttribute(AttributedGraph.NODE, "name")!;
        const nodeId = a.addNode();

        expect(attributeId).toBe(0);
        expect(a.getElementCount(AttributedGraph.ATTRIBUTE)).toBe(1);
        expect(a.getAttributeName(attributeId)).toBe("name");
        expect(a.getAttributeByName(AttributedGraph.NODE, "name")).toBe(attributeId);
        expect(a.getAttributeElementType(0)).toBe(AttributedGraph.NODE);
        expect(a.getElementTypeAttributeCount(AttributedGraph.NODE)).toBe(1);
        expect(a.getFirstElementTypeAttribute(AttributedGraph.NODE)).toBe(attributeId);

        expect(nodeId).toBe(0);

        a.setAttributeValue(attributeId, nodeId, "My Name");
        expect(a.getAttributeValue(attributeId, nodeId)).toBe("My Name");

        a.deleteAttribute(attributeId);

        expect(a.getElementCount(AttributedGraph.ATTRIBUTE)).toBe(0);
        expect(a.getAttributeByName(AttributedGraph.NODE, "name")).toBeUndefined();
        expect(a.getElementTypeAttributeCount(AttributedGraph.NODE)).toBe(0);
        expect(a.getFirstElementTypeAttribute(AttributedGraph.NODE)).toBeUndefined();
    });

    test('Attribute capacities should expand automatically when element capacities expand', () => {
        const attributeId = a.addAttribute(AttributedGraph.NODE, "name")!;

        for (let i = 0; i < 100; i++) {
            expect(a.addNode()).toBe(i);
        }
        
        expect(a.getElementCapacity(AttributedGraph.NODE)).toBe(128);

        a.setAttributeValue(attributeId, 99, "My Name");
        expect(a.getAttributeValue(attributeId, 99)).toBe("My Name");
    });

});