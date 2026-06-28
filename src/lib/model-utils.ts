import { slugifyModel } from "./videos";
import { supMembers } from "./sup-data";

// Centralized list of SUP-specialized models
export const isSupModel = (name: string): boolean => {
  if (!name) return false;
  return supMembers.some(m => m.name.toLowerCase() === name.toLowerCase());
};

export const getModelUrl = (name: string): string => {
  if (!name) return "/models";
  const slug = slugifyModel(name);
  return isSupModel(name) ? `/SUP/${slug}` : `/models/${slug}`;
};

export const getModelUrlBySlug = (slug: string): string => {
  if (!slug) return "/models";
  
  // Check if this slug matches any of our SUP models
  const isSup = supMembers.some(m => slugifyModel(m.name) === slug);
  
  return isSup ? `/SUP/${slug}` : `/models/${slug}`;
};
