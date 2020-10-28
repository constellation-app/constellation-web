import { Graph } from './Graph';
import { ElementList } from './ElementList';
import { ElementMap } from './ElementMap';

export class AttributedGraph extends Graph {

    public static readonly ATTRIBUTE = 4;

    private readonly attributeList: ElementList;
    private readonly elementTypeMap: ElementMap;
    private readonly attributeNameMap: Map<string,number>[];
    private readonly attributeNames: Array<string>;
    private readonly attributeValues: Array<Array<any>>;

    private attributedCapacityListener: (elementType: number) => void = Graph.DEFAULT_CAPACITY_LISTENER;

    /**
     * Creates a new graph with the specified element capacities.
     * 
     * @param nodeCapacity - the initial node capacity of the graph.
     * @param linkCapacity - the initial link capacity of the graph.
     * @param edgeCapacity - the initial edge capacity of the graph.
     * @param transactionCapacity - the initial transaction capacity of the graph.
     * @param attributeCapacity = the initial attribute capacity of the graph.
     */
    constructor(nodeCapacity: number, linkCapacity: number, edgeCapacity: number, transactionCapacity: number, attributeCapacity: number) {
        super(nodeCapacity, linkCapacity, edgeCapacity, transactionCapacity);
        this.attributeList = new ElementList(attributeCapacity);
        this.elementTypeMap = new ElementMap(4, attributeCapacity);
        this.attributeNameMap = [new Map<string, number>(), new Map<string, number>(), new Map<string, number>(), new Map<string, number>()];
        this.attributeNames = new Array<string>(attributeCapacity);
        this.attributeValues = new Array<Array<any>>(attributeCapacity);

        this.attributeList.capacityListener = () => {
            const attributeCapacity = this.attributeList.getCapacity();
            this.elementTypeMap.setChildCapacity(attributeCapacity);
            this.attributeNames.length = attributeCapacity;
            this.attributeValues.length = attributeCapacity;
            this.attributedCapacityListener(AttributedGraph.ATTRIBUTE);
        };

        super.setCapacityListener((elementType: number) => {
            
            // Update the capacities of the attributes of the specified element type to reflect the new element capacity.
            const capacity = super.getElementCapacity(elementType);
            var attributeId = this.elementTypeMap.getFirstChild(elementType);
            while (attributeId !== undefined) {
                this.attributeValues[attributeId].length = capacity;
                attributeId = this.elementTypeMap.getNextChild(attributeId);
            }

            this.attributedCapacityListener(elementType);
        });
    }

    public setCapacityListener = (capacityListener: (elementType: number) => void): void => {
        this.attributedCapacityListener = capacityListener;
    }

    /**
     * Returns the current capacity the graph has to store elements of the specified type. These capacities
     * will increase automatically as new elements are added to the graph.
     * 
     * @param elementType - the type of element. Must be Graph.NODE, Graph.LINK, Graph.EDGE, Graph.TRANSACTION, AttributeGraph.ATTRIBUTE.
     */
    getElementCapacity(elementType: number): number {
        return elementType === AttributedGraph.ATTRIBUTE ? this.attributeList.getCapacity() : super.getElementCapacity(elementType);
    }

    /**
     * Returns the number of elements of the specified type that exist in the graph.
     * 
     * @param elementType - the type of element. Must be Graph.NODE, Graph.LINK, Graph.EDGE, Graph.TRANSACTION, AttributeGraph.ATTRIBUTE.
     */
    getElementCount(elementType: number): number {
        return elementType === AttributedGraph.ATTRIBUTE ? this.attributeList.getCount() : super.getElementCount(elementType);
    }

    /**
     * Returns true if an element of the specified type and id exists in the graph.
     * 
     * @param elementType - the type of element. Must be Graph.NODE, Graph.LINK, Graph.EDGE, Graph.TRANSACTION, AttributeGraph.ATTRIBUTE.
     * @param elementId - the id of the element.
     */
    elementExists(elementType: number, elementId: number): boolean {
        return elementType === AttributedGraph.ATTRIBUTE ? this.attributeList.exists(elementId) : super.elementExists(elementType, elementId);
    }

    /**
     * Adds a new attribute to this AttributedGraph that stores values for elements of the specified type.
     * 
     * @param elementType the element type of the elements that will have values stored by this attribute.
     * Must be AttributedGraph.NODE, AttributedGraph.LINK, AttributedGraph.EDGE, AttributedGraph.TRANSACTION.
     * @param name the name of the attribute. Must be unique for attributes with this element type.
     */
    addAttribute(elementType: number, name: string): number | undefined {
        if (name.length === 0 || this.attributeNameMap[elementType].has(name)) {
            return undefined;
        }

        const id = this.attributeList.add();
        this.attributeNameMap[elementType].set(name, id);
        this.elementTypeMap.addChild(elementType, id);
        this.attributeNames[id] = name;
        this.attributeValues[id] = new Array<any>(super.getElementCapacity(elementType));
        return id;
    }

    deleteAttribute(attributeId: number): boolean {
        if (this.attributeList.exists(attributeId)) {
            const elementType = this.elementTypeMap.getChildParent(attributeId);
            this.attributeList.delete(attributeId);
            this.attributeNameMap[elementType].delete(this.attributeNames[attributeId]);
            this.elementTypeMap.deleteChild(attributeId);
            this.attributeValues[attributeId] = [];
            return true;
        }
        return false;
    }

    getAttributeByName(elementType: number, name: string): number | undefined {
        return this.attributeNameMap[elementType].get(name);
    }

    getAttributeElementType(attributeId: number): number {
        return this.elementTypeMap.getChildParent(attributeId);
    }

    getAttributeName(attributeId: number): string {
        return this.attributeNames[attributeId];
    }

    getAttributeValue(attributeId: number, elementId: number): any {
        return this.attributeValues[attributeId][elementId];
    }

    setAttributeValue(attributeId: number, elementId: number, value: any): void {
        this.attributeValues[attributeId][elementId] = value;
    }

    getElementTypeAttributeCount(elementType: number): number {
        return this.elementTypeMap.getChildCount(elementType);
    }

    getFirstElementTypeAttribute(elementType: number): number | undefined {
        return this.elementTypeMap.getFirstChild(elementType);
    }

    getNextElementTypeAttribute(attributeId: number): number | undefined {
        return this.elementTypeMap.getNextChild(attributeId);
    }
}
