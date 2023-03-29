import { useEffect, useState } from "react";
import { isStore } from "./utils.js";
import { Store } from "./types.js";

export type StoreMultipleObject<T> = {
    [K in keyof T]: T[K] extends Store<any> ? T[K] : T[K];
};

export type StoreMultipleObjectExcludeNonStore<T extends StoreMultipleObject<any>> = {
    [K in keyof T as T[K] extends Store<any> ? K : never]: T[K];
};

export type StoreMultipleObjectStoreState<T> = {
    [K in keyof T as T[K] extends Store<any> ? K : never]: T[K] extends Store<infer TStoreState> ? TStoreState : never;
};

export type StoreMultipleFragmentsShouldUpdate<T> = {
    [K in keyof T]?: (prev: T[K], next: T[K]) => boolean;
};

export type StoreMultipleFragmentFactoryResultElement<T> = T;

export type StoreMultipleFragmentFactoryResult<T> = {
    [K in keyof T]: T[K] extends T[K] ? T[K] : T[K];
};

export type StoreMultipleFragmentFactory<TStoreMultiple, TFragmentsMultiple> = (
    storeMultipleObject: StoreMultipleObjectStoreState<TStoreMultiple>
) => StoreMultipleFragmentFactoryResult<TFragmentsMultiple>;

export function useStoreStateMultiple<TStoreMultiple, TFragmentsMultiple>(
    storeMultipleObject: StoreMultipleObject<TStoreMultiple>,
    multipleFragmentsFactory: StoreMultipleFragmentFactory<TStoreMultiple, TFragmentsMultiple>,
    shouldUpdateMap?: StoreMultipleFragmentsShouldUpdate<TFragmentsMultiple>
): TFragmentsMultiple {
    const [storeMultipleState, setStoreMultipleState] = useState<TFragmentsMultiple>(
        getInitFragmentsMultiple(storeMultipleObject, multipleFragmentsFactory, shouldUpdateMap ?? {})
    );

    useEffect(() => {
        function listener() {
            setStoreMultipleState(prevState => {
                const [fragmentsMultiple, shouldUpdate] = getFragmentsMultiple(
                    storeMultipleObject,
                    multipleFragmentsFactory,
                    shouldUpdateMap ?? {},
                    prevState
                );
                if (!shouldUpdate) return prevState;

                return fragmentsMultiple;
            });
        }

        const stores = Object.entries(storeMultipleObject).reduce<Store<unknown>[]>((stores, [, store]) => {
            if (!isStore(store)) return stores;

            stores.push(store);

            return stores;
        }, []);

        stores.forEach(s => s.subscribe(listener));

        return () => stores.forEach(s => s.unsubscribe(listener));
    }, []);

    return storeMultipleState;
}

function getInitFragmentsMultiple<TStoreMultiple, TFragmentsMultiple>(
    storeMultipleObject: StoreMultipleObject<TStoreMultiple>,
    multipleFragmentsFactory: StoreMultipleFragmentFactory<TStoreMultiple, TFragmentsMultiple>,
    shouldUpdateMap: StoreMultipleFragmentsShouldUpdate<TFragmentsMultiple>
) {
    const storeState = getStoreMultipleState<TStoreMultiple>(storeMultipleObject);
    const [fragmentsMultiple] = getFragmentsMultipleWithShouldUpdate<TStoreMultiple, TFragmentsMultiple>(
        storeState,
        multipleFragmentsFactory,
        shouldUpdateMap,
        null
    );

    return fragmentsMultiple;
}

function getFragmentsMultiple<TStoreMultiple, TFragmentsMultiple>(
    storeMultipleObject: StoreMultipleObject<TStoreMultiple>,
    multipleFragmentsFactory: StoreMultipleFragmentFactory<TStoreMultiple, TFragmentsMultiple>,
    shouldUpdateMap: StoreMultipleFragmentsShouldUpdate<TFragmentsMultiple>,
    prevState: TFragmentsMultiple
) {
    const storeState = getStoreMultipleState<TStoreMultiple>(storeMultipleObject);
    return getFragmentsMultipleWithShouldUpdate<TStoreMultiple, TFragmentsMultiple>(
        storeState,
        multipleFragmentsFactory,
        shouldUpdateMap,
        prevState
    );
}

function getFragmentsMultipleWithShouldUpdate<TStoreMultiple, TFragmentsMultiple>(
    storeMultipleState: StoreMultipleObjectStoreState<TStoreMultiple>,
    multipleFragmentsFactory: StoreMultipleFragmentFactory<TStoreMultiple, TFragmentsMultiple>,
    shouldUpdateMap: StoreMultipleFragmentsShouldUpdate<TFragmentsMultiple>,
    prevState: TFragmentsMultiple | null
): [TFragmentsMultiple, boolean] {
    const factoryResult = multipleFragmentsFactory(storeMultipleState);

    const keys = Object.keys(factoryResult) as (keyof StoreMultipleFragmentFactoryResult<TFragmentsMultiple>)[];

    const fragmentsMultiple: TFragmentsMultiple = {} as TFragmentsMultiple;

    if (prevState === null || prevState === undefined) return [fragmentsMultiple, true];

    let shouldUpdate = false;

    for (const key of keys) {
        fragmentsMultiple[key] = factoryResult[key];

        if (shouldUpdate) continue;
        if (prevState === null) continue;

        const shouldUpdateKeyFunction = shouldUpdateMap[key];

        if (shouldUpdateKeyFunction) {
            if (shouldUpdateKeyFunction(prevState[key], fragmentsMultiple[key])) {
                shouldUpdate = true;
            }
        } else {
            if (prevState[key] !== fragmentsMultiple[key]) {
                shouldUpdate = true;
            }
        }
    }

    return [fragmentsMultiple, shouldUpdate];
}

function getStoreMultipleState<TStoreMultiple>(
    storeMultipleObject: StoreMultipleObject<TStoreMultiple>
): StoreMultipleObjectStoreState<TStoreMultiple> {
    const keys = Object.keys(storeMultipleObject) as Array<keyof StoreMultipleObject<TStoreMultiple>>;

    const storeMultipleState: StoreMultipleObjectStoreState<TStoreMultiple> = keys.reduce<
        StoreMultipleObjectStoreState<TStoreMultiple>
    >((storeState, key) => {
        const store = storeMultipleObject[key];

        if (!isStore(store)) return storeState;

        (storeState as any)[key] = store.current();

        return storeState;
    }, {} as StoreMultipleObjectStoreState<TStoreMultiple>);

    return storeMultipleState;
}
