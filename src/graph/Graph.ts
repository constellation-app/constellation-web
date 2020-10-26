import { ElementList } from "./ElementList"
import { ElementMap } from "./ElementMap";
import { ElementPairMap } from "./ElementPairMap";

export class Graph {

    static readonly DEFAULT_CAPACITY_LISTENER = (elementType: number) => {};

    private static readonly LINK_CATEGORY_SWAPS = [0, 2, 1, 3, 4, 6, 5, 7];

    static readonly UPHILL = 0;
    static readonly DOWNHILL = 1;
    static readonly FLAT = 2;

    static readonly NONE = 0;
    static readonly OUTGOING = 1;
    static readonly INCOMING = 2;
    static readonly UNDIRECTED = 4;

    static readonly NODE = 0;
    static readonly LINK = 1;
    static readonly EDGE = 2;
    static readonly TRANSACTION = 3;

    private readonly nodeList: ElementList;
    private readonly linkList: ElementList;
    private readonly edgeList: ElementList;
    private readonly transactionList: ElementList;

    private readonly elementLists: ElementList[];

    private readonly nodeLinkMap: ElementMap;
    private readonly linkEdgeMap: (number | undefined)[];
    private readonly edgeTransactionMap: ElementMap;

    private readonly linkLowNodeIds: number[];
    private readonly linkHighNodeIds: number[];

    private readonly edgeLinks: number[];
    private readonly transactionEdges: number[];

    private readonly linkMap: ElementPairMap;
    
    capacityListener: (elementType: number) => void = Graph.DEFAULT_CAPACITY_LISTENER;

    constructor(nodeCapacity: number, linkCapacity: number, edgeCapacity: number, transactionCapacity: number) {
        this.nodeList = new ElementList(nodeCapacity);
        this.linkList = new ElementList(nodeCapacity);
        this.edgeList = new ElementList(nodeCapacity);
        this.transactionList = new ElementList(nodeCapacity);
    
        this.elementLists = [this.nodeList, this.linkList, this.edgeList, this.transactionList];

        this.nodeLinkMap = new ElementMap(nodeCapacity * 8, linkCapacity * 2);
        this.linkEdgeMap = new Array<number>(linkCapacity * 3);
        this.edgeTransactionMap = new ElementMap(edgeCapacity, transactionCapacity);

        this.linkLowNodeIds = new Array<number>(linkCapacity);
        this.linkHighNodeIds = new Array<number>(linkCapacity);

        this.edgeLinks = new Array<number>(edgeCapacity);
        this.transactionEdges = new Array<number>(transactionCapacity);

        this.linkMap = new ElementPairMap(this.linkLowNodeIds, this.linkHighNodeIds, linkCapacity);

        this.nodeList.capacityListener = () => {
            const nodeCapacity = this.nodeList.getCapacity();
            this.nodeLinkMap.setParentCapacity(nodeCapacity * 8);
            this.capacityListener(Graph.NODE);
        }

        this.linkList.capacityListener = () => {
            const linkCapacity = this.linkList.getCapacity();
            this.nodeLinkMap.setChildCapacity(linkCapacity * 2);
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
            this.transactionEdges.length = transactionCapacity;
            this.capacityListener(Graph.TRANSACTION);
        }
    }

    getElementCapacity = (elementType: number): number => {
        return this.elementLists[elementType].getCapacity();
    }

    getElementCount = (elementType: number): number => {
        return this.elementLists[elementType].getCount();
    }

    elementExists = (elementType: number, elementId: number): boolean => {
        return this.elementLists[elementType].exists(elementId);
    }

    addNode = (): number => {
        return this.nodeList.add();
    }

    getLink = (nodeAId: number, nodeBId: number): number => {
        if (nodeAId > nodeBId) {
            return this.linkMap.getValue(nodeBId, nodeAId);
        } else {
            return this.linkMap.getValue(nodeAId, nodeBId);
        }
    }

    addLink = (nodeAId: number, nodeBId: number): number => {
        if (!this.nodeList.exists(nodeAId) || !this.nodeList.exists(nodeBId)) {
            return -1;
        }

        if (nodeAId > nodeBId) {
            var lowNodeId = nodeBId;
            var highNodeId = nodeAId;
        } else {
            var lowNodeId = nodeAId;
            var highNodeId = nodeBId;
        }

        let linkId = this.linkMap.getValue(lowNodeId, highNodeId);

        if (linkId === -1) {
            linkId = this.linkList.add();
            this.linkLowNodeIds[linkId] = lowNodeId;
            this.linkHighNodeIds[linkId] = highNodeId;
            this.linkMap.addValue(linkId);

            this.nodeLinkMap.addChild(lowNodeId * 8, linkId * 2);
            this.nodeLinkMap.addChild(highNodeId * 8, linkId * 2 + 1);
        }

        return linkId;
    }

    addEdge = (linkId: number, edgeDirection: number): number => {
        if (!this.linkList.exists(linkId)) {
            return -1;
        }

        let edgeId = this.linkEdgeMap[linkId * 3 + edgeDirection];
        if (edgeId === undefined) {
            const lowNodeId = this.linkLowNodeIds[linkId];
            const highNodeId = this.linkHighNodeIds[linkId];
            
            const originalLinkCategory = (this.linkEdgeMap[linkId * 3] === undefined ? 0 : 1) 
                                    + (this.linkEdgeMap[linkId * 3 + 1] === undefined ? 0 : 2) 
                                    + (this.linkEdgeMap[linkId * 3 + 2] === undefined ? 0 : 4);
            const newLinkCategory = originalLinkCategory | (1 << edgeDirection);

            this.nodeLinkMap.deleteChild(lowNodeId * 8 + originalLinkCategory, linkId * 2);
            this.nodeLinkMap.deleteChild(highNodeId * 8 + Graph.LINK_CATEGORY_SWAPS[originalLinkCategory], linkId * 2 + 1);

            this.nodeLinkMap.addChild(lowNodeId * 8 + newLinkCategory, linkId * 2);
            this.nodeLinkMap.addChild(highNodeId * 8 + Graph.LINK_CATEGORY_SWAPS[newLinkCategory], linkId * 2 + 1);

            this.linkEdgeMap[linkId * 3 + edgeDirection] = edgeId = this.edgeList.add();
            this.edgeLinks[edgeId] = (linkId << 2) | edgeDirection;
        }

        return edgeId;
    }

