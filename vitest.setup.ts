import { config } from 'dotenv'

// Point Payload at the throwaway test database, never the development one.
// `override` matters: dotenv will not replace an already-set variable without
// it, and a bare `import 'dotenv/config'` here would load .env and let
// integration tests write into real content.
config({ path: '.env.test', override: true })
