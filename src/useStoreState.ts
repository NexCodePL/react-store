import { useState } from "react";
import { useStoreSubscribe } from "./useStoreSubscribe.js";
import { Store } from "./types.js";

export function useStoreState<T>(store: Store<T>) {
    const [state, setState] = useState<T>(() => store.current());

    useStoreSubscribe<T>(storeState => setState(storeState), store);

    return state;
}
