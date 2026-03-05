-- Seed classes for nvaecs school
-- Tenant ID: 30998ea7-6d07-48f8-843f-ccc4af41ec4a

DO $$
DECLARE
    v_tenant_id UUID := '30998ea7-6d07-48f8-843f-ccc4af41ec4a';
    v_teacher_id UUID;
BEGIN
    -- Get the first admin/owner user for this tenant
    SELECT id INTO v_teacher_id 
    FROM user_profiles 
    WHERE tenant_id = v_tenant_id 
    AND role IN ('owner', 'admin') 
    LIMIT 1;

    IF v_teacher_id IS NULL THEN
        RAISE NOTICE 'No admin user found for tenant nvaecs. Please sign up first.';
    ELSE
        -- Insert classes
        INSERT INTO school_classes (tenant_id, name, description, teacher_id, max_students, fee_cents, schedule, updated_at)
        VALUES
            (v_tenant_id, 'Mandarin Chinese Level 1', 'Introduction to Mandarin Chinese for beginners. Focus on pinyin, basic characters, and daily conversation.', v_teacher_id, 20, 15000, '{"day": "Saturday", "time": "09:00 - 11:00", "room": "Room 101"}', now()),
            (v_tenant_id, 'Mandarin Chinese Level 2', 'Building on basic knowledge. Expanded vocabulary and more complex sentence structures.', v_teacher_id, 15, 15000, '{"day": "Saturday", "time": "11:30 - 13:30", "room": "Room 102"}', now()),
            (v_tenant_id, 'Chinese Cultural Arts', 'Explore traditional arts including calligraphy, paper cutting, and folk dancing.', v_teacher_id, 25, 12000, '{"day": "Sunday", "time": "14:00 - 16:00", "room": "Auditorium"}', now()),
            (v_tenant_id, 'Youth Wushu (Kung Fu)', 'Physical training and basic Wushu forms for students aged 7-12.', v_teacher_id, 30, 18000, '{"day": "Saturday", "time": "14:00 - 15:30", "room": "Gym"}', now())
        ON CONFLICT (tenant_id, name) DO UPDATE SET
            description = EXCLUDED.description,
            teacher_id = EXCLUDED.teacher_id,
            max_students = EXCLUDED.max_students,
            fee_cents = EXCLUDED.fee_cents,
            schedule = EXCLUDED.schedule,
            updated_at = now();
            
        RAISE NOTICE 'Successfully seeded classes for nvaecs.';
    END IF;
END $$;
