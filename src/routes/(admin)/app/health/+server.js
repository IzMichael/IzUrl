import { json } from '@sveltejs/kit';

export function GET() {
    return json({ 'code': 200, 'status': 'ok' });
};