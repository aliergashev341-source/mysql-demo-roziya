import mysql from "mysql2/promise";

let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 4000),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME || "roziya",
      ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
      connectionLimit: 2,
    });
  }
  return pool;
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

export default async (req) => {
  try {
    const db = getPool();
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const name = String(body.name || "").trim().slice(0, 100);
      if (!name) return json({ error: "Ism bo'sh bo'lmasin" }, 400);
      await db.execute("INSERT INTO notes (name) VALUES (?)", [name]);
    }
    const [rows] = await db.query(
      "SELECT id, name, created_at FROM notes ORDER BY id DESC LIMIT 100"
    );
    return json(rows);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
};
