-- Create submissions table for KYC verification
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  end_user_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  id_image_url TEXT,
  selfie_image_url TEXT,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  ai_scores JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read all submissions
CREATE POLICY "Authenticated users can view all submissions"
  ON public.submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for authenticated users to update submissions
CREATE POLICY "Authenticated users can update submissions"
  ON public.submissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_submitted_at ON public.submissions(submitted_at DESC);
CREATE INDEX idx_submissions_email ON public.submissions(end_user_email);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();