import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper function to get random minutes between 20 and 40
function getRandomInterval() {
    const min = 20;
    const max = 40;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST(req: Request) {
    try {
        const { phone, carrier } = await req.json();

        if (!phone || !carrier) {
            return NextResponse.json({ error: 'Missing phone or carrier' }, { status: 400 });
        }

        // Determine the next shot time
        const minutesDelay = getRandomInterval();
        const nextShotTime = new Date(Date.now() + minutesDelay * 60000);

        const { data, error } = await supabase
            .from('marathons')
            .insert([
                {
                    phone_number: phone,
                    carrier_gateway: carrier,
                    status: 'active',
                    shots_remaining: 10,  // Standard 5-hour marathon: ~10 shots
                    next_shot_time: nextShotTime.toISOString(),
                }
            ])
            .select();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Marathon started!',
            first_interval_minutes: minutesDelay
        });

    } catch (err) {
        console.error('Error starting marathon:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
