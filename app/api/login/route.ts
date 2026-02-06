import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const { username } = body;

    if (!username) {
        return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Create the response
    const response = NextResponse.json({
        message: 'Logged in successfully',
        username: username,
    });

    // Set the cookie
    response.cookies.set('username', username, {
        httpOnly: false, // Accessible by client-side JS (needed for socket.io later maybe)
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
}