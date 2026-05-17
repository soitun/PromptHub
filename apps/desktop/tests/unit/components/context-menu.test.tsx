import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  ContextMenu,
  type ContextMenuItem,
} from "../../../src/renderer/components/ui/ContextMenu";

describe("ContextMenu", () => {
  function makeItems(onEach: () => void = vi.fn()): ContextMenuItem[] {
    return [
      { label: "Copy", onClick: onEach },
      { label: "Delete", onClick: onEach, variant: "destructive" },
      { label: "Disabled", onClick: vi.fn(), disabled: true },
    ];
  }

  it("renders all items at the requested position", () => {
    render(
      <ContextMenu x={50} y={80} items={makeItems()} onClose={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Disabled" })).toBeInTheDocument();
  });

  it("invokes the action and then closes when an item is clicked", () => {
    const onClose = vi.fn();
    const onClick = vi.fn();
    render(
      <ContextMenu
        x={0}
        y={0}
        items={[{ label: "Run", onClick }]}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick or close when item is disabled", () => {
    const onClose = vi.fn();
    const onClick = vi.fn();
    render(
      <ContextMenu
        x={0}
        y={0}
        items={[{ label: "Skip", onClick, disabled: true }]}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(onClick).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on outside mousedown", () => {
    const onClose = vi.fn();
    render(
      <ContextMenu x={0} y={0} items={makeItems()} onClose={onClose} />,
    );
    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when window is resized", () => {
    const onClose = vi.fn();
    render(
      <ContextMenu x={0} y={0} items={makeItems()} onClose={onClose} />,
    );
    fireEvent(window, new Event("resize"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders a shortcut hint when provided", () => {
    render(
      <ContextMenu
        x={0}
        y={0}
        items={[{ label: "Save", onClick: vi.fn(), shortcut: "⌘S" }]}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("⌘S")).toBeInTheDocument();
  });
});
