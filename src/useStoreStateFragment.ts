import { useEffect, useRef, useState } from "react";
import { Store } from "./types.js";
import { useStoreSubscribe } from "./useStoreSubscribe.js";

type StoreStateFragmentFactory<TStoreState, TFragment> = (storeState: TStoreState) => TFragment;

export function useStoreStateFragment<TStoreState, TFragment>(
    store: Store<TStoreState>,
    fragmentFactory: StoreStateFragmentFactory<TStoreState, TFragment>,
    shouldUpdate: (prevState: TFragment, nextState: TFragment) => boolean,
    externalDependencies?: React.DependencyList
): TFragment {
    const [state, setState] = useState<TFragment>(fragmentFactory(store.current()));

    const stateRef = useRef<TFragment>(state);

    useStoreSubscribe<TStoreState>(
        storeState => {
            const nextState = fragmentFactory(storeState);
            if (shouldUpdate(stateRef.current, nextState)) {
                stateRef.current = nextState;
                setState(nextState);
            }
        },
        store,
        externalDependencies
    );

    useEffect(() => {
        if (!externalDependencies) return;

        const nextState = fragmentFactory(store.current());
        stateRef.current = nextState;
        setState(nextState);
    }, externalDependencies ?? []);

    return state;
}
