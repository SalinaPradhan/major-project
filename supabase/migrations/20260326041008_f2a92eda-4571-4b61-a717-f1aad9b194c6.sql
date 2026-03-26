
-- Add new room types to enum
ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'conference_hall';
ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'indoor_stadium';
ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'cineplex';
