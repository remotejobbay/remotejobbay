// test-require.js (in your scripts folder)
console.log("Testing requires...");
try {
    require('axios');
    console.log("✓ axios loaded");
    require('cheerio');
    console.log("✓ cheerio loaded");
    require('@supabase/supabase-js');
    console.log("✓ @supabase/supabase-js loaded");
    require('dotenv');
    console.log("✓ dotenv loaded");
    console.log("✅ All dependencies loaded successfully!");
} catch (error) {
    console.error("❌ Error:", error.message);
}