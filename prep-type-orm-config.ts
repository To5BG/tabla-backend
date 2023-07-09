import * as fs from 'fs';
import * as path from 'path';
import ormConfig from 'ormconfig';

let config: Record<string, unknown> = {};
const lconf = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');

lconf.replace(/(\w+)=(.+)/g, function ($0: string, $1: string, $2: string) {
  if ($1.startsWith('POSTGRES')) {
    config[$1.substring(9).toLowerCase()] = $2;
  }
  return $0;
});

config = {
  ...ormConfig(),
  ...config
};

fs.writeFileSync('ormconfig.json', JSON.stringify(config, null, 2));
