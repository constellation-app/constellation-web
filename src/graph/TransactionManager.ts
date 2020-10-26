import { ElementList } from "./ElementList";

export class TransactionManager extends ElementList {

    // private readonly edges: number[];

    // transactionCapacityListener: () => void = ElementList.DEFAULT_CAPACITY_LISTENER;

    // constructor(transactionCapacity: number) {
    //     super(transactionCapacity);
    //     this.edges = new Array<number>(transactionCapacity);

    //     this.capacityListener = this.increaseCapacity;
    // }

    // private increaseCapacity = (): void => {
    //     this.edges.length = this.getCapacity();
    //     this.transactionCapacityListener();
    // }

    // getTransactionEdge = (transactionId: number): number => {
    //     return this.edges[transactionId] || -1;
    // }

    // addTransaction = (edgeId: number): number => {
    //     const id = this.add();
    //     this.edges[id] = edgeId;
    //     return id;
    // }

    // deleteTransaction = (transactionId: number): void => {
    //     this.delete(transactionId);
    // }
}