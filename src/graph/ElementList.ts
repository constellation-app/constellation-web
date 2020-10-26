export class ElementList {

    static readonly DEFAULT_CAPACITY_LISTENER: () => void = () => {};

    private count = 0;
    private id2Position: number[];
    private position2Id: number[];
    
    capacityListener: () => void = ElementList.DEFAULT_CAPACITY_LISTENER;

    constructor(capacity: number) {
        this.id2Position = Array<number>(capacity);
        this.position2Id = Array<number>(capacity);
        
        for (var nodePosition = 0; nodePosition < capacity; nodePosition++) {
            this.id2Position[nodePosition] = nodePosition;
            this.position2Id[nodePosition] = nodePosition;
        }
    }

    public getCount(): number {
        return this.count;
    }

    public getCapacity(): number {
        return this.id2Position.length;
    }

    public setCapacity(capacity: number): void {
        if (capacity > this.id2Position.length) {
            this.increaseCapacity(capacity);
        }
    }

    private increaseCapacity = (capacity: number): void => {
        this.id2Position.length = capacity;
        this.position2Id.length = capacity;

        for (var position = this.count; position < capacity; position++) {
            this.id2Position[position] = position;
            this.position2Id[position] = position;
        }

        this.capacityListener();
    }

    public addWithId(id: number): void {
        const nodePosition = this.id2Position[id];
        if (nodePosition >= this.count) {
            const nextPosition = this.count;
            if (nextPosition !== nodePosition) {
                const nextId = this.position2Id[nextPosition];

                this.position2Id[nodePosition] = nextPosition;
                this.id2Position[nextId] = nodePosition;

                this.position2Id[nextPosition] = id;
                this.id2Position[id] = nextPosition;
            }
            this.count++;
        }
    }

    public add(): number {
        if (this.count === this.id2Position.length) {
            this.increaseCapacity(this.count * 2);
        }

        return this.position2Id[this.count++];
    }

    public exists(id: number): boolean {
        return this.id2Position[id] < this.count;
    }

    public getId(position: number): number {
        return this.position2Id[position];
    }

    public getPosition(id: number): number {
        return this.id2Position[id];
    }

    public delete(id: number): boolean {
        const position = this.id2Position[id];

        if (position >= this.count) {
            return false;
        }

        const lastPosition = this.count - 1;
        if (lastPosition !== position) {
            const lastId = this.position2Id[lastPosition];

            this.position2Id[position] = lastId;
            this.id2Position[lastId] = position;

            this.id2Position[id] = lastPosition;
            this.position2Id[lastPosition] = id;
        }
        this.count--;

        return true;
    }

    public print(): string {
        return "count: " + this.count + ", ids: " + this.position2Id + ", positions: " + this.id2Position;
    }
}