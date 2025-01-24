import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://ctw00373:123@127.0.0.1:5433/work_diary",
});

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get("date");

    let query = "SELECT * FROM diary_entries";
    let params = [];

    if (date) {
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
