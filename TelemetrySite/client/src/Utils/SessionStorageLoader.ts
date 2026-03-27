const saveItem = (name: string, saveObject: any): boolean => {
    saveObject = JSON.stringify(saveObject);
    try {
        sessionStorage.setItem(name, saveObject);
    } catch {
        return false;
    }

    return true;
};

const getItem = (name: string): any | null => {
    const value = sessionStorage.getItem(name);
    if (!value) return null;
    const parsed = JSON.parse(value as string);

    return parsed;
};

const removeItem = (name: string): boolean => {
    sessionStorage.removeItem(name);
    return true;
};

export { saveItem, getItem, removeItem };
