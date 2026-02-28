import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

// Helper function to get random minutes between 20 and 40
function getRandomInterval() {
    const min = 20;
    const max = 40;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function GET(req: Request) {
    // 1. Verify Vercel Cron Secret for security so people can't manually ping it
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Query Supabase for people whose 'next_shot_time' is now or in the past
        // AND who still have shots remaining.
        const now = new Date().toISOString();
        const { data: dueShots, error: fetchError } = await supabase
            .from('marathons')
            .select('*')
            .eq('status', 'active')
            .lte('next_shot_time', now);

        if (fetchError) throw fetchError;
        if (!dueShots || dueShots.length === 0) {
            return NextResponse.json({ success: true, message: 'No shots due.' });
        }

        // 3. Setup Nodemailer (Email-to-SMS Gateway)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Needs to be an App Password, not regular password
            }
        });

        let processedCount = 0;

        // 4. Loop through everyone who needs a text message
        for (const person of dueShots) {
            const emailTarget = `${person.phone_number}${person.carrier_gateway}`;

            const emojis = ["🍺", "🍻", "🍸", "🍹", "🍾", "🥃"];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const msg = `SHOT O'CLOCK! Bottoms up! ${randomEmoji} (${person.shots_remaining - 1} left)`;

            // Send the SMS
            await transporter.sendMail({
                from: `Shot O'Clock <${process.env.EMAIL_USER}>`,
                to: emailTarget,
                subject: '', // SMS gateways usually put subject in parenthesis or ignore it
                text: msg
            });

            // 5. Calculate new time and update Supabase
            const newShotsRemaining = person.shots_remaining - 1;

            if (newShotsRemaining <= 0) {
                // Marathon over!
                await supabase
                    .from('marathons')
                    .update({ status: 'completed', shots_remaining: 0 })
                    .eq('id', person.id);
            } else {
                // Schedule the next one!
                const nextTime = new Date(Date.now() + getRandomInterval() * 60000);
                await supabase
                    .from('marathons')
                    .update({
                        shots_remaining: newShotsRemaining,
                        next_shot_time: nextTime.toISOString()
                    })
                    .eq('id', person.id);
            }

            processedCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${processedCount} due shots.`
        });

    } catch (err) {
        console.error('Cron job error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
