import { LinkList } from "../LinkList";

const initialLinkCapacity = 1;

let l: LinkList;

beforeEach(() => {
    l = new LinkList(initialLinkCapacity);
});

describe('When an LinkList is created', () => {

    test('the link count should be zero', () => {
        expect(l.getCount()).toBe(0);
    });

});

describe('After a single link is added', () => {

    const source: number = 5;
    const destination: number = 7;

    let id: number;
    
    beforeEach(() => {
        id = l.add(source, destination);
    });

    test('the link count should be one', () => {
        expect(l.getCount()).toBe(1);
    });

    test('this id should be zero', () => {
        expect(id).toBe(0);
    });

    test('the link can be looked up', () => {
        expect(l.get(source, destination)).toBe(0);
    });

    test('the reverse link can be looked up', () => {
        expect(l.get(destination, source)).toBe(0);
    });

    test('the source should be correct', () => {
        expect(l.getSource(id)).toBe(source);
    });

    test('the destination should be correct', () => {
        expect(l.getDestination(id)).toBe(destination);
    });
});

describe('After a single reverse link is added', () => {

    const source: number = 5;
    const destination: number = 2;

    let id: number;
    
    beforeEach(() => {
        id = l.add(source, destination);
    });

    test('the link count should be one', () => {
        expect(l.getCount()).toBe(1);
    });

    test('this id should be zero', () => {
        expect(id).toBe(0);
    });

    test('the link can be looked up', () => {
        expect(l.get(source, destination)).toBe(0);
    });

    test('the reverse link can be looked up', () => {
        expect(l.get(destination, source)).toBe(0);
    });

    test('the source should be the destination', () => {
        expect(l.getSource(id)).toBe(destination);
    });

    test('the destination should be source', () => {
        expect(l.getDestination(id)).toBe(source);
    });
});

describe('Random add/delete test', () => {
    test('elements match test', () => {
        
        const nodeCount = 47;

        const links: number[][] = [];
        for (let source = 0; source < nodeCount; source++) {
            links.push([]);
            for (let destination = 0; destination < nodeCount; destination++) {
                links[source].push(-1);
            }
        }
        let count = 0;

        for (let i = 0; i < 10000; i++) {
            let source = Math.floor(Math.random() * nodeCount);
            let destination = Math.floor(Math.random() * nodeCount);
            
            if (links[source][destination] >= 0) {
                const id = l.get(source, destination);
                expect(id).toBe(links[source][destination]);
                expect(l.remove(id)).toBe(true);
                expect(l.exists(id)).toBe(false);
                links[source][destination] = -1;
                links[destination][source] = -1;
                count--;
            } else {
                expect(l.get(source, destination)).toBe(-1);
                const id = l.add(source, destination);
                expect(id).toBeGreaterThanOrEqual(0);
                expect(l.exists(id)).toBe(true);
                expect(l.getSource(id)).toBe(Math.min(source, destination));
                expect(l.getDestination(id)).toBe(Math.max(source, destination));
                links[source][destination] = id;
                links[destination][source] = id;
                count++;
            }

            expect(l.getCount()).toBe(count);
        }

        console.log("Count: ", l.getCount());
        console.log("Capacity: ", l.getCapacity());
        console.log("Bucket sizes: ", l.getBucketSizes());
        console.log("Average search length: ", l.getAverageSearchLength());
    });

});