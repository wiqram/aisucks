import { NextResponse } from 'next/server';

// Liveness/readiness endpoint hit by the k8s probes in deployment.yaml.
// Web-only scaffold: no database yet, so this is a pure process-health check.
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'aisucks-web',
    version: process.env.APP_VERSION ?? '0.1.0',
    timestamp: new Date().toISOString()
  });
}
