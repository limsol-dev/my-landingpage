// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.NODE_ENV = 'test'

// Mock Google OAuth credentials
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'

// Mock Kakao OAuth credentials
process.env.KAKAO_CLIENT_ID = 'test-kakao-client-id'
process.env.KAKAO_CLIENT_SECRET = 'test-kakao-client-secret'

// Mock other environment variables
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret' 