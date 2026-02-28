import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

// Random interval with ±40% variance around avgMinutes
function getRandomInterval(avgMinutes: number): number {
    const variance = avgMinutes * 0.4;
    return avgMinutes - variance + Math.random() * variance * 2;
}

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
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

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        let processedCount = 0;

        for (const person of dueShots) {
            const emailTarget = `${person.phone_number}${person.carrier_gateway}`;
            const emojis = ['🍺', '🍻', '🍸', '🍹', '🍾', '🥃'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const shotsLeft = person.shots_remaining - 1;
            const msg = `SHOT O'CLOCK! Bottoms up! ${randomEmoji}${shotsLeft > 0 ? ` (${shotsLeft} left)` : ' — Marathon complete!'}`;

            await transporter.sendMail({
                from: `Shot O'Clock <${process.env.EMAIL_USER}>`,
                to: emailTarget,
                subject: '',
                text: msg,
            });

            const newShotsRemaining = person.shots_remaining - 1;

            if (newShotsRemaining <= 0) {
                await supabase
                    .from('marathons')
                    .update({ status: 'completed', shots_remaining: 0 })
                    .eq('id', person.id);
            } else {
                // Figure out the original avg interval from shots_remaining history isn't stored,
                // so we infer avg interval from the gap between now and the original next_shot_time.
                // Fallback: use 30-min average if no context. More accurate would be storing pings_per_hour.
                // For now we store avg_interval_minutes in each row for re-use.
                const avgMinutes: number = person.avg_interval_minutes ?? 30;
                const nextTime = new Date(Date.now() + getRandomInterval(avgMinutes) * 60000);
                await supabase
                    .from('marathons')
                    .update({
                        shots_remaining: newShotsRemaining,
                        next_shot_time: nextTime.toISOString(),
                    })
                    .eq('id', person.id);
            }

            processedCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${processedCount} due shots.`,
        });

    } catch (err) {
        console.error('Cron job error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
