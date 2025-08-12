const oracledb = require('oracledb');

// Configuración de la conexión
const dbConfig = {
  user: 'DejandoHuellaDB',
  password: '12345',
  connectString: 'localhost:1521/orcl' // Ajusta según tu configuración
};

// Inicializar el cliente Oracle
oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });

// Función para conectar
async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    return connection;
  } catch (err) {
    console.error('Error al conectar a Oracle:', err);
    throw err;
  }
}

// Función para cerrar conexión
async function closeConnection(connection) {
  try {
    if (connection) {
      await connection.close();
    }
  } catch (err) {
    console.error('Error al cerrar conexión:', err);
  }
}

// Función para obtener el próximo valor de secuencia
async function getNextSeqValue(sequenceName) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT ${sequenceName}.NEXTVAL FROM dual`
    );
    return result.rows[0][0];
  } catch (err) {
    throw err;
  } finally {
    await closeConnection(connection);
  }
}

module.exports = { getConnection, closeConnection, getNextSeqValue };