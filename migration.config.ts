import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

const datasource = new DataSource(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'ormconfig.json'), 'utf8')));
datasource.initialize();
export default datasource;
