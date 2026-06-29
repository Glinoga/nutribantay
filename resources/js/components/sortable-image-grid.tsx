import { DndContext, pointerWithin, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Loader2, X } from 'lucide-react';
import { useState } from 'react';

export interface SortableImageItem {
    id: string;
    url: string;
}

interface SortableImageGridProps {
    items: SortableImageItem[];
    onReorder: (items: SortableImageItem[]) => void;
    onRemove?: (id: string) => void;
    deletingId?: string | null;
    deletable?: boolean;
}

function SortableImage({
    item,
    index,
    onRemove,
    isDeleting,
    deletable,
}: {
    item: SortableImageItem;
    index: number;
    onRemove?: (id: string) => void;
    isDeleting: boolean;
    deletable: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative aspect-[4/3] overflow-hidden rounded-md border border-teal-100 shadow-sm dark:border-gray-600 ${isDragging ? 'z-50 opacity-50' : ''}`}
        >
            <img src={item.url} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />

            <button
                type="button"
                {...attributes}
                {...listeners}
                className="absolute top-1 left-1 z-10 cursor-grab rounded bg-black/40 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                aria-label="Drag to reorder"
            >
                <GripVertical size={14} />
            </button>

            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                {index + 1}
            </span>

            {deletable && onRemove && (
                <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    disabled={isDeleting}
                    className="absolute top-1 right-1 z-10 rounded-full bg-red-500/90 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600 disabled:opacity-100"
                    aria-label="Remove image"
                >
                    {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X size={14} />}
                </button>
            )}
        </div>
    );
}

export default function SortableImageGrid({
    items,
    onReorder,
    onRemove,
    deletingId = null,
    deletable = true,
}: SortableImageGridProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((i) => i.id === String(active.id));
        const newIndex = items.findIndex((i) => i.id === String(over.id));
        onReorder(arrayMove(items, oldIndex, newIndex));
    };

    const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

    return (
        <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {items.map((item, index) => (
                        <SortableImage
                            key={item.id}
                            item={item}
                            index={index}
                            onRemove={onRemove}
                            isDeleting={deletingId === item.id}
                            deletable={deletable}
                        />
                    ))}
                </div>
            </SortableContext>
            <DragOverlay>
                {activeItem ? (
                    <div className="aspect-[4/3] overflow-hidden rounded-md border-2 border-teal-400 shadow-lg">
                        <img src={activeItem.url} alt="" className="h-full w-full object-cover" />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
