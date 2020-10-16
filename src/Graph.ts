export class Graph {

    private nodeCount = 0;
    private nodeId2Position: number[];
    private nodePosition2Id: number[];

    constructor(nodeCapacity: number) {
        this.nodeId2Position = Array<number>(nodeCapacity);
        this.nodePosition2Id = Array<number>(nodeCapacity);

        for (var nodePosition = 0; nodePosition < nodeCapacity; nodePosition++) {
            this.nodeId2Position[nodePosition] = nodePosition;
            this.nodePosition2Id[nodePosition] = nodePosition;
        }
    }

    getNodeCount = (): number => {
        return this.nodeCount;
    }

    getNodeCapacity = (): number => {
        return this.nodeId2Position.length;
    }

    setNodeCapacity = (nodeCapacity: number): void => {
        if (nodeCapacity > this.nodeId2Position.length) {
            this.nodeId2Position.length = nodeCapacity;
            this.nodePosition2Id.length = nodeCapacity;

            for (var nodePosition = this.nodeCount; nodePosition < nodeCapacity; nodePosition++) {
                this.nodeId2Position[nodePosition] = nodePosition;
                this.nodePosition2Id[nodePosition] = nodePosition;
            }
        }
    }

    addNodeWithId = (nodeId: number): void => {
        const nodePosition = this.nodeId2Position[nodeId];
        if (nodePosition < this.nodeCount) {
            const nextPosition = this.nodeCount;
            if (nextPosition !== nodePosition) {
                const nextId = this.nodePosition2Id[nextPosition];

                this.nodePosition2Id[nodePosition] = nextPosition;
                this.nodeId2Position[nextId] = nodePosition;

                this.nodePosition2Id[nextPosition] = nodeId;
                this.nodeId2Position[nodeId] = nextPosition;
            }
            this.nodeCount++;
        }
    }

    addNode = (): number => {
        if (this.nodeCount === this.nodeId2Position.length) {
            this.setNodeCapacity(this.nodeCount * 2);
        }

        this.nodeCount++;
        return this.nodePosition2Id[this.nodeCount];
    }

    nodeExists = (nodeId: number): boolean => {
        return this.nodeId2Position[nodeId] < this.nodeCount;
    }

    getNodeId = (nodePosition: number): number => {
        return this.nodePosition2Id[nodePosition];
    }

    getNodePosition = (nodeId: number): number => {
        return this.nodeId2Position[nodeId];
    }

    deleteNode = (nodeId: number): void => {
        const nodePosition = this.nodeId2Position[nodeId];
        if (nodePosition >= this.nodeCount) {
            const lastPosition = this.nodeCount - 1;
            if (lastPosition !== nodePosition) {
                const lastId = this.nodePosition2Id[lastPosition];

                this.nodePosition2Id[nodePosition] = lastId;
                this.nodeId2Position[lastId] = nodePosition;

                this.nodeId2Position[nodeId] = lastPosition;
                this.nodePosition2Id[lastPosition] = nodeId;
            }
            this.nodeCount--;
        }
    }
}