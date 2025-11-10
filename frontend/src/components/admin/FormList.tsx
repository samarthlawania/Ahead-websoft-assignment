import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, ApiError } from "@/lib/api";
import { Form } from "@/types/form";
import { toast } from "sonner";

export const FormList = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getForms();
      setForms(data);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load forms: ${error.message}`);
      } else {
        toast.error("Failed to load forms");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await api.admin.deleteForm(id);
        setForms(forms.filter(form => (form.id || form._id) !== id));
        toast.success("Form deleted successfully");
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(`Failed to delete form: ${error.message}`);
        } else {
          toast.error("Failed to delete form");
        }
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Forms</h1>
          <p className="text-muted-foreground">Manage your dynamic forms</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/admin/forms/new")} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Form
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.reload();
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading forms...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
          <Card key={form.id || form._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <FileText className="h-8 w-8 text-primary mb-2" />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/admin/forms/${form.id || form._id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(form.id || form._id!, form.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-xl">{form.title}</CardTitle>
              <CardDescription>{form.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{form.fields.length} fields</span>
                <span>Updated {new Date(form.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="space-y-2 mt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/forms/${form.id || form._id}`)}
                  >
                    Preview Form
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      const url = `${window.location.origin}/forms/${form.id || form._id}`;
                      navigator.clipboard.writeText(url);
                      toast.success('Form URL copied to clipboard!');
                    }}
                  >
                    Share
                  </Button>
                </div>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => navigate(`/admin/forms/${form.id || form._id}/submissions`)}
                >
                  View Submissions
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {!loading && forms.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No forms yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first form to get started
          </p>
          <Button onClick={() => navigate("/admin/forms/new")} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Form
          </Button>
        </div>
      )}
    </div>
  );
};
