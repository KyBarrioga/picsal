"use client";

import { memo, useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { tiles } from "static/costants";
import Header from "layouts/header";

const GRID_COLUMNS = 8;
const GRID_ROWS = 4;
const GRID_CAPACITY = GRID_COLUMNS * GRID_ROWS;
const imageFiles = tiles;
const USER2_LAYOUT_STORAGE_KEY = "picsal:user2:grid-order";
const TILE_SIZE = 140;

type GridItem = {
  id: string;
  src: string;
};

function resolveImageSource(value: string) {
  if (/^https?:\/\/imgur\.com\//i.test(value)) {
    const match = value.match(/imgur\.com\/([a-zA-Z0-9]+)/i);
    if (match) {
      return `https://i.imgur.com/${match[1]}.jpg`;
    }
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  if (value.startsWith("img/")) {
    return `/static/${value}`;
  }

  return `/static/img/${value}`;
}

const DEFAULT_ITEMS: GridItem[] = imageFiles.slice(0, GRID_CAPACITY).map((image, index) => ({
  id: `tile-${index + 1}`,
  src: resolveImageSource(image),
}));

function TileCard({
  item,
  isDragging = false,
}: {
  item: GridItem;
  isDragging?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-panel ${isDragging ? "opacity-90" : ""}`}
      style={{ width: TILE_SIZE, height: TILE_SIZE }}
    >
      <img
        src={item.src}
        alt=""
        draggable={false}
        className="h-full w-full object-cover select-none"
      />
    </div>
  );
}

const SortableTile = memo(function SortableTile({
  item,
}: {
  item: GridItem;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    willChange: "transform",
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="block cursor-grab active:cursor-grabbing"
    >
      <TileCard item={item} isDragging={isDragging} />
    </div>
  );
});

export default function UserTwoPage() {
  const [items, setItems] = useState<GridItem[]>(DEFAULT_ITEMS);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? null,
    [activeId, items]
  );

  useEffect(() => {
    const savedOrder = window.localStorage.getItem(USER2_LAYOUT_STORAGE_KEY);

    if (!savedOrder) {
      return;
    }

    try {
      const orderedIds = JSON.parse(savedOrder) as string[];
      const itemsById = new Map(DEFAULT_ITEMS.map((item) => [item.id, item]));
      const restoredItems = orderedIds
        .map((id) => itemsById.get(id))
        .filter((item): item is GridItem => Boolean(item));
      const missingItems = DEFAULT_ITEMS.filter(
        (item) => !restoredItems.some((restoredItem) => restoredItem.id === item.id)
      );

      if (restoredItems.length > 0) {
        setItems([...restoredItems, ...missingItems]);
      }
    } catch {
      window.localStorage.removeItem(USER2_LAYOUT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      USER2_LAYOUT_STORAGE_KEY,
      JSON.stringify(items.map((item) => item.id))
    );
  }, [items]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    setItems((currentItems) => {
      const oldIndex = currentItems.findIndex((item) => item.id === active.id);
      const newIndex = currentItems.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return currentItems;
      }

      return arrayMove(currentItems, oldIndex, newIndex);
    });
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <main>
      <Header />
      <div className="min-h-[calc(100vh-<header-height>px)] px-4 pb-8 sm:px-6">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-stone-400">Drag tiles to reorder the grid.</p>
          </div>

          <div className="p-0">
            <div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                measuring={{
                  droppable: {
                    strategy: MeasuringStrategy.BeforeDragging,
                  },
                }}
                autoScroll={false}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <SortableContext items={itemIds} strategy={rectSortingStrategy}>
                  <div
                    className="grid justify-center gap-0"
                    style={{ gridTemplateColumns: `repeat(auto-fit, ${TILE_SIZE}px)` }}
                  >
                    {items.map((item) => (
                      <SortableTile key={item.id} item={item} />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay dropAnimation={null}>
                  {activeItem ? (
                    <div style={{ width: TILE_SIZE, height: TILE_SIZE }}>
                      <TileCard item={activeItem} isDragging />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
