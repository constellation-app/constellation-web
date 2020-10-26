import { ElementList } from "./ElementList";

export class EdgeManager {

    // static readonly DEFAULT_CAPACITY_LISTENER: () => void = () => {};

    // static readonly UPHILL_EDGE = 0;
    // static readonly DOWNHILL_EDGE = 1;
    // static readonly FLAT_EDGE = 2;

    // private readonly edges: ElementList;
    
    // private readonly links: number[];
    // private readonly directions: number[];

    // capacityListener: () => void = ElementList.DEFAULT_CAPACITY_LISTENER;

    // constructor(edgeCapacity: number) {
    //     this.edges = new ElementList(edgeCapacity);
    //     this.links = new Array<number>(edgeCapacity);
    //     this.directions = new Array<number>(edgeCapacity);
        
    //     this.edges.capacityListener = this.increaseCapacity;
    // }

    // private increaseCapacity = (): void => {
    //     const capacity = this.edges.getCapacity();
    //     this.links.length = capacity;
    //     this.directions.length = capacity;

    //     this.capacityListener();
    // }

    // getCount = (): number => {
    //     return this.edges.getCount();
    // }

    // getCapacity = (): number => {
    //     return this.edges.getCapacity();
    // }

    // setCapacity = (capacity: number): void => {
    //     this.edges.setCapacity(capacity);
    // }

    // exists = (id: number): boolean => {
    //     return this.edges.exists(id);
    // }

    // add = (linkId: number, direction: number):number => {
    //     const id = this.edges.add();
    //     this.links[id] = linkId;
    //     this.directions[id] = direction;
    //     return id;
    // }

    // delete = (edgeId: number): void => {
    //     this.edges.delete(edgeId);
    // }

    // getLink = (edgeId: number): number => {
    //     return this.links[edgeId];
    // }

    // getDirection = (edgeId: number): number => {
    //     return this.directions[edgeId];
    // }
}