import { unescapeLeadingUnderscores } from "typescript";
import { Graph } from "../../graph/Graph";
import { ReferenceGraph } from "./ReferenceGraph";

var g: Graph;

beforeEach(() => {
    g = new Graph(1, 1, 1, 1);
});

describe('Transactions source and destination node ids are correct', () => {

    var n0: number;
    var n1: number;

    beforeEach(() => {
        g = new Graph(16, 16, 16, 16);
        n0 = g.addNode();
        expect(n0).toBe(0);
        n1 = g.addNode();
        expect(n1).toBe(1);
    });

    test('an uphill link', () => {
        const l = g.addLink(n0, n1);
        expect(l).toBe(0);

        expect(g.getNodeLinkCount(n0, Graph.NONE_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.UNDIRECTED_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.NONE_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.UNDIRECTED_CATEGORY)).toBe(0);
    });

    test('a downhill link', () => {
        const l = g.addLink(n1, n0);
        expect(l).toBe(0);

        expect(g.getNodeLinkCount(n0, Graph.NONE_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.UNDIRECTED_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.NONE_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.UNDIRECTED_CATEGORY)).toBe(0);
    });

    test('a loop link', () => {
        const l = g.addLink(n0, n0);
        expect(l).toBe(0);

        expect(g.getNodeLinkCount(n0, Graph.NONE_CATEGORY)).toBe(2);
        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.UNDIRECTED_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.NONE_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.UNDIRECTED_CATEGORY)).toBe(0);
    });

    test('an uphill edge', () => {
        const l = g.addLink(n0, n1);
        expect(l).toBe(0);

        const e = g.addEdge(l, Graph.UPHILL);
        expect(e).toBe(0);

        expect(g.getNodeLinkCount(n0, Graph.NONE_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.UNDIRECTED_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.NONE_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.INCOMING_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n1, Graph.UNDIRECTED_CATEGORY)).toBe(0);
    });

    test('an downhill edge', () => {
        const l = g.addLink(n0, n1);
        expect(l).toBe(0);

        const e = g.addEdge(l, Graph.DOWNHILL);
        expect(e).toBe(0);

        expect(g.getNodeLinkCount(n0, Graph.NONE_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n0, Graph.UNDIRECTED_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.NONE_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n1, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.UNDIRECTED_CATEGORY)).toBe(0);
    });

    test('a flat edge', () => {
        const l = g.addLink(n0, n1);
        expect(l).toBe(0);

        const e = g.addEdge(l, Graph.FLAT);
        expect(e).toBe(0);

        expect(g.getNodeLinkCount(n0, Graph.NONE_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.UNDIRECTED_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n1, Graph.NONE_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.UNDIRECTED_CATEGORY)).toBe(1);
    });

    test('a flat loop edge', () => {
        const l = g.addLink(n0, n0);
        expect(l).toBe(0);

        const e = g.addEdge(l, Graph.FLAT);
        expect(e).toBe(0);

        expect(g.getNodeLinkCount(n0, Graph.NONE_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.UNDIRECTED_CATEGORY)).toBe(2);
        expect(g.getNodeLinkCount(n1, Graph.NONE_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.UNDIRECTED_CATEGORY)).toBe(0);
    });

    test('a uphill loop edge', () => {
        const l = g.addLink(n0, n0);
        expect(l).toBe(0);

        const e = g.addEdge(l, Graph.UPHILL);
        expect(e).toBe(0);

        expect(g.getNodeLinkCount(n0, Graph.NONE_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n0, Graph.UNDIRECTED_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.NONE_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.UNDIRECTED_CATEGORY)).toBe(0);
    });

    test('a downhill loop edge', () => {
        const l = g.addLink(n0, n0);
        expect(l).toBe(0);

        const e = g.addEdge(l, Graph.DOWNHILL);
        expect(e).toBe(0);

        expect(g.getNodeLinkCount(n0, Graph.NONE_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n0, Graph.UNDIRECTED_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.NONE_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.UNDIRECTED_CATEGORY)).toBe(0);
    });

    test('an uphill directed transaction', () => {
        const l = g.addLink(n0, n1);
        const e = g.addEdge(l, Graph.UPHILL);
        const t = g.addTransaction(e);
        expect(t).toBe(0);
        expect(g.getTransactionEdgeId(0)).toBe(0);
        expect(g.getEdgeLinkId(0)).toBe(0);
        expect(g.getEdgeSourceNodeId(0)).toBe(n0);
        expect(g.getEdgeDestinationNodeId(0)).toBe(n1);
        expect(g.getEdgeLinkId(0)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.UNDIRECTED_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.INCOMING_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n1, Graph.UNDIRECTED_CATEGORY)).toBe(0);
    });

    test('an downhill directed transaction', () => {
        const l = g.addLink(n0, n1);
        const e = g.addEdge(l, Graph.DOWNHILL);
        const t = g.addTransaction(e);
        expect(t).toBe(0);
        expect(g.getTransactionEdgeId(0)).toBe(0);
        expect(g.getEdgeLinkId(0)).toBe(0);
        expect(g.getEdgeSourceNodeId(0)).toBe(n1);
        expect(g.getEdgeDestinationNodeId(0)).toBe(n0);
        expect(g.getEdgeLinkId(0)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n0, Graph.UNDIRECTED_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n1, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.UNDIRECTED_CATEGORY)).toBe(0);
    });

    test('an uphill undirected transaction', () => {
        const l = g.addLink(n0, n1);
        const e = g.addEdge(l, Graph.FLAT);
        const t = g.addTransaction(e);
        expect(t).toBe(0);
        expect(g.getTransactionEdgeId(0)).toBe(0);
        expect(g.getEdgeLinkId(0)).toBe(0);
        expect(g.getEdgeSourceNodeId(0)).toBe(n0);
        expect(g.getEdgeDestinationNodeId(0)).toBe(n1);
        expect(g.getEdgeLinkId(0)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.UNDIRECTED_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.UNDIRECTED_CATEGORY)).toBe(1);
    });

    test('an downhill undirected transaction', () => {
        const l = g.addLink(n0, n1);
        const e = g.addEdge(l, Graph.FLAT);
        const t = g.addTransaction(e);
        expect(t).toBe(0);
        expect(g.getTransactionEdgeId(0)).toBe(0);
        expect(g.getEdgeLinkId(0)).toBe(0);
        expect(g.getEdgeSourceNodeId(0)).toBe(n0);
        expect(g.getEdgeDestinationNodeId(0)).toBe(n1);
        expect(g.getEdgeLinkId(0)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.UNDIRECTED_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.UNDIRECTED_CATEGORY)).toBe(1);
    });

    test('an uphill and downhill loop transaction', () => {
        const l = g.addLink(n0, n0);
        const e0 = g.addEdge(l, Graph.UPHILL);
        const t0 = g.addTransaction(e0);
        expect(t0).toBe(0);
        const e1 = g.addEdge(l, Graph.DOWNHILL);
        const t1 = g.addTransaction(e1);
        expect(t1).toBe(1);

        expect(g.getTransactionEdgeId(0)).toBe(0);
        expect(g.getEdgeLinkId(0)).toBe(0);
        expect(g.getEdgeSourceNodeId(0)).toBe(n0);
        expect(g.getEdgeDestinationNodeId(0)).toBe(n0);

        expect(g.getTransactionEdgeId(1)).toBe(1);
        expect(g.getEdgeLinkId(1)).toBe(0);
        expect(g.getEdgeSourceNodeId(1)).toBe(n0);
        expect(g.getEdgeDestinationNodeId(1)).toBe(n0);

        expect(g.getEdgeLinkId(1)).toBe(0);

        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.UNDIRECTED_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY | Graph.OUTGOING_CATEGORY)).toBe(2);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.UNDIRECTED_CATEGORY)).toBe(0);
    });

    test('an uphill directed transaction and 2 downhill directed transactions', () => {
        const l = g.addLink(n0, n1);
        expect(l).toBe(0);

        const e0 = g.addEdge(l, Graph.UPHILL);
        expect(e0).toBe(0);
        
        const e1 = g.addEdge(l, Graph.DOWNHILL);
        expect(e1).toBe(e1);

        const t0 = g.addTransaction(e0);
        expect(t0).toBe(0);

        const t1 = g.addTransaction(e1);
        expect(t1).toBe(1);

        const t2 = g.addTransaction(e1);
        expect(t2).toBe(2);
        
        expect(g.getTransactionEdgeId(t0)).toBe(0);
        expect(g.getTransactionEdgeId(t1)).toBe(1);
        expect(g.getTransactionEdgeId(t2)).toBe(1);
        
        expect(g.getEdgeSourceNodeId(0)).toBe(0);
        expect(g.getEdgeDestinationNodeId(0)).toBe(1);

        expect(g.getEdgeSourceNodeId(1)).toBe(1);
        expect(g.getEdgeDestinationNodeId(1)).toBe(0);
        
        expect(g.getEdgeLinkId(0)).toBe(0);
        expect(g.getEdgeLinkId(1)).toBe(0);
        
        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.UNDIRECTED_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n0, Graph.OUTGOING_CATEGORY | Graph.INCOMING_CATEGORY)).toBe(1);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.INCOMING_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.UNDIRECTED_CATEGORY)).toBe(0);
        expect(g.getNodeLinkCount(n1, Graph.OUTGOING_CATEGORY | Graph.INCOMING_CATEGORY)).toBe(1);
    });
});

