export class ElementList {

    static readonly DEFAULT_CAPACITY_LISTENER: (capacity: number) => void = (capacity: number) => {};

    private count = 0;
    private id2Position: number[];
    private position2Id: number[];

    capacityListener: (capacity: number) => void = ElementList.DEFAULT_CAPACITY_LISTENER;

    constructor(capacity: number) {
        this.id2Position = Array<number>(capacity);
        this.position2Id = Array<number>(capacity);

        for (var nodePosition = 0; nodePosition < capacity; nodePosition++) {
            this.id2Position[nodePosition] = nodePosition;
            this.position2Id[nodePosition] = nodePosition;
        }
    }

    getCount = (): number => {
        return this.count;
    }

    getCapacity = (): number => {
        return this.id2Position.length;
    }

    setCapacity = (capacity: number): void => {
        if (capacity > this.id2Position.length) {
            this.id2Position.length = capacity;
            this.position2Id.length = capacity;

            for (var position = this.count; position < capacity; position++) {
                this.id2Position[position] = position;
                this.position2Id[position] = position;
            }
            this.capacityListener(capacity);
        }
    }

    addWithId = (id: number): void => {
        const nodePosition = this.id2Position[id];
        if (nodePosition < this.count) {
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

    add = (): number => {
        if (this.count === this.id2Position.length) {
            this.setCapacity(this.count * 2);
        }
        return this.position2Id[this.count++];
    }

    exists = (id: number): boolean => {
        return this.id2Position[id] < this.count;
    }

    getId = (position: number): number => {
        return this.position2Id[position];
    }

    getPosition = (id: number): number => {
        return this.id2Position[id];
    }

    delete = (id: number): boolean => {
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

    print = (): string => {
        return "count: " + this.count + ", ids: " + this.position2Id + ", positions: " + this.id2Position;
    }
}