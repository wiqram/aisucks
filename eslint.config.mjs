// Flat config. The scaffold shipped a `lint` script with no config file, so
// `npm run lint` errored out instead of linting anything.
import next from 'eslint-config-next';
import coreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...next,
  ...coreWebVitals,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts']
  }
];

export default config;
