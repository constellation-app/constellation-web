import { ElementList } from "./ElementList"
import { ElementMap } from "./ElementMap";
import { ElementPairMap } from "./ElementPairMap";

export class Graph {

    static readonly DEFAULT_CAPACITY_LISTENER = (elementType: number) => {};

    private static readonly LINK_CATEGORY_SWAPS = [0, 2, 1, 3, 4, 6, 5, 7];
    private static readonly EDGE_DIRECTION_SWAPS = [1, 0, 2];

    // Edge directions with respect to a link
    static readonly UPHILL = 0;
    static readonly DOWNHILL = 1;
    static readonly FLAT = 2;

    // Edge directions with respect to a node or link end
    static readonly OUTGOING = 0;
    static readonly INCOMING = 1;
    static readonly UNDIRECTED = 2;

    // Edge category masks
    static readonly NONE_CATEGORY = 0;
    static readonly OUTGOING_CATEGORY = 1;
    static readonly INCOMING_CATEGORY = 2;
    static readonly UNDIRECTED_CATEGORY = 4;

    static readonly NODE = 0;
    static readonly LINK = 1;
    static readonly EDGE = 2;
    static readonly TRANSACTION = 3;

    private readonly nodeList: ElementList;
    private readonly linkList: ElementList;
    private readonly edgeList: ElementList;
    private readonly transactionList: ElementList;

    private readonly elementLists: ElementList[];

    private readonly nodeLinkEndMap: ElementMap;
    private readonly linkEdgeMap: (number | undefined)[];
    private readonly edgeTransactionMap: ElementMap;

    private readonly linkLowNodeIds: number[];
    private readonly linkHighNodeIds: number[];

    private readonly edgeLinks: number[];

    private readonly linkMap: ElementPairMap;
    
    /**
     * A listener that is called when ever the capacity of an element type in the graph is increased.
     * This can be used to update datastructures that depend on these capacities such as attribute stores etc.
     * 
     * The elementType value passed with be one of Graph.NODE, Graph.LINK, Graph.EDGE or Graph.TRANSACTION.
     * The new capacity can then be looked up using getElementCapacity() on this graph.
     */
    private capacityListener: (elementType: number) => void = Graph.DEFAULT_CAPACITY_LISTENER;

    /**
     * Creates a new graph with the specified element capacities.
     * 
     * @param nodeCapacity - the initial node capacity of the graph.
     * @param linkCapacity - the initial link capacity of the graph.
     * @param edgeCapacity - the initial edge capacity of the graph.
     * @param transactionCapacity - the initial transaction capacity of the graph.
     */
    constructor(nodeCapacity: number, linkCapacity: number, edgeCapacity: number, transactionCapacity: number) {
        this.nodeList = new ElementList(nodeCapacity);
        this.linkList = new ElementList(nodeCapacity);
        this.edgeList = new ElementList(nodeCapacity);
        this.transactionList = new ElementList(nodeCapacity);
    
        this.elementLists = [this.nodeList, this.linkList, this.edgeList, this.transactionList];

        this.nodeLinkEndMap = new ElementMap(nodeCapacity * 8, linkCapacity * 2);
        this.linkEdgeMap = new Array<number>(linkCapacity * 3);
        this.edgeTransactionMap = new ElementMap(edgeCapacity, transactionCapacity);

        this.linkLowNodeIds = new Array<number>(linkCapacity);
        this.linkHighNodeIds = new Array<number>(linkCapacity);

        this.edgeLinks = new Array<number>(edgeCapacity);
        
        this.linkMap = new ElementPairMap(this.linkLowNodeIds, this.linkHighNodeIds, linkCapacity);

        this.nodeList.capacityListener = () => {
            const nodeCapacity = this.nodeList.getCapacity();
            this.nodeLinkEndMap.setParentCapacity(nodeCapacity * 8);
            this.capacityListener(Graph.NODE);
        }

        this.linkList.capacityListener = () => {
            const linkCapacity = this.linkList.getCapacity();
            this.nodeLinkEndMap.setChildCapacity(linkCapacity * 2);
            this.linkEdgeMap.length = linkCapacity * 3;
            this.linkLowNodeIds.length = linkCapacity;
            this.linkHighNodeIds.length = linkCapacity;
            this.capacityListener(Graph.LINK);
        }

        this.edgeList.capacityListener = () => {
            const edgeCapacity = this.edgeList.getCapacity();
            this.edgeTransactionMap.setParentCapacity(edgeCapacity);
            this.edgeLinks.length = edgeCapacity;
            this.capacityListener(Graph.EDGE);
        }

        this.transactionList.capacityListener = () => {
            const transactionCapacity = this.transactionList.getCapacity();
            this.edgeTransactionMap.setChildCapacity(transactionCapacity);
            this.capacityListener(Graph.TRANSACTION);
        }
    }

