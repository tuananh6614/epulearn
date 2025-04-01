
/**
 * Utility functions to handle ID conversions between string and number
 * to support the transition from UUID strings to numeric IDs
 */

/**
 * Converts a value to a string ID
 * @param id ID to convert (can be string, number, or undefined)
 * @returns String representation of the ID or undefined
 */
export const toStringId = (id: string | number | undefined): string | undefined => {
  if (id === undefined || id === null) return undefined;
  return String(id);
};

/**
 * Attempts to convert a value to a numeric ID
 * @param id ID to convert (can be string, number, or undefined)
 * @returns Numeric representation of the ID if possible, or the original value
 */
export const toNumberId = (id: string | number | undefined): number | string | undefined => {
  if (id === undefined || id === null) return undefined;
  
  if (typeof id === 'number') return id;
  
  // Try to convert string to number
  const num = Number(id);
  return !isNaN(num) ? num : id; // Return number if valid, otherwise return original string
};

/**
 * Ensures the ID is a number if possible
 * @param id ID to ensure is a number
 * @returns Number or undefined
 */
export const ensureNumberId = (id: string | number | undefined): number | undefined => {
  if (id === undefined || id === null) return undefined;
  
  if (typeof id === 'number') return id;
  
  const num = Number(id);
  return !isNaN(num) ? num : undefined;
};

/**
 * Compares two IDs (either string or number format) for equality
 * @param id1 First ID
 * @param id2 Second ID
 * @returns True if the IDs are equal regardless of type
 */
export const idsAreEqual = (
  id1: string | number | undefined, 
  id2: string | number | undefined
): boolean => {
  if (id1 === undefined || id2 === undefined) return false;
  return String(id1) === String(id2);
};

/**
 * Returns a type-safe ID for use in Supabase queries
 * Always returns a string, which is what Supabase expects
 * @param id ID to use in Supabase query
 * @returns String ID guaranteed to work with Supabase
 */
export const supabaseId = (id: string | number | undefined): string => {
  if (id === undefined || id === null) return '';
  return String(id);
};

/**
 * Converts a database object with string IDs to a format with number IDs
 * Useful for frontend components that expect number IDs
 * @param object Object with string IDs from database
 * @returns Same object with number IDs where possible
 */
export const convertObjectIds = <T extends Record<string, any>>(
  object: T, 
  idFields: string[] = ['id']
): T => {
  if (!object) return object;
  
  const result = { ...object };
  
  for (const field of idFields) {
    if (field in result) {
      // Fix the generic type indexing issue by using safer access
      const value = result[field];
      result[field] = toNumberId(value);
    }
  }
  
  return result;
};
