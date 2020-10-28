import { unescapeLeadingUnderscores } from 'typescript';
import { Graph } from '../../graph/Graph';

export class ReferenceGraph {
    readonly nodes = new Map<number, Node>();
    readonly links = new Map<number, Link>();
    readonly edges = new Map<number, Edge>();
    readonly transactions = new Map<number, Transaction>();

    readonly availableNodeIds = new Array<number>();
    readonly availableLinkIds = new Array<number>();
    readonly availableEdgeIds = new Array<number>();
    readonly availableTransactionIds = new Array<number>();

    readonly elementMaps: Map<number, Object>[] = [this.nodes, this.links, this.edges, this.transactions];
    readonly availableIds: Array<number>[] = [ this.availableNodeIds, this.availableLinkIds, this.availableEdgeIds, this.availableTransactionIds];

    getRandomId = (elementType: number): number | undefined => {
        if (this.elementMaps[elementType].size === 0) {
            return undefined;
        }
        const ids = Array.from(this.elementMaps[elementType].keys());
        return ids[Math.floor(Math.random() * ids.length)];
    }

    addNode = (): number => {
        const nodeId = this.availableNodeIds.length === 0 ? this.nodes.size : this.availableNodeIds.pop()!;
        this.nodes.set(nodeId, new Node(nodeId));
        return nodeId;
    }

    addLink = (nodeAId: number, nodeBId: number): number => {
        let nodeA = this.nodes.get(nodeAId);
        if (nodeA === undefined) { 
            return -1;
        }

        let nodeB = this.nodes.get(nodeBId);
        if (nodeB === undefined) {
            return -1;
        }

        if (nodeA.id > nodeB.id) {
            const temp = nodeA;
            nodeA = nodeB;
            nodeB = temp;
        }

        let link = nodeA.links.get(nodeB.id);

        if (link === undefined) {
            const linkId = this.availableLinkIds.length === 0 ? this.links.size : this.availableLinkIds.pop()!;
            link = new Link(linkId, nodeA, nodeB);
            this.links.set(linkId, link);
            nodeA.links.set(nodeB.id, link);
            nodeB.links.set(nodeA.id, link);
        }

        return link.id;
    }

    addEdge = (linkId: number, edgeDirection: number): number => {
        const link = this.links.get(linkId);
        if (link === undefined) {
            return -1;
        }

        let edge = link.edges[edgeDirection];
        if (edge === undefined) {
            const edgeId = this.availableEdgeIds.length === 0 ? this.edges.size : this.availableEdgeIds.pop()!;
            edge = new Edge(edgeId, link, edgeDirection);
            link.edges[edgeDirection] = edge;
            this.edges.set(edgeId, edge);
        }

        return edge.id;
    }

    addTransaction = (edgeId: number): number => {
        const edge = this.edges.get(edgeId);
        if (edge === undefined) {
            return -1;
        }

        const transactionId = this.availableTransactionIds.length === 0 ? this.transactions.size : this.availableTransactionIds.pop()!;
        const transaction = new Transaction(transactionId, edge);
        edge.transactions.set(transactionId, transaction);
        this.transactions.set(transactionId, transaction);

        return transactionId;
    }

    deleteTransaction = (transactionId: number): boolean => {
        const transaction = this.transactions.get(transactionId);
        if (transaction !== undefined) {
            transaction.edge.transactions.delete(transactionId);
            this.transactions.delete(transactionId);
            this.availableTransactionIds.push(transactionId);
            return true;
        }
        return false;
    }

    deleteEdge = (edgeId: number): boolean => {
        const edge = this.edges.get(edgeId);
        if (edge !== undefined && edge.transactions.size === 0) {
            this.edges.delete(edgeId);
            edge.link.edges[edge.direction] = undefined;
            this.availableEdgeIds.push(edgeId);
            return true;
        }
        return false;
    }

    deleteLink = (linkId: number): boolean => {
        const link = this.links.get(linkId);
        if (link !== undefined && link.edges[0] === undefined  && link.edges[1] === undefined && link.edges[2] === undefined) {
            link.lowNode.links.delete(link.highNode.id);
            link.highNode.links.delete(link.lowNode.id);
            this.links.delete(linkId);
            this.availableLinkIds.push(linkId);
            return true;
        }
        return false;
    }

    deleteNode = (nodeId: number): boolean => {
        const node = this.nodes.get(nodeId);
        if (node !== undefined && node.links.size === 0) {
            this.nodes.delete(nodeId);
            this.availableNodeIds.push(nodeId);
            return true;
        }
        return false;
    }

