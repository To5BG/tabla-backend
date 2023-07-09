export default () => ({
  type: 'postgres',

  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,

  entities: [__dirname + '/**/entities/**'],
  synchronize: process.env.MODE === 'DEV',
  migrations: ['src/migration/*.ts'],
  migrationsTableName: 'migration',
  ssl: process.env.MODE === 'PROD'
});