    public setCapacityListener(capacityListener: (elementType: number) => void): void {
        this.capacityListener = capacityListener;
    }

    /**
     * Returns the current capacity the graph has to store elements of the specified type. These capacities
     * will increase automatically as new elements are added to the graph.
     * 
     * @param elementType - the type of element. Must be Graph.NODE, Graph.LINK, Graph.EDGE or Graph.TRANSACTION.
     */
    getElementCapacity(elementType: number): number {
        return this.elementLists[elementType].getCapacity();
    }

    /**
     * Returns the number of elements of the specified type that exist in the graph.
     * 
     * @param elementType - the type of element. Must be Graph.NODE, Graph.LINK, Graph.EDGE or Graph.TRANSACTION.
     */
    getElementCount(elementType: number): number {
        return this.elementLists[elementType].getCount();
    }

    /**
     * Returns true if an element of the specified type and id exists in the graph.
     * 
     * @param elementType - the type of element. Must be Graph.NODE, Graph.LINK, Graph.EDGE or Graph.TRANSACTION.
     * @param elementId - the id of the element.
     */
    elementExists(elementType: number, elementId: number): boolean {
        return this.elementLists[elementType].exists(elementId);
    }

    /**
     * Adds a new node to the graph.
     * 
     * @returns the id of the new node.
     */
    addNode(): number {
        return this.nodeList.add();
    }

    /**
     * Returns the id of the link that exists between the 2 specified nodes, or undefined if no such link exists.
     * Links are undirected meaning that the same link will be returned if the 2 parameters are swapped.
     * 
     * @param nodeAId - the id of the first node.
     * @param nodeBId - the id of the second node.
     */
    getLink(nodeAId: number, nodeBId: number): number | undefined {
        if (nodeAId > nodeBId) {
            return this.linkMap.getValue(nodeBId, nodeAId);
        } else {
            return this.linkMap.getValue(nodeAId, nodeBId);
        }
    }

    /**
     * Adds a new link between the 2 specified nodes. If a link already exists between these 2 nodes then a new
     * link is not created and the id of the existing link is returned.
     * 
     * @param nodeAId - the id of the first node.
     * @param nodeBId - the id of the second node.
     * @returns the id of the new link, or undefined if a link was unable to be created.
     */
    addLink(nodeAId: number, nodeBId: number): number | undefined {
        if (!this.nodeList.exists(nodeAId) || !this.nodeList.exists(nodeBId)) {
            return undefined;
        }

        if (nodeAId > nodeBId) {
            var lowNodeId = nodeBId;
            var highNodeId = nodeAId;
        } else {
            var lowNodeId = nodeAId;
            var highNodeId = nodeBId;
        }

        let linkId = this.linkMap.getValue(lowNodeId, highNodeId);

        if (linkId === undefined) {
            linkId = this.linkList.add();
            this.linkLowNodeIds[linkId] = lowNodeId;
            this.linkHighNodeIds[linkId] = highNodeId;
            this.linkMap.addValue(linkId);

            this.nodeLinkEndMap.addChild(lowNodeId * 8, linkId * 2);
            this.nodeLinkEndMap.addChild(highNodeId * 8, linkId * 2 + 1);
        }

        return linkId;
    }