describe('Reference graph tests', () => {

    test('link counts match', () => {
        g.addNode();
        g.addNode();
        g.addLink(0, 1);
        
        const rg = new ReferenceGraph();
        rg.addNode();
        rg.addNode();
        rg.addLink(0, 1);

        const nodeId = 1;

        expect(g.getNodeLinkCount(nodeId, 0)).toBe(rg.getNodeLinkCount(nodeId, 0));

        const rgLinkEnds = rg.nodes.get(0)!.getNodeLinksByCategory();
        
        const gLinkPointers = new Set<number>();
        let linkPointer = g.getFirstLinkEnd(nodeId, 0);
        while (linkPointer !== undefined) {
            gLinkPointers.add(linkPointer);
            linkPointer = g.getNextLinkEnd(linkPointer);
        }
    });
});

describe('Random add/delete tests', () => {

    test('random add/delete link test', () => {
        const output = false;
        const rg = new ReferenceGraph();

        for (let trial = 0; trial < 500; trial++) {
            const operation = Math.floor(Math.random() * 7);
            switch (operation) {
                case 0: // Add node
                    const addNodeId = g.addNode();
                    if (output) console.log("Add node: ", addNodeId);
                    expect(addNodeId).toBe(rg.addNode());
                    break;
                case 1: // Delete node
                    const deleteNodeId = rg.getRandomId(Graph.NODE);
                    if (deleteNodeId !== undefined) {
                        const deleteNodeResult = g.deleteNode(deleteNodeId);
                        if (output) console.log("Delete node: ", deleteNodeId, deleteNodeResult);
                        expect(deleteNodeResult).toBe(rg.deleteNode(deleteNodeId));
                    }
                    break;
                case 2: // Add link
                    const idA = rg.getRandomId(Graph.NODE);
                    const idB = rg.getRandomId(Graph.NODE);
                    if (idA !== undefined && idB !== undefined) {
                        const addLinkId = g.addLink(idA, idB);
                        if (output) console.log("Add link: ", addLinkId, idA, idB);
                        expect(addLinkId).toBe(rg.addLink(idA, idB));
                    }
                    break;
                case 3: // Delete link
                    const deleteLinkId = rg.getRandomId(Graph.LINK);
                    if (deleteLinkId !== undefined) {
                        const deleteLinkResult = g.deleteLink(deleteLinkId);
                        if (output) console.log("Delete link: ", deleteLinkId, deleteLinkResult)
                        expect(deleteLinkResult).toBe(rg.deleteLink(deleteLinkId));
                    }
                    break;
                case 4: // Add edge
                    const addEdgeLinkId = rg.getRandomId(Graph.LINK);
                    if (addEdgeLinkId !== undefined) {
                        const addEdgeDirection = Math.floor(Math.random() * 3);
                        const addEdgeId = g.addEdge(addEdgeLinkId, addEdgeDirection);
                        if (output) console.log("Add edge: ", addEdgeId, addEdgeDirection, addEdgeLinkId);
                        expect(addEdgeId).toBe(rg.addEdge(addEdgeLinkId, addEdgeDirection));
                    }
                    break;
                case 5: // Delete edge
                    const deleteEdgeId = rg.getRandomId(Graph.EDGE);
                    if (deleteEdgeId !== undefined) {
                        const deleteEdgeResult = g.deleteEdge(deleteEdgeId);
                        if (output) console.log("Delete edge: ", deleteEdgeId, deleteEdgeResult);
                        expect(deleteEdgeResult).toBe(rg.deleteEdge(deleteEdgeId));
                    }
                    break;
                case 6: // Add transaction
                    const addTransactionEdgeId = rg.getRandomId(Graph.EDGE);
                    if (addTransactionEdgeId !== undefined) {
                        const addTransactionId = g.addTransaction(addTransactionEdgeId);
                        if (output) console.log("Add transaction: ", addTransactionId, addTransactionEdgeId);
                        expect(addTransactionId).toBe(rg.addTransaction(addTransactionEdgeId));
                    }
                    break;
                case 7: // Delete transaction
                    const deleteTransactionId = rg.getRandomId(Graph.TRANSACTION);
                    if (deleteTransactionId !== undefined) {
                        const deleteTrasactionResult = g.deleteTransaction(deleteTransactionId);
                        if (output) console.log("Delete transaction: ", deleteTransactionId, deleteTrasactionResult);
                        expect(deleteTrasactionResult).toBe(rg.deleteTransaction(deleteTransactionId));
                    }
                    break;
            }

            rg.compare(g);
        }
    });
});