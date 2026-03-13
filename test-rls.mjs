import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://relowrkvlwuccblqfmbg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlbG93cmt2bHd1Y2NibHFmbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjgxNDUsImV4cCI6MjA4ODkwNDE0NX0.ooqXrjX6hjcM3IVLOitZkMZSaB7dBDQc0xuNgizzSFU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    const { data, error } = await supabase.from('profiles').select('*').limit(5);
    console.log("Data:", data);
    console.log("Error:", error);
}

test();
