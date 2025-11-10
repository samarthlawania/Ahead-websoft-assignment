import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api";
import { Form } from "@/types/form";
import { FieldEditor } from "./FieldEditor";
import { toast } from "sonner";

export const FormEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNewForm = id === "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<Form["fields"]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNewForm && id) {
      loadForm(id);
    }
  }, [id, isNewForm]);

  const loadForm = async (formId: string) => {
    try {
      setLoading(true);
      const form = await api.admin.getForm(formId);
      setTitle(form.title);
      setDescription(form.description);
      setFields(form.fields);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load form: ${error.message}`);
      } else {
        toast.error("Failed to load form");
      }
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!title.trim() || isNewForm) return;
    
    const formData = { title, description, fields };
    
    try {
      await api.admin.updateForm(id!, formData);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a form title");
      return;
    }

    const formData = {
      title,
      description,
      fields,
    };

    try {
      setSaving(true);
      if (isNewForm) {
        await api.admin.createForm(formData);
        toast.success("Form created successfully");
      } else if (id) {
        await api.admin.updateForm(id, formData);
        toast.success("Form updated successfully");
      }
      navigate("/admin");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to save form: ${error.message}`);
      } else {
        toast.error("Failed to save form");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forms
        </Button>
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-foreground">
            {isNewForm ? "Create New Form" : "Edit Form"}
          </h1>
          <Button onClick={handleSave} size="lg" disabled={saving || loading}>
            <Save className="mr-2 h-5 w-5" />
            {saving ? "Saving..." : "Save Form"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter form title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter form description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <FieldEditor fields={fields} setFields={setFields} onFieldsChange={autoSave} />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Form Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {title || "Form Title"}
                  </h2>
                  <p className="text-muted-foreground">
                    {description || "Form description"}
                  </p>
                </div>
                {fields.length > 0 ? (
                  <div className="space-y-4 border-t pt-4">
                    {fields
                      .sort((a, b) => a.order - b.order)
                      .map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label>
                            {field.label}
                            {field.required && (
                              <span className="text-destructive ml-1">*</span>
                            )}
                          </Label>
                          {field.type === "textarea" ? (
                            <Textarea
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              disabled
                            />
                          ) : field.type === "select" ? (
                            <select
                              className="w-full px-3 py-2 border rounded-md"
                              disabled
                            >
                              <option>Select an option</option>
                              {field.options?.map((opt) => (
                                <option key={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          ) : field.type === "radio" ||
                            field.type === "checkbox" ? (
                            <div className="space-y-2">
                              {field.options?.map((opt) => (
                                <div
                                  key={opt.value}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type={field.type}
                                    name={field.name}
                                    disabled
                                  />
                                  <span className="text-sm">{opt.label}</span>
                                </div>
                              ))}
                            </div>
                          ) : field.type === "file" ? (
                            <Input
                              type="file"
                              disabled
                            />
                          ) : (
                            <Input
                              type={field.type}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              disabled
                            />
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No fields added yet. Add fields to see the preview.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      )}
    </div>
  );
};
