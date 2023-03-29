import { useEffect, useRef } from "react";
import { Store } from "./types.js";

export function useStoreSubscribe<T>(
    action: (storeState: T) => void,
    store: Store<T>,
    externalDependencies?: React.DependencyList
) {
    const isMounted = useRef(false);
    useEffect(() => {
        isMounted.current = true;
        function listener(storeState: T) {
            if (!isMounted.current) return;
            action(storeState);
        }

        store.subscribe(listener);

        return () => {
            isMounted.current = false;
            store.unsubscribe(listener);
        };
    }, externalDependencies ?? []);
}

export function useStoreSubscribeAll(
    action: () => void,
    storeDeps: Store<unknown>[],
    externalDependencies?: React.DependencyList
) {
    useEffect(() => {
        function listener() {
            action();
        }

        storeDeps.forEach(s => s.subscribe(listener));

        return () => {
            storeDeps.forEach(s => s.unsubscribe(listener));
        };
    }, [...storeDeps, ...(externalDependencies ?? [])]);
}
