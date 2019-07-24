import SyncF from './sync';

export default class ObjectF<T extends object> {
	constructor(private readonly value: T) {
	}

	entries(): SyncF<[keyof T, T[keyof T]]> {
		return new SyncF((function* (value: T) {
			for(const key in value)
				yield [key, value[key]] as [keyof T, T[keyof T]];
		})(this.value));
	}

	keys(): SyncF<keyof T> {
		return new SyncF((function* (value: T) {
			for(const key in value)
				yield key;
		})(this.value));
	}

	toMap(): Map<keyof T, T[keyof T]> {
		const map = new Map();
		for(const key in this.value)
			map.set(key, this.value[key]);
		return map;
	}

	values(): SyncF<T[keyof T]> {
		return new SyncF((function* (value: T) {
			for(const key in value)
				yield value[key];
		})(this.value));
	}
}