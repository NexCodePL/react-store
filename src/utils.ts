import { StoreDependencyList, Store } from "./types.js";

export function getDependencies(deps?: StoreDependencyList): {
    storeDeps: Store<unknown>[];
    nonStoreDeps: unknown[];
} {
    const storeDeps: Store<unknown>[] = deps ? deps.filter(isStore) : [];
    const nonStoreDeps = deps ? deps.filter(e => !isStore(e)) : [];

    return {
        storeDeps,
        nonStoreDeps,
    };
}

export function isFunction(e: unknown): e is (...args: any) => any {
    return typeof e === "function";
}

export function isStore<T = unknown>(e: Store<T> | unknown): e is Store<T> {
    if (!e) return false;
    if (typeof e !== "object") return false;

    return (e as Store<T>).__type === "3destateoneapp_store";
}
