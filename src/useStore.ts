import { useRef } from "react";
import { StoreSetState, StoreSubscriber, Store } from "./types.js";
import { isFunction } from "./utils.js";

export function useStore<T>(initValue: T) {
    const storeState = useRef<T>(initValue);
    const subscribers = useRef<StoreSubscriber<T>[]>([]);
    const returnObject = useRef<Store<T>>({
        current() {
            return storeState.current;
        },
        set(setState: StoreSetState<T>) {
            const newStoreState = isFunction(setState) ? setState(storeState.current) : setState;

            storeState.current = newStoreState;
            [...subscribers.current].forEach(s => s(storeState.current));
        },
        subscribe(subscriber: StoreSubscriber<T>) {
            if (subscribers.current.indexOf(subscriber) !== -1) return;
            subscriber(storeState.current);
            subscribers.current.push(subscriber);
        },
        unsubscribe(subscriber: StoreSubscriber<T>) {
            const index = subscribers.current.indexOf(subscriber);

            if (index === -1) return;

            subscribers.current.splice(index, 1);
        },
        __type: "3destateoneapp_store",
    });

    return returnObject.current;
}
