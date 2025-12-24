-- ============================================
-- CampuSphere Supabase Schema
-- Registration Flow Backend
-- ============================================

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- This table extends auth.users with application-specific data
-- collected during the 2-step registration flow.

CREATE TABLE IF NOT EXISTS public.profiles (
    -- Primary Key linked to auth.users
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic Info (Step 1)
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    
    -- Role Selection (Step 1)
    -- 'ogrenci' = Student, 'mezun' = Alumnus, 'akademisyen' = Academician
    role TEXT NOT NULL CHECK (role IN ('ogrenci', 'mezun', 'akademisyen')) DEFAULT 'ogrenci',
    
    -- Academic Info (Step 2)
    faculty TEXT,
    department TEXT,
    
    -- Verification Document Reference
    -- Stores the path to the uploaded file in storage bucket
    verification_document_path TEXT,
    
    -- Verification Status (24-48 hour review process)
    -- 'pending' = Awaiting admin review
    -- 'approved' = Verified and active
    -- 'rejected' = Verification failed
    verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    verification_reviewed_at TIMESTAMPTZ,
    verification_reviewed_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    
    -- Profile Visibility & Ghost Mode
    is_visible BOOLEAN NOT NULL DEFAULT true,
    is_ghost_mode BOOLEAN NOT NULL DEFAULT false,
    
    -- Avatar (optional, can be Dicebear or uploaded)
    avatar_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_faculty ON public.profiles(faculty);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- ============================================
-- 2. AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================
-- This trigger automatically creates a profile row
-- when a new user signs up via Supabase Auth.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) - PROFILES
-- ============================================
-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can view other verified & visible profiles
CREATE POLICY "Users can view other visible profiles"
    ON public.profiles
    FOR SELECT
    USING (
        verification_status = 'approved' 
        AND is_visible = true 
        AND is_ghost_mode = false
    );

-- Policy: Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Users cannot delete profiles (admin only via service role)
-- No DELETE policy = denied by default


-- ============================================
-- 4. STORAGE BUCKET - VERIFICATION DOCUMENTS
-- ============================================
-- Run these in SQL Editor or use Supabase Dashboard

-- Create the bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'verification-documents',
    'verification-documents',
    false,  -- Private bucket
    5242880,  -- 5MB max file size
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- 5. STORAGE POLICIES - VERIFICATION DOCUMENTS
-- ============================================

-- Policy: Users can upload their own verification documents
-- Path structure: {user_id}/{filename}
CREATE POLICY "Users can upload own verification docs"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'verification-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can view their own verification documents
CREATE POLICY "Users can view own verification docs"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'verification-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can update/replace their own verification documents
CREATE POLICY "Users can update own verification docs"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'verification-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Users can delete their own verification documents
CREATE POLICY "Users can delete own verification docs"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'verification-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );


-- ============================================
-- 6. ADMIN FUNCTIONS (Optional)
-- ============================================

-- Function for admins to approve a user's verification
CREATE OR REPLACE FUNCTION public.approve_verification(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET 
        verification_status = 'approved',
        verification_reviewed_at = now(),
        verification_reviewed_by = auth.uid()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for admins to reject a user's verification
CREATE OR REPLACE FUNCTION public.reject_verification(user_id UUID, reason TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET 
        verification_status = 'rejected',
        verification_reviewed_at = now(),
        verification_reviewed_by = auth.uid(),
        rejection_reason = reason
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- 7. VERIFICATION STATUS VIEW (for admins)
-- ============================================

CREATE OR REPLACE VIEW public.pending_verifications AS
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.role,
    p.faculty,
    p.department,
    p.verification_document_path,
    p.created_at
FROM public.profiles p
WHERE p.verification_status = 'pending'
ORDER BY p.created_at ASC;
