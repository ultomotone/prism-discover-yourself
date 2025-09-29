-- Grant execute permission on the function to public role
GRANT EXECUTE ON FUNCTION public.start_assessment_with_cleanup(text, uuid) TO public;
GRANT EXECUTE ON FUNCTION public.start_assessment_with_cleanup(text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.start_assessment_with_cleanup(text, uuid) TO authenticated;