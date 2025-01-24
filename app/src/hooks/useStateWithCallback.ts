import { useState, useEffect, useRef, useCallback } from "react";

export default function useStateWithCallback<S, C> (initialState: S): [S, (newState: (prev: S) => S, cb?: C) => void] {
    const [state, setState] = useState<S>(initialState);
    const cbRef = useRef<any | null>(null);

    const updateState = useCallback((newState: (prev: S) => S, cb?: C) => {
        cbRef.current = cb;

        setState(prev => typeof newState === "function" ? newState(prev) : newState);
    }, []);

    useEffect(() => {
        if (cbRef.current) {
            // Вызываем ранее сохраненный коллбек
            cbRef.current(state);
            // Обнуляем его
            cbRef.current = null;
        }
    }, [state]);

    return [state, updateState];
};