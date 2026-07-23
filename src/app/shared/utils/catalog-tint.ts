const CATALOG_TINTS = [
  'bg-primary/10 text-primary',
  'bg-accent/15 text-accent-content',
  'bg-info/10 text-info',
  'bg-warning/15 text-warning',
  'bg-success/10 text-success',
] as const;

export function catalogTint(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return CATALOG_TINTS[hash % CATALOG_TINTS.length];
}
