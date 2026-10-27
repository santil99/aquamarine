const PAGE_SIZE = 1000;

interface PageResult<T> {
  data: T[] | null;
  error: Error | null;
}

/** Supabase returns at most 1000 rows per request, so ranges are fetched page by page. */
export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
): Promise<T[]> {
  const rows: T[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    rows.push(...(data ?? []));

    if ((data?.length ?? 0) < PAGE_SIZE) {
      return rows;
    }
  }
}
