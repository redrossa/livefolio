import { neon, neonConfig } from '@neondatabase/serverless';

// Configuring Neon for local development
if (process.env.NODE_ENV === 'development') {
  neonConfig.fetchEndpoint = (host) => {
    const [protocol, port] =
      host === 'db.localtest.me' ? ['http', 4444] : ['https', 443];
    return `${protocol}://${host}:${port}/sql`;
  };
}

const sql = neon(process.env.DATABASE_URL!);

export default sql;
