import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify authorization - check if requester is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Extract JWT token
    const token = authHeader.replace("Bearer ", "");

    // Verify the user is admin using the anon key
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = await userResponse.json();

    // Check if user is admin
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=role`, {
      headers: {
        "apikey": supabaseAnonKey,
        "Authorization": `Bearer ${token}`,
      },
    });

    const profiles = await profileResponse.json();
    if (!profiles || profiles.length === 0 || profiles[0].role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only admins can delete users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the user ID to delete from request body
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent self-deletion
    if (userId === user.id) {
      return new Response(
        JSON.stringify({ error: "Cannot delete your own account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete related data first using service role
    const deletePromises = [
      // Delete transactions
      fetch(`${supabaseUrl}/rest/v1/transactions?user_id=eq.${userId}`, {
        method: "DELETE",
        headers: {
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Prefer": "return=minimal",
        },
      }),
      // Delete payment requests as student
      fetch(`${supabaseUrl}/rest/v1/payment_requests?student_id=eq.${userId}`, {
        method: "DELETE",
        headers: {
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Prefer": "return=minimal",
        },
      }),
      // Delete forum posts
      fetch(`${supabaseUrl}/rest/v1/forum_posts?author_id=eq.${userId}`, {
        method: "DELETE",
        headers: {
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Prefer": "return=minimal",
        },
      }),
      // Delete forum replies
      fetch(`${supabaseUrl}/rest/v1/forum_replies?author_id=eq.${userId}`, {
        method: "DELETE",
        headers: {
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Prefer": "return=minimal",
        },
      }),
      // Delete notifications
      fetch(`${supabaseUrl}/rest/v1/notifications?user_id=eq.${userId}`, {
        method: "DELETE",
        headers: {
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Prefer": "return=minimal",
        },
      }),
    ];

    await Promise.all(deletePromises);

    // Delete the user from Auth using admin API
    const deleteAuthResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        "apikey": supabaseServiceKey,
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
    });

    if (!deleteAuthResponse.ok) {
      const error = await deleteAuthResponse.text();
      console.error("Failed to delete auth user:", error);
      // Try to delete profile anyway
    }

    // Delete the profile (cascade might handle this but do it explicitly)
    await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: "DELETE",
      headers: {
        "apikey": supabaseServiceKey,
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Prefer": "return=minimal",
      },
    });

    return new Response(
      JSON.stringify({ success: true, message: "User deleted completely" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in delete-user-auth function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
