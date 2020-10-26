export class ElementMap {
    private childCount: number[];
    private firstChild: (number | undefined)[];
    private nextChild: (number | undefined)[];
    private previousChild: number[];

    constructor(parentCapacity: number, childCapacity: number) {
        this.childCount = new Array<number>(parentCapacity);
        this.firstChild = new Array<number>(parentCapacity);
        this.nextChild = new Array<number>(childCapacity);
        this.previousChild = new Array<number>(childCapacity);

        for (let parentId = 0; parentId < parentCapacity; parentId++) {
            this.childCount[parentId] = 0;
        }
    }

    setParentCapacity = (parentCapacity: number): void => {
        if (parentCapacity > this.childCount.length) {
            
            const originalCapacity = this.childCount.length;

            this.childCount.length = parentCapacity;
            this.firstChild.length = parentCapacity;

            for (let parentId = originalCapacity; parentId < parentCapacity; parentId++) {
                this.childCount[parentId] = 0;
            }
        }
    }

    setChildCapacity = (childCapacity: number): void => {
        this.nextChild.length = childCapacity;
        this.previousChild.length = childCapacity;
    }

    addChild = (parentId: number, childId: number): void => {
        if (this.childCount[parentId] === 0) {
            this.firstChild[parentId] = childId;
            this.nextChild[childId] = undefined;
            this.childCount[parentId] = 1;
        } else {
            const firstChildId = this.firstChild[parentId]!;
            this.previousChild[firstChildId] = childId;
            this.nextChild[childId] = firstChildId;
            this.firstChild[parentId] = childId;
            this.childCount[parentId]++;
        }
    }

    deleteChild = (parentId: number, childId: number): void => {
        const nextChildId = this.nextChild[childId];
        const previousChildId = this.previousChild[childId];

        if (nextChildId !== undefined) {
            this.previousChild[nextChildId] = previousChildId;
        }

        if (childId === this.firstChild[parentId]) {
            this.firstChild[parentId] = nextChildId;
        } else {
            this.nextChild[previousChildId] = nextChildId;
        }

        this.childCount[parentId]--;
    }

    getChildCount = (parentId: number): number => {
        return this.childCount[parentId];
    }
    
    getFirstChild = (parentId: number): number | undefined => {
        return this.firstChild[parentId];
    }

    getNextChild = (childId: number): number | undefined => {
        return this.nextChild[childId];
    }
}