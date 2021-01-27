export class InputManager {
	Store(store) {
		this._store = store;
		return this;
	}

	On(eventName) {
		this._eventName = eventName;
		return this;
	}

	__process_event__(key) {
		this._store["__current__"] = key;
	}

	__set_state__() {
		document.addEventListener(this._eventName, (event) => {
			this.__process_event__(event.key);
		});
	}

	__unset_state__() {
		document.addEventListener("keyup", (event) => this.__process_event__(null));
	}

	Listen() {
		this.__set_state__();
		this.__unset_state__();
	}
}
