import { DataSourceOptions } from 'typeorm';

export default () =>
  ({
    type: 'postgres',

    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,

    entities: [__dirname + '/**/entities/*.entity.{t,j}s'],
    synchronize: process.env.MODE === 'DEV',
    migrations: [__dirname + '/**/migration/*.{t,j}s'],
    migrationsTableName: 'migration_table',
    ssl: process.env.MODE === 'PROD'
  } as DataSourceOptions);
