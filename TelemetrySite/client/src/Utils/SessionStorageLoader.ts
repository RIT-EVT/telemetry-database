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
    if (value === null) return null; // getItem returns null (not undefined) when missing

    try {
        return JSON.parse(value);
    } catch (e) {
        console.warn(`sessionStorage key "${name}" contains invalid JSON:`, value);
        return null;
    }
};

const removeItem = (name: string): boolean => {
    sessionStorage.removeItem(name);
    return true;
};

export { saveItem, getItem, removeItem };
