import { ElementList } from "./ElementList";

export class LinkList {

    private static readonly SOURCE_MULTIPLIER = 33;
    private static readonly DESTINATION_MULTIPLIER = 111;

    private links: ElementList;
    private sources: number[];
    private destinations: number[];

    private buckets: number[];
    private nextLink: number[];
    private prevLink: number[];
    
    private capacityIncreased = false;

    constructor(linkCapacity: number) {

        let bucketCapacity = 8;
        while (bucketCapacity < linkCapacity) {
            bucketCapacity *= 2;
        }
        
        this.links = new ElementList(linkCapacity);
        this.sources = new Array<number>(linkCapacity);
        this.destinations = new Array<number>(linkCapacity);

        this.buckets = new Array<number>(bucketCapacity);
        this.nextLink = new Array<number>(linkCapacity);
        this.prevLink = new Array<number>(linkCapacity);

        this.links.capacityListener = this.updateCapacity;
    }

    private updateCapacity = (capacity: number): void => {
        this.capacityIncreased = true;
    }

    private increaseCapacity = (capacity: number) => {
        this.sources.length = capacity;
        this.destinations.length = capacity;

        if (capacity > this.buckets.length) {
            let newBucketsLength = this.buckets.length * 2;
            while (newBucketsLength < capacity) {
                newBucketsLength *= 2;
            }
            
            this.buckets = new Array<number>(newBucketsLength);
            for (let position = 0; position < this.links.getCount(); position++) {
                const id = this.links.getId(position);
                const hash = this.sources[id] * LinkList.SOURCE_MULTIPLIER + this.destinations[id] * LinkList.DESTINATION_MULTIPLIER;
                const bucket = hash & (this.buckets.length - 1);

                const firstId = this.buckets[bucket];
                this.nextLink[id] = firstId;
                if (firstId !== undefined) {
                    this.prevLink[firstId] = id;
                }
                this.buckets[bucket] = id;
                this.prevLink[id] = -bucket - 1;
            }
        }
    }

    getCount = (): number => {
        return this.links.getCount();
    }

    getCapacity = (): number => {
        return this.links.getCapacity();
    }

    setCapacity = (capacity: number): void => {
        this.links.setCapacity(capacity);
    }

    exists = (id: number): boolean => {
        return this.links.exists(id);
    }

    getSource = (id: number):number => {
        return this.sources[id];
    }

    getDestination = (id: number):number => {
        return this.destinations[id];
    }

    add = (source: number, destination: number): number => {

        // Ensure that the source is the node with the lower id
        if (source > destination) {
            const temp = source;
            source = destination;
            destination = temp;
        }

        const hash = source * LinkList.SOURCE_MULTIPLIER + destination * LinkList.DESTINATION_MULTIPLIER;
        const bucket = hash & (this.buckets.length - 1);

        let id = this.buckets[bucket];
        while (id >= 0) {
            if (this.sources[id] === source && this.destinations[id] === destination) {
                return id;
            }
            id = this.nextLink[id];
        }

        id = this.links.add();

        this.sources[id] = source;
        this.destinations[id] = destination;

        const firstId = this.buckets[bucket];
        this.nextLink[id] = firstId;
        if (firstId !== undefined) {
            this.prevLink[firstId] = id;
        }
        this.buckets[bucket] = id;
        this.prevLink[id] = -bucket - 1;

        if (this.capacityIncreased) {
            this.increaseCapacity(this.links.getCapacity());
            this.capacityIncreased = false;
        }
        
        return id;
    }

    remove = (id: number): boolean => {
        if (!this.links.delete(id)) {
            return false;
        }
        const prev = this.prevLink[id];
        const next = this.nextLink[id];
        if (next !== undefined) {
            this.prevLink[next] = prev;
        }
        
        if (prev < 0) {
            this.buckets[-prev - 1] = next;
        } else {
            this.nextLink[prev] = next;
        }

        return true;
    }

    get = (source: number, destination: number): number => {

        // Ensure that the source is the node with the lower id
        if (source > destination) {
            const temp = source;
            source = destination;
            destination = temp;
        }

        const hash = source * LinkList.SOURCE_MULTIPLIER + destination * LinkList.DESTINATION_MULTIPLIER;
        const bucket = hash & (this.buckets.length - 1);

        let id = this.buckets[bucket];

        while (id >= 0) {
            if (this.sources[id] === source && this.destinations[id] === destination) {
                return id;
            }
            id = this.nextLink[id];
        }

        return -1;
    }

    getAverageSearchLength = (): number => {
        let count = 0;
        let searchCount = 0;

        for (let bucket = 0; bucket < this.buckets.length; bucket++) {
            let id = this.buckets[bucket];
            let bucketSize = 0;
            while (id !== undefined) {
                bucketSize++;
                id = this.nextLink[id];
            }
            count += bucketSize;
            searchCount += bucketSize * bucketSize;
        }

        return searchCount / count;
    }

    getBucketSizes = (): number[] => {
        const bucketSizes: number[] = [];

        for (let bucket = 0; bucket < this.buckets.length; bucket++) {
            let id = this.buckets[bucket];
            let bucketSize = 0;
            while (id !== undefined) {
                bucketSize++;
                id = this.nextLink[id];
            }
            while (bucketSizes.length <= bucketSize) {
                bucketSizes.push(0);
            }
            bucketSizes[bucketSize]++;
        }

        return bucketSizes;
    }
}