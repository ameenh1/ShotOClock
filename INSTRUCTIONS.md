# How to Finish Deploying Shot O'Clock For Free

The entire application is built! It has the pixel-art React frontend, the Supabase database connection, and the Vercel Cron Job that sends Email-to-SMS text messages.

To actually make it work live on the internet, you need to do a few quick setup steps on your end:

## 1. Set up the Supabase Database (Free)
1. Go to [Supabase.com](https://supabase.com/) and create a free project.
2. Go to the SQL Editor and run this exact command to build the table:
```sql
create table public.marathons (
  id uuid default gen_random_uuid() primary key,
  phone_number text not null,
  carrier_gateway text not null,
  status text not null,
  shots_remaining integer not null default 10,
  next_shot_time timestamp with time zone not null
);
```
3. Go to **Project Settings -> API**. You will need the **Project URL** and the **Service Role Key** (the secret one, not the anon one).

## 2. Set up the Email Sender (Free)
Since we are using Email-to-SMS to keep messaging free, you need an email account to send the texts.
1. Use an existing Gmail account or create a new one (e.g., `shotoclockbot@gmail.com`).
2. Go to your Google Account Security settings. Turn on **2-Step Verification**.
3. Create an **App Password** (Search "App Passwords" in the Google Security settings). Save this 16-character password.

## 3. Deploy to Vercel (Free)
1. Push this entire folder/project to a new GitHub repository.
2. Go to [Vercel.com](https://vercel.com/) and create a new project. Connect your GitHub repository.
3. Before you hit "Deploy", add these **Environment Variables**:
   * `SUPABASE_URL`: (From Step 1)
   * `SUPABASE_SERVICE_ROLE_KEY`: (From Step 1)
   * `EMAIL_USER`: Your Gmail address
   * `EMAIL_PASS`: Your 16-character Google App Password
   * `CRON_SECRET`: Make up a random, secure password. This protects your Vercel bot from being hacked.

4. Hit Deploy! 

Your app is now live for $0 forever. The Vercel Cron Job will automatically run every 5 minutes, checking your Supabase database, and texting your friends!
