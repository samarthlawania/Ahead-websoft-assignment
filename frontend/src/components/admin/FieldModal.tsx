import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormField, FieldType, FieldOption } from "@/types/form";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FieldModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (field: FormField) => void;
  field: FormField | null;
  existingFieldNames: string[];
}

export const FieldModal = ({
  open,
  onClose,
  onSave,
  field,
  existingFieldNames,
}: FieldModalProps) => {
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<FieldType>("text");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<FieldOption[]>([{ value: "", label: "", nestedFields: [] }]);
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [regex, setRegex] = useState("");
  const [expandedOptions, setExpandedOptions] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (field) {
      setName(field.name);
      setLabel(field.label);
      setType(field.type);
      setRequired(field.required);
      setOptions(field.options || [{ value: "", label: "", nestedFields: [] }]);
      setMinValue(field.validation?.min?.toString() || "");
      setMaxValue(field.validation?.max?.toString() || "");
      setRegex(field.validation?.pattern || "");
    } else {
      resetForm();
    }
  }, [field, open]);

  const resetForm = () => {
    setName("");
    setLabel("");
    setType("text");
    setRequired(false);
    setOptions([{ value: "", label: "", nestedFields: [] }]);
    setMinValue("");
    setMaxValue("");
    setRegex("");
    setExpandedOptions(new Set());
  };

  const handleSave = () => {
    if (!name.trim() || !label.trim()) {
      toast.error("Name and label are required");
      return;
    }

    if (existingFieldNames.includes(name.trim())) {
      toast.error("A field with this name already exists");
      return;
    }

    const needsOptions = ["select", "radio", "checkbox"].includes(type);
    if (needsOptions && options.filter((o) => o.label.trim()).length === 0) {
      toast.error(`${type} fields require at least one option`);
      return;
    }

    const newField: FormField = {
      id: field?.id || uuidv4(),
      name: name.trim(),
      label: label.trim(),
      type,
      required,
      order: field?.order || Date.now(),
      validation: {
        ...(minValue && { min: Number(minValue) }),
        ...(maxValue && { max: Number(maxValue) }),
        ...(regex && { pattern: regex }),
      },
    };

    if (needsOptions) {
      newField.options = options
        .filter((o) => o.label.trim())
        .map((o) => ({
          value: o.value || o.label.toLowerCase().replace(/\s+/g, "-"),
          label: o.label.trim(),
          nestedFields: (o.nestedFields || []).map(nf => ({
            ...nf,
            id: nf.id || uuidv4(),
            name: nf.name || nf.label?.toLowerCase().replace(/\s+/g, '_') || `nested_${Date.now()}`,
            order: nf.order || Date.now()
          })),
        }));
    }

    onSave(newField);
    resetForm();
  };

  const handleAddOption = () => {
    setOptions([...options, { value: "", label: "", nestedFields: [] }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
    setExpandedOptions(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleOptionChange = (index: number, label: string) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      label,
      value: label.toLowerCase().replace(/\s+/g, "-"),
    };
    setOptions(newOptions);
  };

  const handleAddNestedField = (optionIndex: number) => {
    const newOptions = [...options];
    const nestedField: FormField = {
      id: uuidv4(),
      name: `nested_${Date.now()}`,
      label: "Nested Field",
      type: "text",
      required: false,
      order: Date.now(),
    };
    newOptions[optionIndex].nestedFields = [...(newOptions[optionIndex].nestedFields || []), nestedField];
    setOptions(newOptions);
  };

  const handleRemoveNestedField = (optionIndex: number, fieldIndex: number) => {
    const newOptions = [...options];
    newOptions[optionIndex].nestedFields = newOptions[optionIndex].nestedFields?.filter((_, i) => i !== fieldIndex) || [];
    setOptions(newOptions);
  };

  const handleNestedFieldChange = (optionIndex: number, fieldIndex: number, field: Partial<FormField>) => {
    const newOptions = [...options];
    if (newOptions[optionIndex].nestedFields) {
      newOptions[optionIndex].nestedFields[fieldIndex] = {
        ...newOptions[optionIndex].nestedFields[fieldIndex],
        ...field,
      };
      setOptions(newOptions);
    }
  };

  const toggleOptionExpanded = (index: number) => {
    setExpandedOptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const needsOptions = ["select", "radio", "checkbox"].includes(type);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{field ? "Edit Field" : "Add New Field"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Field Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., firstName"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Unique identifier for this field
              </p>
            </div>
            <div>
              <Label htmlFor="label">Field Label</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., First Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Field Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as FieldType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="textarea">Text Area</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="radio">Radio</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="file">File Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="required"
                checked={required}
                onCheckedChange={setRequired}
              />
              <Label htmlFor="required">Required Field</Label>
            </div>
          </div>

          {needsOptions && (
            <div>
              <Label>Options</Label>
              <div className="space-y-3 mt-2">
                {options.map((option, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={option.label}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {options.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {(["radio", "select"].includes(type)) && option.label.trim() && (
                      <Collapsible open={expandedOptions.has(index)} onOpenChange={() => toggleOptionExpanded(index)}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full justify-between">
                            <span>Nested Fields ({option.nestedFields?.length || 0})</span>
                            {expandedOptions.has(index) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 mt-2">
                          {option.nestedFields?.map((nestedField, fieldIndex) => (
                            <div key={nestedField.id} className="bg-muted p-3 rounded space-y-2">
                              <div className="flex gap-2 items-center">
                                <Input
                                  value={nestedField.label}
                                  onChange={(e) => handleNestedFieldChange(index, fieldIndex, { label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                  placeholder="Field label"
                                  className="flex-1"
                                />
                                <Select
                                  value={nestedField.type}
                                  onValueChange={(value) => handleNestedFieldChange(index, fieldIndex, { type: value as FieldType })}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="textarea">Text Area</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="checkbox">Checkbox</SelectItem>
                                    <SelectItem value="radio">Radio</SelectItem>
                                    <SelectItem value="select">Select</SelectItem>
                                    <SelectItem value="file">File Upload</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveNestedField(index, fieldIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              {(["radio", "select", "checkbox"].includes(nestedField.type)) && (
                                <div className="space-y-2">
                                  <Label className="text-xs">Options:</Label>
                                  {nestedField.options?.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex gap-2">
                                      <Input
                                        value={opt.label}
                                        onChange={(e) => {
                                          const newOptions = [...(nestedField.options || [])];
                                          newOptions[optIndex] = { ...opt, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '-') };
                                          handleNestedFieldChange(index, fieldIndex, { options: newOptions });
                                        }}
                                        placeholder={`Option ${optIndex + 1}`}
                                        className="text-xs"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const newOptions = nestedField.options?.filter((_, i) => i !== optIndex) || [];
                                          handleNestedFieldChange(index, fieldIndex, { options: newOptions });
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newOptions = [...(nestedField.options || []), { value: "", label: "" }];
                                      handleNestedFieldChange(index, fieldIndex, { options: newOptions });
                                    }}
                                    className="text-xs"
                                  >
                                    <Plus className="mr-1 h-3 w-3" />
                                    Add Option
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddNestedField(index)}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Nested Field
                          </Button>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Validation Rules</h4>
            <div className="grid grid-cols-2 gap-4">
              {(type === "number" ||
                type === "text" ||
                type === "textarea") && (
                <>
                  <div>
                    <Label htmlFor="min">
                      {type === "number" ? "Minimum Value" : "Minimum Length"}
                    </Label>
                    <Input
                      id="min"
                      type="number"
                      value={minValue}
                      onChange={(e) => setMinValue(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max">
                      {type === "number" ? "Maximum Value" : "Maximum Length"}
                    </Label>
                    <Input
                      id="max"
                      type="number"
                      value={maxValue}
                      onChange={(e) => setMaxValue(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </>
              )}
              {type === "text" && (
                <div className="col-span-2">
                  <Label htmlFor="regex">Custom Regex Pattern</Label>
                  <Input
                    id="regex"
                    value={regex}
                    onChange={(e) => setRegex(e.target.value)}
                    placeholder="e.g., ^[A-Za-z]+$"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {field ? "Update Field" : "Add Field"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
