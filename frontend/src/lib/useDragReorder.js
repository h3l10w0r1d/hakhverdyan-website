import { useState } from "react";

// Native HTML5 drag-and-drop row reordering. `items` is the current list,
// `onReorder(nextItems)` fires once per completed drop with the reordered array —
// the caller applies it optimistically and persists it (e.g. a PUT /reorder call).
export default function useDragReorder(items, onReorder) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  function onDragStart(index) {
    return e => {
      setDragIndex(index);
      e.dataTransfer.effectAllowed = "move";
    };
  }

  function onDragOver(index) {
    return e => {
      e.preventDefault();
      if (index !== overIndex) setOverIndex(index);
    };
  }

  function onDrop() {
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      const next = [...items];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(overIndex, 0, moved);
      onReorder(next);
    }
    setDragIndex(null);
    setOverIndex(null);
  }

  function onDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

  return { dragIndex, overIndex, onDragStart, onDragOver, onDrop, onDragEnd };
}
