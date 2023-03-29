export type StoreSetState<T> = T | ((prevValue: T) => T);

export type StoreSubscriber<T> = (value: T) => void;

export interface Store<T> {
    current(): T;
    set(setState: StoreSetState<T>): void;
    subscribe(subscriber: StoreSubscriber<T>): void;
    unsubscribe(subscriber: StoreSubscriber<T>): void;
    __type: "3destateoneapp_store";
}

export type StoreDependencyList = ReadonlyArray<Store<unknown> | unknown>;

export type StoreInferState<T> = T extends Store<infer TStoreState>
    ? TStoreState
    : never;
