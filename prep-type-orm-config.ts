import * as fs from 'fs';
import * as path from 'path';

const ormPath = path.resolve(__dirname, 'ormconfig.json');
if (fs.existsSync(ormPath)) fs.unlinkSync(ormPath);

import('ormconfig').then(module => {
  let config: Record<string, unknown> = {};
  const lconf = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');

  lconf.replace(/(\w+)=(.+)/g, function ($0: string, $1: string, $2: string) {
    if ($1.startsWith('POSTGRES')) {
      config[$1.substring(9).toLowerCase()] = $2;
    }
    return $0;
  });

  config = {
    ...module.default(),
    ...config
  };

  fs.writeFileSync('ormconfig.json', JSON.stringify(config, null, 2));
});