    addTransaction = (edgeId: number): number => {

        // Ensure that the edge exists in the graph
        if (!this.edgeList.exists(edgeId)) {
            return -1;
        }

        const transactionId = this.transactionList.add();
        this.transactionEdges[transactionId] = edgeId;

        this.edgeTransactionMap.addChild(edgeId, transactionId);

        return transactionId;
    }

    deleteTransaction = (transactionId: number): boolean => {
        // Ensure that the transaction exists
        if (this.transactionList.delete(transactionId)) {

            // Delete the transaction from its edge
            this.edgeTransactionMap.deleteChild(this.transactionEdges[transactionId], transactionId);

            // Return true to indicate that the transaction was successfully deleted
            return true;
        }

        return false;
    }

    deleteEdge = (edgeId: number): boolean => {
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

            this.nodeLinkMap.deleteChild(lowNodeId * 8 + originalLinkCategory, linkId * 2);
            this.nodeLinkMap.deleteChild(highNodeId * 8 + Graph.LINK_CATEGORY_SWAPS[originalLinkCategory], linkId * 2 + 1);

            this.nodeLinkMap.addChild(lowNodeId * 8 + newLinkCategory, linkId * 2);
            this.nodeLinkMap.addChild(highNodeId * 8 + Graph.LINK_CATEGORY_SWAPS[newLinkCategory], linkId * 2 + 1);

            this.edgeList.delete(edgeId);
            this.linkEdgeMap[linkId * 3 + edgeDirection] = undefined;
            
            return true;
        } else {
            return false;
        }
    }

    deleteLink = (linkId: number): boolean => {
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
            this.nodeLinkMap.deleteChild(this.linkLowNodeIds[linkId] * 8, linkId * 2);
            this.nodeLinkMap.deleteChild(this.linkHighNodeIds[linkId] * 8, linkId * 2 + 1);
            
            // Return true to indicate that the link was successfully removed
            return true;
        }
        return false;
    }

    deleteNode = (nodeId: number): boolean => {
        if (this.nodeList.exists(nodeId) 
            && this.nodeLinkMap.getChildCount(nodeId * 8) === 0
            && this.nodeLinkMap.getChildCount(nodeId * 8 + 1) === 0
            && this.nodeLinkMap.getChildCount(nodeId * 8 + 2) === 0
            && this.nodeLinkMap.getChildCount(nodeId * 8 + 3) === 0
            && this.nodeLinkMap.getChildCount(nodeId * 8 + 4) === 0
            && this.nodeLinkMap.getChildCount(nodeId * 8 + 5) === 0
            && this.nodeLinkMap.getChildCount(nodeId * 8 + 6) === 0
            && this.nodeLinkMap.getChildCount(nodeId * 8 + 7) === 0) {

                this.nodeList.delete(nodeId);
                return true;
            }
            return false;
    }

    getTransactionEdgeId = (transactionId: number): number => {
        return this.transactionEdges[transactionId];
    }

    getEdgeLinkId = (edgeId: number): number => {
        return this.edgeLinks[edgeId] >> 2;
    }

    getEdgeSourceNodeId = (edgeId: number): number => {
        const extendedLinkId = this.edgeLinks[edgeId];
        const linkId = extendedLinkId >> 2;
        const edgeDirection = extendedLinkId & 0x3;
        return edgeDirection == Graph.DOWNHILL ? this.linkHighNodeIds[linkId] : this.linkLowNodeIds[linkId];
    }

    getEdgeDestinationNodeId = (edgeId: number): number => {
        const extendedLinkId = this.edgeLinks[edgeId];
        const linkId = extendedLinkId >> 2;
        const edgeDirection = extendedLinkId & 0x3;
        return edgeDirection == Graph.DOWNHILL ? this.linkLowNodeIds[linkId] : this.linkHighNodeIds[linkId];
    }

    getLinkLowNodeId = (linkId: number): number => {
        return this.linkLowNodeIds[linkId];
    }

    getLinkHighNodeId = (linkId: number): number => {
        return this.linkHighNodeIds[linkId];
    }

    getNodeLinkCount = (nodeId: number, directionMask: number): number => {
        return this.nodeLinkMap.getChildCount(nodeId * 8 + directionMask);
    }

    getFirstLinkPointer = (nodeId: number, directionMask: number): number | undefined => {
        return this.nodeLinkMap.getFirstChild(nodeId * 8 + directionMask);
    }

    getNextLinkPointer = (linkPointer: number): number | undefined => {
        return this.nodeLinkMap.getNextChild(linkPointer);
    }

    getLinkFromPointer = (linkPointer: number): number => {
        return linkPointer >> 2;
    }

    getEdgeTransactionCount = (edgeId: number): number => {
        return this.edgeTransactionMap.getChildCount(edgeId);
    }

    getLinkEdge = (linkId: number, edgeDirection: number): number | undefined => {
        return this.linkEdgeMap[linkId * 3 + edgeDirection];
    }
}