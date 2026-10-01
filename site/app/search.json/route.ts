import { searchIndex } from '@/lib/search-index';

// Written once at build time; the docs search fetches it the first time it opens.
export const dynamic = 'force-static';

export function GET() {
  return Response.json(searchIndex());
}
