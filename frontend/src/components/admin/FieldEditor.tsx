import { useState } from "react";
import { Plus, GripVertical, Trash2, Edit } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FieldType } from "@/types/form";
import { FieldModal } from "./FieldModal";
import { Badge } from "@/components/ui/badge";

interface FieldEditorProps {
  fields: FormField[];
  setFields: (fields: FormField[]) => void;
  onFieldsChange?: () => void;
}

export const FieldEditor = ({ fields, setFields, onFieldsChange }: FieldEditorProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedFields = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setFields(reorderedFields);
    onFieldsChange?.();
  };

  const handleAddField = (field: FormField) => {
    if (editingField) {
      setFields(fields.map((f) => (f.id === field.id ? field : f)));
    } else {
      setFields([...fields, field]);
    }
    setIsModalOpen(false);
    setEditingField(null);
    onFieldsChange?.();
  };

  const handleEditField = (field: FormField) => {
    setEditingField(field);
    setIsModalOpen(true);
  };

  const handleDeleteField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    onFieldsChange?.();
  };

  const getFieldTypeColor = (type: FieldType) => {
    const colors: Record<FieldType, string> = {
      text: "bg-blue-100 text-blue-800",
      textarea: "bg-purple-100 text-purple-800",
      number: "bg-green-100 text-green-800",
      email: "bg-yellow-100 text-yellow-800",
      date: "bg-pink-100 text-pink-800",
      checkbox: "bg-indigo-100 text-indigo-800",
      radio: "bg-orange-100 text-orange-800",
      select: "bg-cyan-100 text-cyan-800",
      file: "bg-red-100 text-red-800",
    };
    return colors[type];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Form Fields</CardTitle>
          <Button
            onClick={() => {
              setEditingField(null);
              setIsModalOpen(true);
            }}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No fields yet. Click "Add Field" to create one.
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {fields
                    .sort((a, b) => a.order - b.order)
                    .map((field, index) => (
                      <Draggable
                        key={field.id}
                        draggableId={field.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 p-4 bg-card border rounded-lg ${
                              snapshot.isDragging ? "shadow-lg" : ""
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">
                                  {field.label}
                                </span>
                                {field.required && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Required
                                  </Badge>
                                )}
                                <Badge
                                  className={getFieldTypeColor(field.type)}
                                >
                                  {field.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Name: {field.name}
                                {field.options &&
                                  ` • ${field.options.length} options`}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditField(field)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteField(field.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </CardContent>

      <FieldModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingField(null);
        }}
        onSave={handleAddField}
        field={editingField}
        existingFieldNames={fields
          .map((f) => f.name)
          .filter((name) => name !== editingField?.name)}
      />
    </Card>
  );
};
