import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username') || 'twitter';
  
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  
  if (!bearerToken || bearerToken === 'your_bearer_token_here') {
    return NextResponse.json(
      { error: 'Twitter Bearer Token not configured in environment variables' },
      { status: 500 }
    );
  }

  try {
    // First, get the user ID from username
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      }
    );

    if (!userResponse.ok) {
      const errorData = await userResponse.json().catch(() => ({}));
      
      // Return more helpful error
      return NextResponse.json({ 
        error: 'Failed to authenticate with X API. Your Bearer Token may be invalid or expired.',
        details: errorData,
        help: 'Get a new Bearer Token from https://developer.x.com/en/portal/dashboard'
      }, { status: userResponse.status });
    }

    const userData = await userResponse.json();
    
    if (!userData.data) {
      return NextResponse.json({ 
        error: `User @${username} not found` 
      }, { status: 404 });
    }
    
    const userId = userData.data.id;

    // Then get their tweets
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=10&tweet.fields=created_at,public_metrics`,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      }
    );

    if (!tweetsResponse.ok) {
      const error = await tweetsResponse.json().catch(() => ({}));
      return NextResponse.json({ 
        error: 'Failed to fetch tweets',
        details: error 
      }, { status: tweetsResponse.status });
    }

    const tweetsData = await tweetsResponse.json();
    
    return NextResponse.json({
      user: userData.data,
      tweets: tweetsData.data || []
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tweets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
