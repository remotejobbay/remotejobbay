import os
from supabase import create_client
from dotenv import load_dotenv, find_dotenv

# Load Env
load_dotenv(find_dotenv('.env.local'))

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

print(f"🔹 URL: {url}")
print(f"🔹 KEY: {key[:10]}..." if key else "❌ KEY MISSING")

if not url or not key:
    print("❌ Error: Credentials missing.")
    exit()

supabase = create_client(url, key)

print("\n1️⃣  Testing Connection...")
try:
    # Try to fetch 1 row (it's okay if it's empty, we just want to see if it crashes)
    response = supabase.table("potential_jobs").select("*").limit(1).execute()
    print("✅ Connection SUCCESS!")
    print(f"   Table exists. Rows found: {len(response.data)}")
except Exception as e:
    print(f"❌ Connection FAILED: {e}")
    print("   (Did you run the SQL to create the table?)")

print("\n2️⃣  Testing Insert...")
try:
    test_data = {
        "external_id": "test_999",
        "title": "Test Job",
        "company": "Test Co",
        "source": "Manual Test"
    }
    supabase.table("potential_jobs").insert(test_data).execute()
    print("✅ Insert SUCCESS!")
    
    # Cleanup (Delete the test row)
    supabase.table("potential_jobs").delete().eq("external_id", "test_999").execute()
    print("   (Test row deleted)")
except Exception as e:
    print(f"❌ Insert FAILED: {e}")