    /**
     * Adds a new edge to the specified link. This will only occur if the link currently exists.
     * 
     * @param linkId - the id of the link.
     * @param edgeDirection - the direction of the edge with respect to the link. Must be Graph.UPHILL, Graph.DOWNHILL or Graph.FLAT.
     * @returns the id of the new edge or undefined if the edge was not able to be created.
     */
    addEdge(linkId: number, edgeDirection: number): number | undefined {
        if (!this.linkList.exists(linkId)) {
            return undefined;
        }

        let edgeId = this.linkEdgeMap[linkId * 3 + edgeDirection];
        if (edgeId === undefined) {
            const lowNodeId = this.linkLowNodeIds[linkId];
            const highNodeId = this.linkHighNodeIds[linkId];
            
            const originalLinkCategory = (this.linkEdgeMap[linkId * 3] === undefined ? 0 : 1) 
                                    + (this.linkEdgeMap[linkId * 3 + 1] === undefined ? 0 : 2) 
                                    + (this.linkEdgeMap[linkId * 3 + 2] === undefined ? 0 : 4);
            const newLinkCategory = originalLinkCategory | (1 << edgeDirection);

            this.nodeLinkEndMap.deleteChild(linkId * 2);
            this.nodeLinkEndMap.deleteChild(linkId * 2 + 1);

            this.nodeLinkEndMap.addChild(lowNodeId * 8 + newLinkCategory, linkId * 2);
            this.nodeLinkEndMap.addChild(highNodeId * 8 + Graph.LINK_CATEGORY_SWAPS[newLinkCategory], linkId * 2 + 1);

            this.linkEdgeMap[linkId * 3 + edgeDirection] = edgeId = this.edgeList.add();
            this.edgeLinks[edgeId] = (linkId << 2) | edgeDirection;
        }

        return edgeId;
    }

    /**
     * Adds a new transaction to the specified edge. This will only occur if the edge currently exists.
     * 
     * @param edgeId - the id of the edge.
     * @returns the id of the new transaction or undefined if the transaction was not able to be created.
     */
    addTransaction(edgeId: number): number | undefined {

        // Ensure that the edge exists in the graph
        if (!this.edgeList.exists(edgeId)) {
            return undefined;
        }

        const transactionId = this.transactionList.add();
        this.edgeTransactionMap.addChild(edgeId, transactionId);

        return transactionId;
    }

    /**
     * Deletes a transaction from the graph. This will only occur if the transaction currently exists.
     * 
     * @param transactionId - the id of the transaction to be deleted.
     * @returns true if the transaction was successfully deleted.
     */
    deleteTransaction(transactionId: number): boolean {
        // Ensure that the transaction exists
        if (this.transactionList.delete(transactionId)) {

            // Delete the transaction from its edge
            this.edgeTransactionMap.deleteChild(transactionId);

            // Return true to indicate that the transaction was successfully deleted
            return true;
        }

        return false;
    }

    /**
     * Deletes an edge from the graph. This will only occur if the edge currently exists and has no connected transactions.
     * 
     * @param edgeId - the id of the edge to be deleted.
     * @returns true if the edge was successfully deleted.
     */
    deleteEdge(edgeId: number): boolean {
        if (this.edgeList.exists(edgeId) && this.edgeTransactionMap.getChildCount(edgeId) === 0) {
            const linkPointer = this.edgeLinks[edgeId];
            const linkId = linkPointer >> 2;
            const edgeDirection = linkPointer & 0x3;

            const lowNodeId = this.linkLowNodeIds[linkId];
            const highNodeId = this.linkHighNodeIds[linkId];
            
            const originalLinkCategory = (this.linkEdgeMap[linkId * 3] === undefined ? 0 : 1) 
                                    + (this.linkEdgeMap[linkId * 3 + 1] === undefined ? 0 : 2) 
                                    + (this.linkEdgeMap[linkId * 3 + 2] === undefined ? 0 : 4);
            const newLinkCategory = originalLinkCategory ^ (1 << edgeDirection);

            this.nodeLinkEndMap.deleteChild(linkId * 2);
            this.nodeLinkEndMap.deleteChild(linkId * 2 + 1);

            this.nodeLinkEndMap.addChild(lowNodeId * 8 + newLinkCategory, linkId * 2);
            this.nodeLinkEndMap.addChild(highNodeId * 8 + Graph.LINK_CATEGORY_SWAPS[newLinkCategory], linkId * 2 + 1);

            this.edgeList.delete(edgeId);
            this.linkEdgeMap[linkId * 3 + edgeDirection] = undefined;
            
            return true;
        } else {
            return false;
        }
    }

