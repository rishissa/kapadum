export default {
  dialect: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "fsociety",
  database: "kapadum_db",
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 100000,
  },
  logging: false,
};
