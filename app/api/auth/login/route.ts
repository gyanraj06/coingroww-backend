import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Create a server-side Supabase client with the service role key to bypass RLS/policies if needed,
// but for the 'admins' table we just need to query it.
// Actually, since we are doing a custom auth table, we can just use the standard client
// if the table has read access, OR use the service role key to be safe and ensure we can read secrets.
// Given strict security requirements usually, let's use the service role key for the auth check
// to ensure no one else can read this table.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Query the admins table
    // NOTE: In a real app, you MUST compare hashed passwords (e.g. using bcrypt).
    // The user explicitly requested a "simple table" and "use those auth details",
    // so we are doing direct comparison for now as requested.
    const { data: admin, error } = await supabaseAdmin
      .from("admins")
      .select("*")
      .eq("email", email)
      .eq("password", password) // Plain text comparison as requested
      .single();

    if (error || !admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Login successful
    const response = NextResponse.json({ success: true }, { status: 200 });

    // Set a simple session cookie
    // In production, sign this with a JWT secret.
    // For this prototype/request, a simple flag or the admin ID is sufficient.
    const oneDay = 24 * 60 * 60 * 1000;
    response.cookies.set("admin_session", admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: oneDay,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
