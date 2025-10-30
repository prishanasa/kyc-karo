import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Submission {
  id: number;
  end_user_email: string;
  status: string;
  id_image_url: string | null;
  selfie_image_url: string | null;
  submitted_at: string;
  extracted_data: any;
  ai_scores: any;
}

const SubmissionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    if (id) {
      fetchSubmission();
    }
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchSubmission = async () => {
    try {
      const numericId = parseInt(id || "0", 10);
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", numericId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Not Found",
          description: "Submission not found",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setSubmission(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!id) return;

    setUpdating(true);
    try {
      const numericId = parseInt(id, 10);
      const { error } = await supabase
        .from("submissions")
        .update({ status: newStatus })
        .eq("id", numericId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Submission ${newStatus} successfully`,
      });

      setSubmission((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-accent text-accent-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading submission...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Submission not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-blue-500 to-green-500 p-2">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">KYC-Karo</h1>
              <p className="text-sm text-muted-foreground">Submission Review</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Submission #{submission.id}</h2>
              <p className="text-muted-foreground mt-1">
                Submitted by {submission.end_user_email} on{" "}
                {new Date(submission.submitted_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <Badge className={getStatusColor(submission.status)}>
              {submission.status}
            </Badge>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => updateStatus("approved")}
              disabled={updating}
              size="lg"
              className="flex-1"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => updateStatus("rejected")}
              disabled={updating}
              size="lg"
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Reject
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>ID Document</CardTitle>
                </CardHeader>
                <CardContent>
                  {submission.id_image_url ? (
                    <img
                      src={submission.id_image_url}
                      alt="ID Document"
                      className="w-full rounded-lg border"
                    />
                  ) : (
                    <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                      No ID image uploaded
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Selfie Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  {submission.selfie_image_url ? (
                    <img
                      src={submission.selfie_image_url}
                      alt="Selfie"
                      className="w-full rounded-lg border"
                    />
                  ) : (
                    <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                      No selfie image uploaded
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Verification Details</CardTitle>
                <CardDescription>AI analysis and extracted information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">AI Scores</h3>
                  <div className="space-y-3">
                    {submission.ai_scores && Object.keys(submission.ai_scores).length > 0 ? (
                      Object.entries(submission.ai_scores).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                          <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                          <span className="font-bold text-lg">
                            {typeof value === "number" ? `${value}%` : String(value)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No AI scores available</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Extracted Data</h3>
                  <div className="space-y-3">
                    {submission.extracted_data && Object.keys(submission.extracted_data).length > 0 ? (
                      Object.entries(submission.extracted_data).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                          <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                          <span className="font-semibold">{String(value)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No extracted data available</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubmissionDetail;
