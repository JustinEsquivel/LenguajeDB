const oracledb = require('oracledb');

const dbConfig = {
  user: 'DejandoHuellaDB',
  password: '12345',
  connectString: 'localhost:1521/orcl'
};

oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/** Conexión */
async function getConnection() {
  return oracledb.getConnection(dbConfig);
}

async function closeConnection(conn) {
  try { if (conn) await conn.close(); } catch (_) {}
}

/** Ejecutar PL/SQL (procedimientos con binds IN/OUT) */
async function callProcedure(plsql, binds = {}, options = {}) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(plsql, binds, { autoCommit: true, ...options });
    return result;
  } finally { await closeConnection(conn); }
}


async function callFunctionCursor(plsql, binds = {}) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      plsql,
      { rc: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }, ...binds },
      { autoCommit: false }
    );

    const rs = result.outBinds.rc;
    const rows = [];
    let chunk;
    do {
      chunk = await rs.getRows(100);
      if (chunk && chunk.length) rows.push(...chunk);
    } while (chunk && chunk.length);
    await rs.close();
    return rows;
  } finally { await closeConnection(conn); }
}

module.exports = { getConnection, closeConnection, callProcedure, callFunctionCursor };