    /**
     * Deletes a link from the graph. This will only occur if the link currently exists and has not connected edges.
     * 
     * @param linkId - the id of the link to be deleted.
     * @returns true if the link was successfully deleted.
     */
    deleteLink(linkId: number): boolean {
        // Ensure that the link exists and has no edges
        if (this.linkList.exists(linkId) 
                && this.linkEdgeMap[linkId * 3] === undefined 
                && this.linkEdgeMap[linkId * 3 + 1] === undefined
                && this.linkEdgeMap[linkId * 3 + 2] === undefined) {
            
            // Delete the link from the global list of links
            this.linkList.delete(linkId);

            // Delete the link from the link hash map
            this.linkMap.deleteValue(linkId);

            // Delete the link from the low and high nodes
            // It must be in category 0 for both ends because it has no edges
            this.nodeLinkEndMap.deleteChild(linkId * 2);
            this.nodeLinkEndMap.deleteChild(linkId * 2 + 1);
            
            // Return true to indicate that the link was successfully removed
            return true;
        }
        return false;
    }

    /**
     * Deletes a node from the graph. This will only occur if the node currenly exists and has no connected links.
     * 
     * @param nodeId - the id of the node to be deleted.
     * @returns true if the node was successfully deleted.
     */
    deleteNode(nodeId: number): boolean {
        if (this.nodeList.exists(nodeId) 
            && this.nodeLinkEndMap.getChildCount(nodeId * 8) === 0
            && this.nodeLinkEndMap.getChildCount(nodeId * 8 + 1) === 0
            && this.nodeLinkEndMap.getChildCount(nodeId * 8 + 2) === 0
            && this.nodeLinkEndMap.getChildCount(nodeId * 8 + 3) === 0
            && this.nodeLinkEndMap.getChildCount(nodeId * 8 + 4) === 0
            && this.nodeLinkEndMap.getChildCount(nodeId * 8 + 5) === 0
            && this.nodeLinkEndMap.getChildCount(nodeId * 8 + 6) === 0
            && this.nodeLinkEndMap.getChildCount(nodeId * 8 + 7) === 0) {

                this.nodeList.delete(nodeId);
                return true;
            }
            return false;
    }

    /**
     * Returns the id of the edge that the specified transaction is connected to.
     * 
     * @param transactionId - the id of the transaction.
     */
    getTransactionEdgeId(transactionId: number): number {
        return this.edgeTransactionMap.getChildParent(transactionId);
    }

    /**
     * Returns the id of the link that the specified edge is connected to.
     * 
     * @param edgeId - the id of the edge.
     */
    getEdgeLinkId(edgeId: number): number {
        return this.edgeLinks[edgeId] >> 2;
    }

    /**
     * Returns the id of the source node of the specified edge. Undirected edges will return the node with
     * the lower id as their destination.
     * 
     * @param edgeId - the id of the edge.
     */
    getEdgeSourceNodeId(edgeId: number): number {
        const extendedLinkId = this.edgeLinks[edgeId];
        const linkId = extendedLinkId >> 2;
        const edgeDirection = extendedLinkId & 0x3;
        return edgeDirection == Graph.DOWNHILL ? this.linkHighNodeIds[linkId] : this.linkLowNodeIds[linkId];
    }

    /**
     * Returns the id of the destination node of the specified edge. Undirected edges will return the node with
     * the higher id as their destination.
     * 
     * @param edgeId - the id of the edge.
     */
    getEdgeDestinationNodeId(edgeId: number): number {
        const extendedLinkId = this.edgeLinks[edgeId];
        const linkId = extendedLinkId >> 2;
        const edgeDirection = extendedLinkId & 0x3;
        return edgeDirection == Graph.DOWNHILL ? this.linkLowNodeIds[linkId] : this.linkHighNodeIds[linkId];
    }

    /**
     * Returns the id of the node connected to this link with the lower id.
     * 
     * @param linkId - the id of the link.
     */
    getLinkLowNodeId(linkId: number): number {
        return this.linkLowNodeIds[linkId];
    }

    /**
     * Returns the id of the node connected to this link with the higher id.
     * 
     * @param linkId - the id of the link.
     */
    getLinkHighNodeId(linkId: number): number {
        return this.linkHighNodeIds[linkId];
    }

    /**
     * Returns the number of links that are connected to the specified node and have the specified combination of edges.
     * 
     * @param nodeId - the id of the node.
     * @param directionCategory - a mask representing the desired combination of edge directions the link must have.
     */
    getNodeLinkCount(nodeId: number, directionCategory: number): number {
        return this.nodeLinkEndMap.getChildCount(nodeId * 8 + directionCategory);
    }

