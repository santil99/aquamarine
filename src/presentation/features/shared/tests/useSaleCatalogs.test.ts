import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSaleCatalogs } from "@/presentation/features/shared/useSaleCatalogs";

const catalogs = { categories: [], paymentMethods: [] };
const WAIT_OPTIONS = { timeout: 20000 };
const LONG_TEST_TIMEOUT = 40000;

function failingFirst(times: number) {
  const loadCatalogs = vi.fn<() => Promise<typeof catalogs>>();
  for (let index = 0; index < times; index += 1) {
    loadCatalogs.mockRejectedValueOnce(new Error("network"));
  }
  return loadCatalogs.mockResolvedValue(catalogs);
}

describe("useSaleCatalogs", () => {
  it("retries a failed load automatically and succeeds", async () => {
    const loadCatalogs = failingFirst(1);

    const { result } = renderHook(() => useSaleCatalogs(loadCatalogs));

    await waitFor(() => expect(result.current.state.status).toBe("success"), WAIT_OPTIONS);
    expect(loadCatalogs).toHaveBeenCalledTimes(2);
  }, LONG_TEST_TIMEOUT);

  it("shows an error after exhausting automatic retries", async () => {
    const loadCatalogs = vi.fn(() => Promise.reject(new Error("network")));

    const { result } = renderHook(() => useSaleCatalogs(loadCatalogs));

    await waitFor(() => expect(result.current.state.status).toBe("error"), WAIT_OPTIONS);
    expect(loadCatalogs).toHaveBeenCalledTimes(4);
  }, LONG_TEST_TIMEOUT);

  it("reloads catalogs when the user retries manually", async () => {
    const loadCatalogs = failingFirst(4);

    const { result } = renderHook(() => useSaleCatalogs(loadCatalogs));
    await waitFor(() => expect(result.current.state.status).toBe("error"), WAIT_OPTIONS);

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.state.status).toBe("success"), WAIT_OPTIONS);
  }, LONG_TEST_TIMEOUT);

  it("reloads catalogs when the app comes back to the foreground after an error", async () => {
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    const loadCatalogs = failingFirst(4);

    const { result } = renderHook(() => useSaleCatalogs(loadCatalogs));
    await waitFor(() => expect(result.current.state.status).toBe("error"), WAIT_OPTIONS);

    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await waitFor(() => expect(result.current.state.status).toBe("success"), WAIT_OPTIONS);
    visibility.mockRestore();
  }, LONG_TEST_TIMEOUT);

  it("stops retrying when unmounted", async () => {
    const loadCatalogs = vi.fn(() => Promise.reject(new Error("network")));

    const { unmount } = renderHook(() => useSaleCatalogs(loadCatalogs));
    await waitFor(() => expect(loadCatalogs).toHaveBeenCalledTimes(1));

    unmount();
    await new Promise((resolve) => setTimeout(resolve, 2500));

    expect(loadCatalogs).toHaveBeenCalledTimes(1);
  });
});
