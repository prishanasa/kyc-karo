import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Submission {
  id: string;
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
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

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
      const { error } = await supabase
        .from("submissions")
        .update({ status: newStatus })
        .eq("id", id);

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
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Submission Details</h1>
              <p className="text-sm text-muted-foreground">{submission.end_user_email}</p>
            </div>
            <Badge className={getStatusColor(submission.status)}>{submission.status}</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Images</CardTitle>
            <CardDescription>ID document and selfie comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">ID Document</h3>
                {submission.id_image_url ? (
                  <img
                    src={submission.id_image_url}
                    alt="ID Document"
                    className="w-full rounded-lg border bg-muted aspect-[4/3] object-cover"
                  />
                ) : (
                  <div className="w-full rounded-lg border bg-muted aspect-[4/3] flex items-center justify-center text-muted-foreground">
                    No ID image available
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Selfie</h3>
                {submission.selfie_image_url ? (
                  <img
                    src={submission.selfie_image_url}
                    alt="Selfie"
                    className="w-full rounded-lg border bg-muted aspect-[4/3] object-cover"
                  />
                ) : (
                  <div className="w-full rounded-lg border bg-muted aspect-[4/3] flex items-center justify-center text-muted-foreground">
                    No selfie available
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extracted Data */}
        <Card>
          <CardHeader>
            <CardTitle>Extracted Data</CardTitle>
            <CardDescription>Information extracted from ID document</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(submission.extracted_data).length > 0 ? (
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(submission.extracted_data).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </dt>
                    <dd className="text-sm font-semibold">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No extracted data available</p>
            )}
          </CardContent>
        </Card>

        {/* AI Scores */}
        <Card>
          <CardHeader>
            <CardTitle>AI Verification Scores</CardTitle>
            <CardDescription>Automated verification analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(submission.ai_scores).length > 0 ? (
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(submission.ai_scores).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </dt>
                    <dd className="text-sm font-semibold">
                      {typeof value === "number" ? `${value}%` : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No AI scores available</p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
            <CardDescription>Approve or reject this submission</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={() => updateStatus("approved")}
                disabled={updating || submission.status === "approved"}
                className="flex-1 bg-accent hover:bg-accent/90"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => updateStatus("rejected")}
                disabled={updating || submission.status === "rejected"}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SubmissionDetail;
