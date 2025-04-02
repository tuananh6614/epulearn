
/**
 * Convert various ID types to string format
 * This replaces the previous supabaseId function
 * @param id The ID to convert (can be string, number, or any other type)
 * @returns The ID as a string
 */
export const convertId = (id: string | number | any): string => {
  if (id === null || id === undefined) {
    return '';
  }
  return String(id);
};

/**
 * Convert string ID to number (legacy function)
 * @param id The ID to convert
 * @returns The ID as a number, or the original ID if conversion fails
 */
export const toNumberId = (id: string | number | any): number => {
  if (typeof id === 'number') {
    return id;
  }
  const num = Number(id);
  return isNaN(num) ? -1 : num;
};
