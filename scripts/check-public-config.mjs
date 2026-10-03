// Stop BEFORE Vite generates a bundle if a server key is put in frontend env.
import { loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import { publicConfigError, publicEnvError } from "../src/lib/public-config.js";

const env = loadEnv(process.argv[2] || "production", fileURLToPath(new URL("..", import.meta.url)), "VITE_");
const error = publicConfigError((process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || "").trim(),
  (process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || "").trim());
if (error) throw new Error(error);
const environmentError = publicEnvError({ ...env, ...Object.fromEntries(Object.entries(process.env).filter(([name]) => name.startsWith("VITE_"))) });
if (environmentError) throw new Error(environmentError);
