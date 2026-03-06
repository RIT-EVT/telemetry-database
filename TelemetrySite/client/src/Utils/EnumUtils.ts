const enumMaxCache = new WeakMap<object, number | undefined>();

function getMaxEnumValue(e: object): number | undefined {
    if (enumMaxCache.has(e)) return enumMaxCache.get(e);

    // Get all runtime values, which for a numeric enum includes both keys (strings) and values (numbers)
    const values = Object.values(e)
        // Filter to include only the numeric values
        .filter((value) => typeof value === "number")
        // Convert to a number array (TypeScript might see them as 'any' or 'string | number' initially)
        .map(Number)
        // Filter out potential non-numeric entries (like empty strings mapped to NaN)
        .filter((k) => !isNaN(k));

    if (values.length === 0) {
        return undefined; // Handle empty enums
    }

    // Sort the values numerically and return the last (highest) one
    values.sort((k1, k2) => k1 - k2);

    enumMaxCache.set(e, values.length - 1);

    return values[values.length - 1];
}

export { getMaxEnumValue };
