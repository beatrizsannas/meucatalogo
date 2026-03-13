const supabaseUrl = 'https://relowrkvlwuccblqfmbg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlbG93cmt2bHd1Y2NibHFmbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjgxNDUsImV4cCI6MjA4ODkwNDE0NX0.ooqXrjX6hjcM3IVLOitZkMZSaB7dBDQc0xuNgizzSFU';

async function testFetch() {
    const url = `${supabaseUrl}/rest/v1/profiles?slug=eq.sannas-sports&select=*`;

    const response = await fetch(url, {
        headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Accept': 'application/json'
        }
    });

    console.log("Headers:");
    for (const [key, value] of response.headers.entries()) {
        console.log(`${key}: ${value}`);
    }
}

testFetch();
