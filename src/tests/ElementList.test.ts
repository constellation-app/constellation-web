import { ElementList } from "../ElementList";

const initialCapacity = 8;

var e: ElementList;

beforeEach(() => {
    e = new ElementList(initialCapacity);
});

describe('When an ElementList is created', () => {
    test('the count should be 0', () => {
        expect(e.getCount()).toBe(0);
    });

    test('it should have the capacity we specified', () => {
        expect(e.getCapacity()).toBe(initialCapacity);
    });

    test('all elements should not exist', () => {
        for (var id = 0; id < initialCapacity; id++) {
            expect(e.exists(id)).toBe(false);
        }
    });
});

describe('After a single element is added', () => {

    var id: number;

    beforeEach(() => {
        id = e.add();
    });
    
    test('the element should have an id of 0', () => {
        expect(id).toBe(0);
    });

    test('the count should be 1', () => {
        expect(e.getCount()).toBe(1);
    });

    test('the element should be at position 0', () => {
        expect(e.getPosition(id)).toBe(0);
    });

    test('only the element should exist', () => {
        for (var otherId = 0; otherId < initialCapacity; otherId++) {
            expect(e.exists(otherId)).toBe(otherId === id);
        }
    });
});

describe('Random add/delete test', () => {

    test('elements match test', () => {
        const elementCount = 50;
        let created: number[] = [];
        let deleted: number[] = [];

        for (var id = elementCount - 1; id >= 0; id--) {
            deleted.push(id);
        }

        for (var i = 0; i < 100; i++) {
            const position = Math.floor(Math.random() * elementCount);
            if (position < created.length) {
                const id = created[position];
                expect(e.delete(id)).toBe(true);
                created[position] = created[created.length - 1];
                created.length--;
                deleted.push(id);
            } else {
                const id = e.add();
                expect(deleted.pop()).toBe(id);
                created.push(id);
            }

            expect(e.getCount()).toBe(created.length);
            for (var p = 0; p < e.getCount(); p++) {
                expect(e.getId(p)).toBe(created[p]);
                expect(e.exists(created[p])).toBe(true);
            }
        }
    });

});