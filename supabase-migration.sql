
-- Add chapter_id field to user_test_results table if it doesn't exist
ALTER TABLE user_test_results ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES chapters(id);

-- Add index to improve performance of test history queries
CREATE INDEX IF NOT EXISTS idx_user_test_results_user_chapter ON user_test_results(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_user_test_results_user_course ON user_test_results(user_id, course_id);

-- Index for faster access to last accessed lesson
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_course ON user_lesson_progress(user_id, course_id, updated_at);
