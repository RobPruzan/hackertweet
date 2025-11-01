'use client';

import { useState } from 'react';

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

interface User {
  id: string;
  name: string;
  username: string;
}

export default function Home() {
  const [username, setUsername] = useState('');
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTweets = async (user?: string) => {
    const searchUser = user || username;
    if (!searchUser.trim()) return;
    
    setLoading(true);
    setError('');
    setTweets([]);
    setUser(null);

    try {
      const response = await fetch(`/api/tweets?username=${encodeURIComponent(searchUser)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.detail || data.error || 'Failed to fetch tweets');
        return;
      }

      setUser(data.user);
      setTweets(data.tweets);
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const quickLoad = (username: string) => {
    setUsername(username);
    fetchTweets(username);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="min-h-screen bg-[#f6f6ef]">
      <div className="bg-[#ff6600] px-2 py-1 flex items-center gap-2 text-sm">
        <div className="font-bold text-white">
          <span className="border border-white px-1">X</span>
        </div>
        <div className="font-bold">
          <span className="text-black">Hacker</span>
          <span className="text-white">Tweet</span>
        </div>
        <div className="flex-1 flex items-center gap-4 text-black">
          <button onClick={() => quickLoad('elonmusk')} className="hover:underline">trending</button>
          <button onClick={() => quickLoad('paulg')} className="hover:underline">paulg</button>
          <button onClick={() => quickLoad('naval')} className="hover:underline">naval</button>
          <button onClick={() => quickLoad('sama')} className="hover:underline">sama</button>
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchTweets()}
          placeholder="username"
          className="px-2 py-0.5 text-xs border border-[#828282] bg-white"
          disabled={loading}
        />
        <button
          onClick={() => fetchTweets()}
          disabled={loading}
          className="text-black hover:underline"
        >
          {loading ? 'loading...' : 'go'}
        </button>
      </div>

      <div className="max-w-5xl mx-auto bg-[#f6f6ef] px-2 py-2">
        {error && (
          <div className="py-4 px-2 text-sm text-[#828282]">
            {error}
          </div>
        )}

        {user && (
          <div className="py-2 px-2 text-sm border-b border-[#ff6600] mb-2">
            <span className="font-bold">{user.name}</span>
            <span className="text-[#828282]"> (@{user.username})</span>
          </div>
        )}

        <table className="w-full" cellSpacing="0" cellPadding="0">
          <tbody>
            {tweets.map((tweet, idx) => (
              <tr key={tweet.id} className="align-top">
                <td className="text-[#828282] pr-2 text-right" style={{ fontSize: '10px', width: '30px' }}>
                  {idx + 1}.
                </td>
                <td className="pb-1">
                  <div className="text-sm leading-tight">
                    {tweet.text}
                  </div>
                  <div className="text-[#828282] mt-0.5" style={{ fontSize: '9px' }}>
                    <span>{tweet.public_metrics.like_count} points</span>
                    <span className="mx-1">|</span>
                    <span>{getTimeAgo(tweet.created_at)}</span>
                    <span className="mx-1">|</span>
                    <span>{tweet.public_metrics.reply_count} comments</span>
                    <span className="mx-1">|</span>
                    <span>{tweet.public_metrics.retweet_count} retweets</span>
                  </div>
                  {idx < tweets.length - 1 && (
                    <div className="h-1"></div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tweets.length === 0 && !loading && !error && (
          <div className="text-center text-[#828282] text-sm py-8">
            Enter a username or click a quick link above
          </div>
        )}
      </div>
    </div>
  );
}
