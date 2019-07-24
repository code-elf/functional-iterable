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

export default f;