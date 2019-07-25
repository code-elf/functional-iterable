//tslint:disable
import AsyncF from './async';
import ObjectF from './object';
import SyncF from './sync';

function isAsync<T>(iterable: Iterable<T> | AsyncIterable<T> | object): iterable is AsyncIterable<T> {
	return !!(iterable as AsyncIterable<T>)[Symbol.asyncIterator];
}

function isIterable<T>(iterable: Iterable<T> | object): iterable is Iterable<T> {
	return !!(iterable as Iterable<T>)[Symbol.iterator];
}

function f<T>(iterable: Iterable<T>): SyncF<T>
function f<T>(iterable: AsyncIterable<T>): AsyncF<T>
function f<T extends object>(object: T): ObjectF<T>
function f<T>(iterable: Iterable<T> | AsyncIterable<T> | object) {
	if(isAsync(iterable)) return new AsyncF(iterable);
	if(isIterable(iterable)) return new SyncF(iterable);
	return new ObjectF(iterable);
}

f.range = function(from: number, to: number): SyncF<number> {
	++to;
	const sign = Math.sign(to - from);
	return new SyncF((function*() {
		for(; from !== to; from += sign)
			yield from;
	})());
}

function whilst<T>(fn: () => T): SyncF<NonNullable<T>>
function whilst<T>(fn: () => Promise<T>): AsyncF<NonNullable<T>>
function whilst<T>(fn: () => T | Promise<T>): SyncF<NonNullable<T>> | AsyncF<NonNullable<T>> {
	let value = fn();
	if(value instanceof Promise)
		return new AsyncF<NonNullable<T>>((async function*() {
			let awaited;
			while(awaited = await value) {
				yield awaited as NonNullable<T>;
				value = fn();
			}
		})());
	else
		return new SyncF<NonNullable<T>>((function*() {
			while(value) {
				yield value as NonNullable<T>;
				value = fn();
			}
		})());
}
f.while = whilst;

export default f;