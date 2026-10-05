import { NextResponse } from "next/server";

/**
 * Minimal health endpoint. Returns a static healthy status today — no DB
 * or external dependency check is performed in this demo. A future
 * monitoring pipeline (see src/monitoring) can extend this to run real
 * checks and report through src/integrations/crm.
 */
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "crestix-clinic-reservation-system",
    version: "0.1.0",
  });
}
