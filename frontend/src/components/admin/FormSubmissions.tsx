import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

export const FormSubmissions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [formData, submissionsData] = await Promise.all([
        api.admin.getForm(id!),
        api.admin.getSubmissions(id!, 1, 100)
      ]);
      setForm(formData);
      setSubmissions(submissionsData.submissions || []);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load data: ${error.message}`);
      } else {
        toast.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!form || !submissions.length) return;
    
    const headers = [];
    const fieldKeys = [];
    
    form.fields.forEach(field => {
      headers.push(field.label);
      fieldKeys.push(field.name);
      
      // Add nested field headers
      if (field.options) {
        field.options.forEach(option => {
          if (option.nestedFields) {
            option.nestedFields.forEach(nestedField => {
              headers.push(`${field.label} → ${nestedField.label}`);
              fieldKeys.push(`${field.name}.${nestedField.name}`);
            });
          }
        });
      }
    });
    
    const rows = submissions.map(sub => 
      fieldKeys.map(key => {
        const value = sub.answers[key];
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }
        return value || "";
      })
    );
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.title}-submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    );
  }

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
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Form Submissions
            </h1>
            <p className="text-muted-foreground">
              {form?.title} - {submissions.length} submissions
            </p>
          </div>
          {submissions.length > 0 && (
            <Button onClick={exportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No submissions yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Submissions Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted At</TableHead>
                    {form?.fields.map((field) => {
                      const headers = [<TableHead key={field.id}>{field.label}</TableHead>];
                      
                      // Add nested field headers
                      if (field.options) {
                        field.options.forEach(option => {
                          if (option.nestedFields) {
                            option.nestedFields.forEach(nestedField => {
                              headers.push(
                                <TableHead key={`${field.id}-${nestedField.id}`}>
                                  {field.label} → {nestedField.label}
                                </TableHead>
                              );
                            });
                          }
                        });
                      }
                      
                      return headers;
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell>
                        {new Date(submission.submittedAt).toLocaleString()}
                      </TableCell>
                      {form?.fields.map((field) => {
                        const value = submission.answers[field.name];
                        let displayValue = value || "-";
                        
                        if (typeof value === 'object' && value !== null) {
                          if (field.type === 'checkbox') {
                            displayValue = Object.entries(value)
                              .filter(([_, checked]) => checked)
                              .map(([key, _]) => key)
                              .join(', ') || "-";
                          } else {
                            displayValue = JSON.stringify(value);
                          }
                        }
                        
                        const cells = [
                          <TableCell key={field.id}>
                            {displayValue}
                          </TableCell>
                        ];
                        
                        // Add nested field data cells
                        if (field.options) {
                          field.options.forEach(option => {
                            if (option.nestedFields) {
                              option.nestedFields.forEach(nestedField => {
                                const nestedValue = submission.answers[`${field.name}.${nestedField.name}`] || "-";
                                cells.push(
                                  <TableCell key={`${field.id}-${nestedField.id}`}>
                                    {typeof nestedValue === 'object' ? JSON.stringify(nestedValue) : nestedValue}
                                  </TableCell>
                                );
                              });
                            }
                          });
                        }
                        
                        return cells;
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};