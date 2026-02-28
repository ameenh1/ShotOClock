import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface PhoneEntry {
    phone: string;
    carrier: string;
}

// Returns a random interval in minutes centered around (60 / pingsPerHour)
// with ±40% variance to keep it unpredictable
function getRandomInterval(pingsPerHour: number): number {
    const avgMinutes = 60 / pingsPerHour;
    const variance = avgMinutes * 0.4; // ±40%
    return avgMinutes - variance + Math.random() * variance * 2;
}

export async function POST(req: Request) {
    try {
        const { phones, pingsPerHour, totalHours } = await req.json() as {
            phones: PhoneEntry[];
            pingsPerHour: number;
            totalHours: number;
        };

        if (!phones || phones.length === 0) {
            return NextResponse.json({ error: 'Missing phone numbers' }, { status: 400 });
        }

        const shotsRemaining = Math.round(pingsPerHour * totalHours);

        // Insert one row per phone number, each with their own random first interval
        const inserts = phones.map(({ phone, carrier }) => {
            const minutesDelay = getRandomInterval(pingsPerHour);
            const nextShotTime = new Date(Date.now() + minutesDelay * 60000);
            return {
                phone_number: phone,
                carrier_gateway: carrier,
                status: 'active',
                shots_remaining: shotsRemaining,
                next_shot_time: nextShotTime.toISOString(),
            };
        });

        const { error } = await supabase.from('marathons').insert(inserts);
        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: `Marathon started for ${phones.length} number(s)!`,
            total_shots: shotsRemaining,
            avg_interval_minutes: Math.round(60 / pingsPerHour),
        });

    } catch (err) {
        console.error('Error starting marathon:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
