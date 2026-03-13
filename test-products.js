const supabaseUrl = 'https://relowrkvlwuccblqfmbg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlbG93cmt2bHd1Y2NibHFmbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjgxNDUsImV4cCI6MjA4ODkwNDE0NX0.ooqXrjX6hjcM3IVLOitZkMZSaB7dBDQc0xuNgizzSFU';

async function testFetch() {
    // 24e89d36-4f50-456d-8847-d24c8bda45d3 is the Sannas Sports profile ID
    const url = `${supabaseUrl}/rest/v1/products?profile_id=eq.24e89d36-4f50-456d-8847-d24c8bda45d3&select=*`;

    const response = await fetch(url, {
        headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Accept': 'application/json'
        }
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Data length:", data.length);
    if (data.length > 0) {
        console.log("First item name:", data[0].name);
    } else {
        console.log("Data:", data);
    }
}

testFetch();
