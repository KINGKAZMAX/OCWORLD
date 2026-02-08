import { createEdgeSpark } from "@edgespark/client";
import "@edgespark/client/styles.css";

// Use local backend in development, cloud in production
const isLocal = import.meta.env.DEV && import.meta.env.VITE_USE_LOCAL_BACKEND === 'true';
const WORKER_URL = isLocal 
  ? "http://localhost:3001" 
  : "https://staging--hp9ysdfdfpe5mvdu7bt3.youbase.cloud";

export const client = createEdgeSpark({ baseUrl: WORKER_URL });

export { WORKER_URL };
