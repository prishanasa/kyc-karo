import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, [navigate]);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData?.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/apply");
      }
    } else {
      navigate("/auth");
    }
  };

  return null;
};

export default Index;
