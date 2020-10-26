import { ElementList } from "./ElementList";

export class LinkManager extends ElementList {

    // static readonly DEFAULT_CAPACITY_LISTENER: () => void = () => {};

    // private static readonly SOURCE_MULTIPLIER = 302167;
    // private static readonly DESTINATION_MULTIPLIER = 101839;

    // private readonly vertices: number[];
    // private readonly opposite
    // private buckets: number[];
    // private nextBucketLinks: number[];
    // private prevBucketLinks: number[];
    
    // capacityListener: () => void = LinkManager.DEFAULT_CAPACITY_LISTENER;

    // constructor(linkCapacity: number) {
    //     super(linkCapacity);

    //     let bucketCapacity = 1;
    //     while (bucketCapacity < linkCapacity) {
    //         bucketCapacity *= 2;
    //     }
        
    //     this.sources = new Array<number>(linkCapacity);
    //     this.destinations = new Array<number>(linkCapacity);
    //     this.edges = new Array<number>(linkCapacity * 3);

    //     this.buckets = new Array<number>(bucketCapacity);
    //     this.nextBucketLinks = new Array<number>(linkCapacity);
    //     this.prevBucketLinks = new Array<number>(linkCapacity);

    //     this.links.capacityListener = this.increaseCapacity;
    // }

    // private increaseCapacity = (): void => {
    //     const capacity = this.links.getCapacity();

    //     this.sources.length = capacity;
    //     this.destinations.length = capacity;
    //     this.edges.length = capacity * 3;

    //     if (capacity > this.buckets.length) {
    //         let newBucketsLength = this.buckets.length * 2;
    //         while (newBucketsLength < capacity) {
    //             newBucketsLength *= 2;
    //         }
            
    //         this.buckets = new Array<number>(newBucketsLength);
    //         for (let id = 0; id < this.links.getCount(); id++) {
    //             const hash = this.sources[id] * LinkManager.SOURCE_MULTIPLIER + this.destinations[id] * LinkManager.DESTINATION_MULTIPLIER;
    //             const bucket = hash & (this.buckets.length - 1);

    //             const firstId = this.buckets[bucket];
    //             this.buckets[bucket] = id;
                
    //             this.nextBucketLinks[id] = firstId;
    //             this.prevBucketLinks[id] = -bucket - 1;
                
    //             if (firstId !== undefined) {
    //                 this.prevBucketLinks[firstId] = id;
    //             }
    //         }
    //     }

    //     this.capacityListener();
    // }

    // getCount = (): number => {
    //     return this.links.getCount();
    // }

    // getCapacity = (): number => {
    //     return this.links.getCapacity();
    // }

    // setCapacity = (capacity: number): void => {
    //     this.links.setCapacity(capacity);
    // }

    // exists = (id: number): boolean => {
    //     return this.links.exists(id);
    // }

    // getSource = (id: number):number => {
    //     return this.sources[id];
    // }

    // getDestination = (id: number):number => {
    //     return this.destinations[id];
    // }

    // setEdge = (linkId: number, direction: number, edgeId: number): void => {
    //     this.edges[linkId * 3 + direction] = edgeId;
    // }

    // getEdge = (linkId: number, direction: number): number => {
    //     return this.edges[linkId * 3 + direction] || -1;
    // }

    // add = (source: number, destination: number): number => {

    //     // Ensure that the source is the node with the lower id
    //     if (source > destination) {
    //         const temp = source;
    //         source = destination;
    //         destination = temp;
    //     }

    //     // Calculate the hash of the link based on its source and destination vertex ids.
    //     const hash = source * LinkManager.SOURCE_MULTIPLIER + destination * LinkManager.DESTINATION_MULTIPLIER;
    //     let bucket = hash & (this.buckets.length - 1);

    //     // Check if the link already exists by looking in the hash map
    //     let id = this.buckets[bucket];
    //     while (id >= 0) {
    //         if (this.sources[id] === source && this.destinations[id] === destination) {
    //             return id;
    //         }
    //         id = this.nextBucketLinks[id];
    //     }

    //     // Add a new link to the underlying ElementList.
    //     // This may cause the capacity of the ElementList to increase and
    //     // therefore cause the capacity of this LinkList to increase also.
    //     id = this.links.add();

    //     // If the capacity has increased because of the add, then the buckets 
    //     // may have been recreated. Therefore we need to recalculate the bucket.
    //     bucket = hash & (this.buckets.length - 1);

    //     // Record the source and destination vertex ids
    //     this.sources[id] = source;
    //     this.destinations[id] = destination;

    //     // Update the hash map
    //     const firstId = this.buckets[bucket];
    //     this.nextBucketLinks[id] = firstId;
    //     if (firstId !== undefined) {
    //         this.prevBucketLinks[firstId] = id;
    //     }
    //     this.buckets[bucket] = id;
    //     this.prevBucketLinks[id] = -bucket - 1;
        
    //     return id;
    // }

    // remove = (id: number): boolean => {
    //     if (!this.links.delete(id)) {
    //         return false;
    //     }
    //     const prev = this.prevBucketLinks[id];
    //     const next = this.nextBucketLinks[id];
    //     if (next !== undefined) {
    //         this.prevBucketLinks[next] = prev;
    //     }
        
    //     if (prev < 0) {
    //         this.buckets[-prev - 1] = next;
    //     } else {
    //         this.nextBucketLinks[prev] = next;
    //     }

    //     return true;
    // }

    // get = (source: number, destination: number): number => {

    //     // Ensure that the source is the node with the lower id
    //     if (source > destination) {
    //         const temp = source;
    //         source = destination;
    //         destination = temp;
    //     }

    //     const hash = source * LinkManager.SOURCE_MULTIPLIER + destination * LinkManager.DESTINATION_MULTIPLIER;
    //     const bucket = hash & (this.buckets.length - 1);

    //     let id = this.buckets[bucket];

    //     while (id >= 0) {
    //         if (this.sources[id] === source && this.destinations[id] === destination) {
    //             return id;
    //         }
    //         id = this.nextBucketLinks[id];
    //     }

    //     return -1;
    // }

    // getAverageSearchLength = (): number => {
    //     let count = 0;
    //     let searchCount = 0;

    //     for (let bucket = 0; bucket < this.buckets.length; bucket++) {
    //         let id = this.buckets[bucket];
    //         let bucketSize = 0;
    //         while (id !== undefined) {
    //             bucketSize++;
    //             id = this.nextBucketLinks[id];
    //         }
    //         count += bucketSize;
    //         searchCount += bucketSize * bucketSize;
    //     }

    //     return searchCount / count;
    // }

    // getBucketSizes = (): number[] => {
    //     const bucketSizes: number[] = [];

    //     for (let bucket = 0; bucket < this.buckets.length; bucket++) {
    //         let id = this.buckets[bucket];
    //         let bucketSize = 0;
    //         while (id !== undefined) {
    //             bucketSize++;
    //             id = this.nextBucketLinks[id];
    //         }
    //         while (bucketSizes.length <= bucketSize) {
    //             bucketSizes.push(0);
    //         }
    //         bucketSizes[bucketSize]++;
    //     }

    //     return bucketSizes;
    // }
}