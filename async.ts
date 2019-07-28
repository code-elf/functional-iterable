//tslint:disable
export default class F<T> implements AsyncIterable<T> {
    [Symbol.asyncIterator] = () => this.iterator[Symbol.asyncIterator]();

    constructor(private readonly iterator: AsyncIterable<T>) {
    }

    async all(fn: (item: T) => Promise<boolean> | boolean): Promise<boolean> {
        for await(const item of this.iterator)
            if(!await fn(item)) return false;
        return true;
    }

    concat<U>(other: Iterable<U> | AsyncIterable<U>): F<T | U> {
        return new F((async function* (items) {
            yield* items;
            yield* other;
        })(this.iterator));
    }

    async count(fn?: (item: T) => Promise<boolean> | boolean): Promise<number> {
        let count = 0;
        for await(const item of this.iterator)
            if(!fn || await fn(item)) ++count;
        return count;
    }

    filter(fn?: (item: T) => Promise<boolean> | boolean): F<T> {
        if(!fn) fn = (x) => !!x;
        return new F((async function* (items) {
            for await(const item of items) {
                if(await fn(item))
                    yield item;
            }
        })(this.iterator));
    }

    async first(fn?: (item: T) => Promise<boolean> | boolean): Promise<T | undefined> {
        for await(const item of this.iterator)
            if(!fn || fn(item))
                return item;
    }

    flatMap<U>(fn: (item: T) => AsyncIterable<U> | Iterable<U> | undefined | Promise<Iterable<U> | undefined>): F<U> {
        return new F((async function* (items) {
            for await(const item of items) {
                const value = await fn(item);
                if(value)
                    yield* value;
            }
        })(this.iterator));
    }

    includes(item: T): Promise<boolean> {
        return this.some(x => x === item);
    }

    map<U>(fn: (item: T) => Promise<U> | U): F<U> {
        return new F((async function* (items) {
            for await(const item of items)
                yield await fn(item);
        })(this.iterator));
    }

    async reduce<U>(fn: (current: U, item: T) => Promise<U> | U, current: U): Promise<U> {
        for await(const item of this.iterator)
            current = await fn(current, item);
        return current;
    }

    async some(fn: (item: T) => Promise<boolean> | boolean): Promise<boolean> {
        for await(const item of this.iterator)
            if(await fn(item)) return true;
        return false;
    }

    async toArray(): Promise<T[]> {
        const array = [];
        for await(const item of this.iterator)
            array.push(item);
        return array;
    }

    async toMap<U>(key: (item: T) => Promise<U> | U): Promise<Map<U, T>> {
        const map = new Map<U, T>();
        for await(const item of this.iterator)
            map.set(await key(item), item);
        return map;
    }

    async toSet(): Promise<Set<T>> {
        const set = new Set<T>();
        for await(const item of this.iterator)
            set.add(item);
        return set;
    }

    unique<U>(fn?: (item: T) => Promise<U> | U): F<T> {
        const set = new Set();
        return new F((async function* (items) {
            for await(const item of items) {
                const key = fn ? fn(item) : item;
                if(!set.has(key)) {
                    yield item;
                    set.add(key);
                }
            }
        })(this.iterator));
    }
}