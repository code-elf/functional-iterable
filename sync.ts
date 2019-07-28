//tslint:disable
import AsyncF from './async';

export default class F<T> implements Iterable<T> {
	[Symbol.iterator] = () => this.iterator[Symbol.iterator]();

	constructor(private readonly iterator: Iterable<T>) {
	}

	all(fn: (item: T) => boolean): boolean {
		for(const item of this.iterator)
			if(!fn(item)) return false;
		return true;
	}

	async(): AsyncF<T> {
		return new AsyncF<T>((async function* (items) {
			yield* items;
		})(this.iterator));
	}

	concat<U>(other: Iterable<U>): F<T | U> {
		return new F((function* (items) {
			yield* items;
			yield* other;
		})(this.iterator));
	}

	count(fn?: (item: T) => boolean): number {
		let count = 0;
		for(const item of this.iterator)
			if(!fn || fn(item)) ++count;
		return count;
	}

	filter(fn?: (item: T) => boolean): F<T> {
		if(!fn) fn = (x) => !!x;
		return new F((function* (items) {
			for(const item of items) {
				if(fn(item))
					yield item;
			}
		})(this.iterator));
	}

	first(fn?: (item: T) => boolean): T | undefined {
		for(const item of this.iterator)
			if(!fn || fn(item))
				return item;
	}

	flatMap<U>(fn: (item: T) => Iterable<U> | undefined): F<U> {
		return new F((function* (items) {
			for(const item of items) {
				const value = fn(item);
				if(value)
					yield* value;
			}
		})(this.iterator));
	}

	includes(item: T): boolean {
		return this.some(x => x === item);
	}

	map<U>(fn: (item: T) => U): F<U> {
		return new F((function* (items) {
			for(const item of items)
				yield fn(item);
		})(this.iterator));
	}

	reduce<U>(fn: (current: U, item: T) => U, current: U): U {
		for(const item of this.iterator)
			current = fn(current, item);
		return current;
	}

	some(fn: (item: T) => boolean): boolean {
		for(const item of this.iterator)
			if(fn(item)) return true;
		return false;
	}

	toArray(): T[] {
		return [...this.iterator];
	}

	toMap<U>(key: (item: T) => U): Map<U, T> {
		const map = new Map<U, T>();
		for(const item of this.iterator)
			map.set(key(item), item);
		return map;
	}

	toSet(): Set<T> {
		return new Set(this.iterator);
	}

	unique<U>(fn?: (item: T) => Promise<U> | U): F<T> {
		const set = new Set();
		return new F((function* (items) {
			for(const item of items) {
				const key = fn ? fn(item) : item;
				if(!set.has(key)) {
					yield item;
					set.add(key);
				}
			}
		})(this.iterator));
	}
}