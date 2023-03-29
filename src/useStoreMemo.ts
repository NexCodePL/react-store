import { useEffect } from "react";
import { StoreDependencyList } from "./types.js";
import { useStore } from "./useStore.js";
import { getDependencies } from "./utils.js";
import { useStoreSubscribeAll } from "./useStoreSubscribe.js";

export function useStoreMemo<T>(factory: () => T, deps?: StoreDependencyList) {
    const store = useStore<T>(factory());

    const { storeDeps, nonStoreDeps } = getDependencies(deps);

    useEffect(() => store.set(factory()), nonStoreDeps);
    useStoreSubscribeAll(() => {
        store.set(factory());
    }, storeDeps);

    return store;
}
