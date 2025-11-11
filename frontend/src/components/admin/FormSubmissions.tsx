import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

export const FormSubmissions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ versions: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const handleSearch = () => {
    loadData(1);
  };

  const handlePageChange = (newPage: number) => {
    loadData(newPage);
  };

  const loadData = async (page = 1) => {
    try {
      setLoading(true);
      const [formData, submissionsData] = await Promise.all([
        api.admin.getForm(id!),
        api.admin.getSubmissions(id!, {
          page,
          limit: pagination.limit,
          search: searchTerm,
          version: selectedVersion && selectedVersion !== 'all' ? parseInt(selectedVersion) : undefined,
          startDate,
          endDate
        })
      ]);
      setForm(formData);
      setSubmissions(submissionsData.submissions || []);
      setPagination(submissionsData.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      setFilters(submissionsData.filters || { versions: [] });
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
              {form?.title} - {pagination.total} submissions (v{form?.version})
            </p>
          </div>
          <div className="flex gap-2">
            {submissions.length > 0 && (
              <Button onClick={exportToCSV} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="version">Form Version</Label>
              <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger>
                  <SelectValue placeholder="All versions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All versions</SelectItem>
                  {filters.versions.map((version) => (
                    <SelectItem key={version} value={version.toString()}>
                      Version {version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleSearch}>
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No submissions found</p>
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
                    <TableHead>Version</TableHead>
                    {form?.fields.flatMap((field) => {
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
                        {new Date(submission.submittedAt).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell>
                        v{submission.formVersion}
                      </TableCell>
                      {form?.fields.flatMap((field) => {
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
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};