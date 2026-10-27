import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSaleCatalogs } from "@/presentation/features/shared/useSaleCatalogs";

const catalogs = { categories: [], paymentMethods: [] };
const WAIT_OPTIONS = { timeout: 5000 };

describe("useSaleCatalogs", () => {
  it("retries a failed load automatically and succeeds", async () => {
    const loadCatalogs = vi
      .fn<() => Promise<typeof catalogs>>()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue(catalogs);

    const { result } = renderHook(() => useSaleCatalogs(loadCatalogs));

    await waitFor(() => expect(result.current.state.status).toBe("success"), WAIT_OPTIONS);
    expect(loadCatalogs).toHaveBeenCalledTimes(2);
  });

  it("shows an error after exhausting automatic retries", async () => {
    const loadCatalogs = vi.fn(() => Promise.reject(new Error("network")));

    const { result } = renderHook(() => useSaleCatalogs(loadCatalogs));

    await waitFor(() => expect(result.current.state.status).toBe("error"), WAIT_OPTIONS);
    expect(loadCatalogs).toHaveBeenCalledTimes(3);
  });

  it("reloads catalogs when the user retries manually", async () => {
    const loadCatalogs = vi
      .fn<() => Promise<typeof catalogs>>()
      .mockRejectedValueOnce(new Error("network"))
      .mockRejectedValueOnce(new Error("network"))
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue(catalogs);

    const { result } = renderHook(() => useSaleCatalogs(loadCatalogs));
    await waitFor(() => expect(result.current.state.status).toBe("error"), WAIT_OPTIONS);

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.state.status).toBe("success"), WAIT_OPTIONS);
  });

  it("stops retrying when unmounted", async () => {
    const loadCatalogs = vi.fn(() => Promise.reject(new Error("network")));

    const { unmount } = renderHook(() => useSaleCatalogs(loadCatalogs));
    await waitFor(() => expect(loadCatalogs).toHaveBeenCalledTimes(1));

    unmount();
    await new Promise((resolve) => setTimeout(resolve, 2500));

    expect(loadCatalogs).toHaveBeenCalledTimes(1);
  });
});
