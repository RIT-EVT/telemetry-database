/**
 * Save an item as a stringified object in session storage.
 * Returns false if an error occurred
 */
const saveItem = (name: string, saveObject: any): boolean => {
    saveObject = JSON.stringify(saveObject);
    try {
        sessionStorage.setItem(name, saveObject);
    } catch {
        return false;
    }

    return true;
};

/**
 * Get an item from session storage at an entry.
 * Returns as parsed JSON or null if no item was found.
 */
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

/**
 * Removes an item from storage
 */
const removeItem = (name: string): void => {
    sessionStorage.removeItem(name);
};

export { saveItem, getItem, removeItem };
