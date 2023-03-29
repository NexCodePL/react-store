import { useEffect, useRef } from "react";
import { StoreDependencyList } from "./types.js";
import { getDependencies } from "./utils.js";

type Destructor = () => void;

export function useStoreEffect(effect: React.EffectCallback, deps?: StoreDependencyList) {
    const { storeDeps, nonStoreDeps } = getDependencies(deps);
    const effectResultRef = useRef<undefined | Destructor>(undefined);

    useEffect(() => {
        const effectResult = effect();
        if (typeof effectResult === "function") {
            effectResultRef.current = effectResult;
        }

        return () => {
            if (effectResultRef.current) {
                effectResultRef.current();
                effectResultRef.current = undefined;
            }
        };
    }, nonStoreDeps);

    useEffect(() => {
        function listener() {
            if (effectResultRef.current) {
                effectResultRef.current();
                effectResultRef.current = undefined;
            }
            const effectResult = effect();

            if (typeof effectResult === "function") {
                effectResultRef.current = effectResult;
            }
        }

        storeDeps.forEach(s => s.subscribe(listener));

        return () => {
            storeDeps.forEach(s => s.unsubscribe(listener));

            if (effectResultRef.current) {
                effectResultRef.current();
                effectResultRef.current = undefined;
            }
        };
    }, []);
}