    /**
     * Returns the id of the first link end attached to this specified node that has the specified combination of 
     * edges. All link ends that have this combination of edges can be iterated through by repeatedly calling getNextLinkEnd()
     * and passing the result of this call.
     * 
     * The combination of edges required is specified by providing a mask built from the combination of Graph.OUTGOING_CATEGORY, Graph.INCOMING_CATEGORY
     * and Graph.UNDIRECTED_CATEGORY. For example, all edges with outgoing and undirected edges but no incoming edges could be specified by
     * providing Graph.OUTGOING | Graph.UNDIRECTED.
     * 
     * If all links that have outgoing edges are required, then all category combinations that include Graph.OUTGOING must be examined. This 
     * is more easily done with a higher-level API.
     * 
     * @param nodeId - the id of the node.
     * @param directionCategory - a mask representing the desired combination of edge directions the link must have.
     */
    getFirstLinkEnd(nodeId: number, directionCategory: number): number | undefined {
        return this.nodeLinkEndMap.getFirstChild(nodeId * 8 + directionCategory);
    }

    /**
     * Returns the next link end in the list of link ends connected to the same node with the same combination of edges.
     * See getFirstLinkEnd for an explanation of edge combinations and edge categories.
     * 
     * @param linkEnd - the id of the link end.
     */
    getNextLinkEnd(linkEnd: number): number | undefined {
        return this.nodeLinkEndMap.getNextChild(linkEnd);
    }

    /**
     * Returns the id of the link to which this link end is connected.
     * 
     * @param linkEnd - the id of the link end.
     */
    getLinkEndLink(linkEnd: number): number {
        return linkEnd >> 2;
    }

    /**
     * Returns the link end for the specified link that is connected to the low node of the link.
     * 
     * @param linkId - the id of the link.
     */
    getLinkLowLinkEnd(linkId: number): number {
        return linkId << 1;
    }

    /**
     * Returns the link end for the specified link that is connected to the high node of the link.
     * 
     * @param linkId - the id of the link.
     */
    getLinkHighLinkEnd(linkId: number): number {
        return (linkId << 1) + 1;
    }

    /**
     * Returns the id of the node that is connected to the specified link end.
     * 
     * @param linkEnd - the id of the link end.
     */
    getLinkEndNode(linkEnd: number): number {
        return (linkEnd & 1) === 0 ? this.linkLowNodeIds[linkEnd >> 1] : this.linkHighNodeIds[linkEnd >> 1];
    }

    /**
     * Returns true if the specified link end is connected to the low node of the link.
     * 
     * @param linkEnd - the id of the link end.
     */
    isLinkEndLow(linkEnd: number): boolean {
        return (linkEnd & 1) === 0;
    }

    /**
     * Returns true if the specified link end is connected to the high node of the link.
     * 
     * @param linkEnd - the id of the link end.
     */
    isLinkEndHigh(linkEnd: number): boolean {
        return (linkEnd & 1) === 1;
    }

    /**
     * Returns the edge in the specified direction with respect to the specified link end.
     * 
     * @param linkEnd - the id of the link end.
     * @param direction - the direction of the desired edge. Must be either Graph.OUTGOING, Graph.INCOMING or Graph.UNDIRECTED.
     */
    getLinkEndEdge(linkEnd: number, direction: number): number | undefined {
        if ((linkEnd & 1) === 0) {
            return this.linkEdgeMap[(linkEnd >> 1) * 3 + direction];
        } else {
            return this.linkEdgeMap[(linkEnd >> 1) * 3 + Graph.EDGE_DIRECTION_SWAPS[direction]];
        }
    }

    /**
     * Returns the number of transactions connected to the specified edge.
     * 
     * @param edgeId - the id of the edge.
     */
    getEdgeTransactionCount(edgeId: number): number {
        return this.edgeTransactionMap.getChildCount(edgeId);
    }

    /**
     * Returns the id of the edge in the specified direction with respect to the specified link.
     * 
     * @param linkId - the id of the link.
     * @param edgeDirection - the direction of the desired edge. Must be either Graph.UPHILL, Graph.DOWNHILL or Graph.FLAT.
     */
    getLinkEdge(linkId: number, edgeDirection: number): number | undefined {
        return this.linkEdgeMap[linkId * 3 + edgeDirection];
    }
}