export interface Gallery {
  id: string;
  slug: string;
  modelName: string;
  title: string;
  description: string;
  coverImage: string;
  images: string[];
  studio?: string;
  addedAt: string;
}
