import { MenuItem } from './types';

/**
 * Filters items based on the search term
 */
export const filterItems = (items: MenuItem[], searchTerm: string): MenuItem[] => {
  if (!searchTerm.trim()) {
    return items;
  }
  
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  
  return items.filter(item => 
    item.name.toLowerCase().includes(normalizedSearchTerm) || 
    item.category.toLowerCase().includes(normalizedSearchTerm)
  );
};

/**
 * Groups items by category
 */
export const groupByCategory = (items: MenuItem[]): Record<string, MenuItem[]> => {
  return items.reduce((acc, item) => {
    const category = item.category;
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
};

/**
 * Get unique categories from items
 */
export const getUniqueCategories = (items: MenuItem[]): string[] => {
  return [...new Set(items.map(item => item.category))];
};