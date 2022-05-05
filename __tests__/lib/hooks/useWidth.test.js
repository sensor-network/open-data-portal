import { renderHook } from "@testing-library/react-hooks";
import { useWidth } from "~/lib/hooks/useWidth";

describe("useWidth", () => {
  it("should return the width of the window", () => {
    // ARRANGE: set initial window width
    global.innerWidth = 500;

    // ACT: render hook
    const { result } = renderHook(() => useWidth());

    // ASSERT: check if the width is correct
    expect(result.current).toBe(500);
  });

  it("should change when the window is resized", () => {
    // ARRANGE: set initial window width and render hook
    global.innerWidth = 500;
    const { result } = renderHook(() => useWidth());

    // ACT: change window width and trigger resize-event
    global.innerWidth = 1000;
    global.dispatchEvent(new Event("resize"));

    // ASSERT: check if the width is correct
    expect(result.current).toBe(1000);
  });
});
