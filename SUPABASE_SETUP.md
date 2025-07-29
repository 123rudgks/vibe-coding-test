# 🚀 Supabase Setup Guide for API Keys Dashboard

This guide will help you connect your API Keys Dashboard to a Supabase database.

## 📋 Prerequisites

1. A Supabase account (free tier is fine)
2. Node.js and npm installed
3. Your Next.js project set up

## 🔧 Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Choose your organization
4. Fill in your project details:
   - **Name**: `api-keys-dashboard` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to you
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

## 🗄️ Step 2: Set Up the Database

1. In your Supabase dashboard, go to the **SQL Editor** tab
2. Copy the contents of `supabase-schema.sql` file from your project
3. Paste it into the SQL Editor
4. Click **"Run"** to execute the SQL script

This will create:

- ✅ `api_keys` table with all necessary columns
- ✅ Indexes for better performance
- ✅ Row Level Security (RLS) policies
- ✅ A function to increment API usage

## 🔑 Step 3: Get Your Supabase Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (something like `https://your-project-ref.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsI...`)

## 🌍 Step 4: Set Up Environment Variables

Create a `.env.local` file in your project root (same level as `package.json`):

\`\`\`env

# Supabase Configuration

NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsI...your-anon-key
\`\`\`

⚠️ **Important**: Replace the placeholder values with your actual Supabase URL and anon key!

## 🎯 Step 5: Test the Connection

1. Restart your development server:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Go to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

3. Try creating a new API key using the "+" button

4. If everything is working, you should see:
   - ✅ No loading errors
   - ✅ Ability to create new API keys
   - ✅ Keys persisted in the database
   - ✅ All CRUD operations working

## 🛠️ Troubleshooting

### Issue: "Failed to load API keys"

- ✅ Check your environment variables are correct
- ✅ Ensure your Supabase project is running
- ✅ Verify the SQL script was executed successfully

### Issue: "Insert/Update failed"

- ✅ Check if RLS policies are set up correctly
- ✅ For testing, the "Allow all operations" policy should be active
- ✅ In production, implement proper authentication

### Issue: Environment variables not loading

- ✅ Ensure `.env.local` is in the project root
- ✅ Restart your development server after creating/modifying `.env.local`
- ✅ Double-check the variable names (they must start with `NEXT_PUBLIC_`)

## 🔒 Security Notes

1. **Row Level Security**: The database is set up with RLS for production use
2. **Testing Policy**: There's a permissive policy for testing - remove this in production
3. **Environment Variables**: Never commit `.env.local` to version control
4. **API Keys**: The anon key is safe to expose in client-side code

## 🚀 What's Next?

Your API Keys Dashboard is now connected to Supabase! You can:

- ✨ Create, read, update, and delete API keys
- 📊 Track usage statistics
- 🔐 Manage key visibility
- 🎯 Set monthly usage limits

For production deployment, consider:

- Setting up proper user authentication
- Removing the testing RLS policy
- Adding more granular permissions
- Setting up database backups

## 📞 Need Help?

If you run into any issues:

1. Check the browser console for error messages
2. Verify your Supabase project status
3. Ensure all environment variables are set correctly
4. Review the SQL Editor for any failed queries

Happy coding! 🎉
