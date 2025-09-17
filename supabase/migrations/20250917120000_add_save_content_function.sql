
CREATE OR REPLACE FUNCTION public.save_content_and_deduct_credits(
    p_user_id UUID,
    p_content_type VARCHAR,
    p_title VARCHAR,
    p_description TEXT,
    p_subject VARCHAR,
    p_grade_level VARCHAR,
    p_language VARCHAR,
    p_curriculum_standards JSONB,
    p_content_data JSONB,
    p_credits_to_deduct INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_content_id UUID;
    current_credits INT;
    new_credits_remaining INT;
    transaction_details JSONB;
BEGIN
    -- Check if user has enough credits
    SELECT credits_remaining INTO current_credits FROM public.profiles WHERE id = p_user_id;

    IF current_credits IS NULL OR current_credits < p_credits_to_deduct THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;

    -- Insert the new educational content
    INSERT INTO public.educational_content (user_id, content_type, title, description, subject, grade_level, language, curriculum_standards, content_data)
    VALUES (p_user_id, p_content_type, p_title, p_description, p_subject, p_grade_level, p_language, p_curriculum_standards, p_content_data)
    RETURNING id INTO new_content_id;

    -- Deduct credits from the user's profile
    UPDATE public.profiles
    SET credits_remaining = credits_remaining - p_credits_to_deduct
    WHERE id = p_user_id
    RETURNING credits_remaining INTO new_credits_remaining;

    -- Record the credit transaction
    transaction_details := jsonb_build_object(
        'content_id', new_content_id,
        'content_type', p_content_type,
        'title', p_title
    );

    INSERT INTO public.credit_transactions (user_id, credits_used, credits_remaining, action_type, action_details, content_id)
    VALUES (p_user_id, p_credits_to_deduct, new_credits_remaining, 'generation', transaction_details, new_content_id);

    -- Return the new content ID and remaining credits
    RETURN jsonb_build_object(
        'new_content_id', new_content_id,
        'credits_remaining', new_credits_remaining
    );
END;
$$;

