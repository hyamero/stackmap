import { schemaSections, type SchemaSection } from '@stackmap/schema';

export type { SchemaField, SchemaSection } from '@stackmap/schema';

export function schemaReference(): SchemaSection[] {
  return schemaSections();
}
