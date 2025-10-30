import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const NewSubmission = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/apply")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-blue-500 to-green-500 p-2">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              KYC-Karo
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Submit Your Documents</CardTitle>
            <CardDescription className="text-lg">
              Upload your identification documents for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg">Document upload functionality coming soon...</p>
              <p className="mt-2">This is where users will upload their ID and selfie.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NewSubmission;