    getNodeLinkCount = (nodeId: number, directionCategory: number): number => {
        return this.nodes.get(nodeId)!.getNodeLinksByCategory()[directionCategory].size;
    }

    compare = (graph: Graph): void => {
        expect(graph.getElementCount(Graph.NODE)).toBe(this.nodes.size);
        expect(graph.getElementCount(Graph.LINK)).toBe(this.links.size);
        expect(graph.getElementCount(Graph.EDGE)).toBe(this.edges.size);
        expect(graph.getElementCount(Graph.TRANSACTION)).toBe(this.transactions.size);

        for (let elementType = 0; elementType < 4; elementType++) {
            this.elementMaps[elementType].forEach((element, elementId) => {
                expect(graph.elementExists(elementType, elementId)).toBe(true);
            })
            this.availableIds[elementType].forEach((availableId) => {
                expect(graph.elementExists(elementType, availableId)).toBe(false);
            });
        }

        this.nodes.forEach((node, nodeId) => {
            const nodeLinksByCategory = node.getNodeLinksByCategory();
            for (let directionMask = 0; directionMask < 8; directionMask++) {
                expect(graph.getNodeLinkCount(nodeId, directionMask)).toBe(nodeLinksByCategory[directionMask].size);

                let linkEnd = graph.getFirstLinkEnd(nodeId, directionMask);
                while (linkEnd !== undefined) {
                    expect(nodeLinksByCategory[directionMask].has(linkEnd)).toBe(true);
                    nodeLinksByCategory[directionMask].delete(linkEnd);
                    linkEnd = graph.getNextLinkEnd(linkEnd);
                }
            }
        });

        this.links.forEach((link, linkId) => {
            expect(graph.getLinkLowNodeId(linkId)).toBe(link.lowNode.id);
            expect(graph.getLinkHighNodeId(linkId)).toBe(link.highNode.id);
            
            for (let edgeDirection = 0; edgeDirection < 3; edgeDirection++) {
                const edge = link.edges[edgeDirection];
                if (edge === undefined) {
                    expect(graph.getLinkEdge(linkId, edgeDirection)).toBe(undefined);
                } else {
                    expect(graph.getLinkEdge(linkId, edgeDirection)).toBe(edge.id);
                }
            }
        });

        this.edges.forEach((edge, edgeId) => {
            expect(graph.getEdgeLinkId(edgeId)).toBe(edge.link.id);
            expect(graph.getEdgeTransactionCount(edgeId)).toBe(edge.transactions.size);
        });

        this.transactions.forEach((transaction, transactionId) => {
            expect(graph.getTransactionEdgeId(transactionId)).toBe(transaction.edge.id);
        });
    }
}

class Node {
    readonly id: number;
    readonly links = new Map<number, Link>();

    constructor(id: number) {
        this.id = id;
    }

    getNodeLinksByCategory = (): Set<number>[] => {
        const counts = [new Set<number>(), new Set<number>(), new Set<number>(), new Set<number>(), new Set<number>(), new Set<number>(), new Set<number>(), new Set<number>()];
        this.links.forEach((link, otherNodeId) => {
            if (this.id === link.lowNode.id) {
                const lowCategory = (link.edges[0] === undefined ? 0 : 1) | (link.edges[1] === undefined ? 0 : 2) | (link.edges[2] === undefined ? 0 : 4);
                counts[lowCategory].add(link.id * 2);
            }
            if (this.id === link.highNode.id) {
                const highCategory = (link.edges[0] === undefined ? 0 : 2) | (link.edges[1] === undefined ? 0 : 1) | (link.edges[2] === undefined ? 0 : 4);
                counts[highCategory].add(link.id * 2 + 1);
            }
        });
        return counts;
    }
}

class Link {
    readonly id: number;
    readonly lowNode: Node;
    readonly highNode: Node;
    readonly edges = new Array<Edge | undefined>(undefined, undefined, undefined);

    constructor(id: number, lowNode: Node, highNode: Node) {
        this.id = id;
        this.lowNode = lowNode;
        this.highNode = highNode;
    }
}

class Edge {
    readonly id: number
    readonly link: Link;
    readonly direction: number;
    readonly transactions = new Map<number, Transaction>();

    constructor(id: number, link: Link, direction: number) {
        this.id = id;
        this.link = link;
        this.direction = direction;
    }
}

class Transaction {
    readonly id: number;
    readonly edge: Edge;

    constructor(id: number, edge: Edge) {
        this.id = id;
        this.edge = edge;
    }
}