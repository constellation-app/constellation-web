export class ElementPairMap {

    private static readonly A_MULTIPLIER = 302167;
    private static readonly B_MULTIPLIER = 101839;

    private readonly aValues: number[];
    private readonly bValues: number[];

    private readonly buckets: (number | undefined)[];
    private readonly nextIds: (number | undefined)[];
    private readonly previousIds: (number)[];

    constructor(aValues: number[], bValues: number[], bucketCount: number) {
        
        let newBucketCount = 1;
        while (newBucketCount < bucketCount) {
            newBucketCount *= 2;
        }

        this.aValues = aValues;
        this.bValues = bValues;

        this.buckets = new Array<number>(newBucketCount);
        this.nextIds = new Array<number>(aValues.length);
        this.previousIds = new Array<number>(aValues.length);
    }

    setBucketCount = (bucketCount: number): void => {
        if (bucketCount > this.buckets.length) {
            this.buckets.fill(undefined);
            
            let newBucketCount = this.buckets.length;
            while (newBucketCount < bucketCount) {
                newBucketCount *= 2;
            }

            this.buckets.length = newBucketCount;
        }
    }

    addValue = (id: number): void => {
        const hash = this.aValues[id] * ElementPairMap.A_MULTIPLIER + this.bValues[id] * ElementPairMap.B_MULTIPLIER;
        const bucket = hash & (this.buckets.length - 1);

        const firstId = this.buckets[bucket];

        if (firstId === undefined) {
            this.nextIds[id] = undefined;
            this.previousIds[id] = -bucket - 1;
            this.buckets[bucket] = id;
        } else {
            this.previousIds[firstId] = id;
            this.nextIds[id] = firstId;
            this.previousIds[id] = -bucket - 1;
            this.buckets[bucket] = id;
        }
    }

    deleteValue = (id: number): void => {
        const previousId = this.previousIds[id];
        const nextId = this.nextIds[id];

        if (previousId < 0) {
            this.buckets[-previousId - 1] = nextId;
        } else {
            this.nextIds[previousId] = nextId;
        }

        if (nextId !== undefined) {
            this.previousIds[nextId] = previousId;
        }
    }

    getValue = (aValue: number, bValue: number): number | undefined => {
        const hash = aValue * ElementPairMap.A_MULTIPLIER + bValue * ElementPairMap.B_MULTIPLIER;
        const bucket = hash & (this.buckets.length - 1);
        let id = this.buckets[bucket];

        while (id !== undefined) {
            if (this.aValues[id] === aValue && this.bValues[id] === bValue) {
                return id;
            }
            id = this.nextIds[id];
        }

        return undefined;
    }

    getAverageSearchLength = (): number => {
        let count = 0;
        let searchCount = 0;

        for (let bucket = 0; bucket < this.buckets.length; bucket++) {
            let id = this.buckets[bucket];
            let bucketSize = 0;
            while (id !== undefined) {
                bucketSize++;
                id = this.nextIds[id];
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
                id = this.nextIds[id];
            }
            while (bucketSizes.length <= bucketSize) {
                bucketSizes.push(0);
            }
            bucketSizes[bucketSize]++;
        }

        return bucketSizes;
    }
}