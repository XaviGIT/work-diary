import pkg from "pg";
const { Pool } = pkg;

export function getPool() {
  return new Pool({
    connectionString: import.meta.env.DATABASE_URL,
    // adds max size for large content
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

let pool = null;

export async function GET({ request }) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const month = url.searchParams.get("month");

  if (!pool) {
    pool = getPool();
    console.log("DB Connection Pool created");
  }

  try {
    let query = "SELECT * FROM diary_entries";
    let params = [];

    if (month) {
      query += " WHERE to_char(entry_date, 'YYYY-MM') = $1";
      params.push(month);
    } else if (date) {
      query += " WHERE entry_date = $1";
      params.push(date);
    }

    query += " ORDER BY entry_time";
    const result = await pool.query(query, params);

    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function POST({ request }) {
  try {
    if (!pool) {
      pool = getPool();
      console.log("DB Connection Pool created");
    }

    const body = await request.json();
    console.log("Body:", body);

    // Test connection
    const testQuery = await pool.query("SELECT NOW()");
    console.log("DB Connection:", testQuery.rows[0]);

    const { date, time, description } = body;
    const result = await pool.query(
      "INSERT INTO diary_entries (entry_date, entry_time, description) VALUES ($1, $2, $3) RETURNING *",
      [date, time, description]
    );

    return new Response(JSON.stringify(result.rows[0]), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST Error:", error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE({ request }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  try {
    if (!pool) {
      pool = getPool();
      console.log("DB Connection Pool created");
    }

    await pool.query("DELETE FROM diary_entries WHERE id = $1", [id]);
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT({ request }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const { time, description } = await request.json();

  try {
    if (!pool) {
      pool = getPool();
      console.log("DB Connection Pool created");
    }

    const result = await pool.query(
      "UPDATE diary_entries SET entry_time = $1, description = $2 WHERE id = $3 RETURNING *",
      [time, description, id]
    );
    return new Response(JSON.stringify(result.rows[0]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
