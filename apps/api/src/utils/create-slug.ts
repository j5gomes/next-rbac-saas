export function createSlug(text: string): string {
  // Normalize the text to remove accents
  const normalizedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // Remove all non-alphanumeric characters and replace spaces with hyphens
  const slug = normalizedText
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters (except spaces and hyphens)
    .trim() // Trim whitespace from both ends
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen

  return slug
}
