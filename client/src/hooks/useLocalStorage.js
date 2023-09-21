import { useState, useEffect } from "react";

const getStorageData = (key, defaultValue) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
};

const useLocalStorage = (key, defaultValue) => {
    const [data, setData] = useState(() => getStorageData(key, defaultValue));

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(data));
    }, [data]);

    return [data, setData];
}

export default useLocalStorage;
