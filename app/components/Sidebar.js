'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton, useUser, UserButton } from '@clerk/nextjs';
import { Button } from './ui/button';

function Sidebar() {
  const { isSignedIn,user } = useUser();
  const [activePath, setActivePath] = useState('/'); 

  const handleLinkClick = (path) => {
    setActivePath(path);
  };

  return (
    <aside className="w-64 bg-gray-200 text-gray-950 p-6 fixed h-full flex flex-col justify-between">
      <div>
        <div className="mb-8">
           <Link href="/" legacyBehavior>
                <a
                  onClick={() => handleLinkClick('/')}
                  className={`'hover:bg-gray-300 hover:border-gray-600'`}
                >
                <h1 className="text-2xl font-bold">Interview Automation</h1>
                </a>
              </Link>
        </div>
        <nav>
          <ul className="space-y-4">
            <li>
              <Link href="/admin" legacyBehavior>
                <a
                  onClick={() => handleLinkClick('/admin')}
                  className={`block py-2 px-3 border-l-4 ${activePath === '/admin' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                >
                  Dashboard
                </a>
              </Link>
            </li>
            <li>
              <Link href="/get-campaign" legacyBehavior>
                <a
                  onClick={() => handleLinkClick('/get-campaign')}
                  className={`block py-2 px-3 border-l-4 ${activePath === '/get-campaign' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                >
                  Jobs
                </a>
              </Link>
            </li>
            <li>
              <Link href="/update-campaign" legacyBehavior>
                <a
                  onClick={() => handleLinkClick('/update-campaign')}
                  className={`block py-2 px-3 border-l-4 ${activePath === '/update-campaign' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                >
                  Update Resume
                </a>
              </Link>
            </li>
            <li>
              <Link href="/make-call" legacyBehavior>
                <a
                  onClick={() => handleLinkClick('/make-call')}
                  className={`block py-2 px-3 border-l-4 ${activePath === '/make-call' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                >
                  Previous Applications
                </a>
              </Link>
            </li>
            <li>
              <Link href="/call-status" legacyBehavior>
                <a
                  onClick={() => handleLinkClick('/call-status')}
                  className={`block py-2 px-3 border-l-4 ${activePath === '/call-status' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                >
                  updare
                </a>
              </Link>
            </li>
            <li>
              <Link href="/get-transcription" legacyBehavior>
                <a
                  onClick={() => handleLinkClick('/get-transcription')}
                  className={`block py-2 px-3 border-l-4 ${activePath === '/get-transcription' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                >
                  Get Transcription
                </a>
              </Link>
            </li>
            <li>
              <Link href="/get-post-call-analysis" legacyBehavior>
                <a
                  onClick={() => handleLinkClick('/get-post-call-analysis')}
                  className={`block py-2 px-3 border-l-4 ${activePath === '/get-post-call-analysis' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                >
                  Post Call Analysis
                </a>
              </Link>
            </li>
            <li>
              <Link href="/analytics" legacyBehavior>
                <a
                  onClick={() => handleLinkClick('/analytics')}
                  className={`block py-2 px-3 border-l-4 ${activePath === '/analytics' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                >
                  Analysis
                </a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="mt-auto">
        {isSignedIn ? (
           <div className="flex items-center space-x-4">
           <UserButton appearance={{ elements: { avatarBox: "h-[44px] w-[44px]" } }} />
           <span className="text-lg font-medium text-gray-900">{user?.firstName+" "+user?.lastName}</span>
         </div>
        ) : (
          <div className="space-y-4">
            <SignInButton mode='modal'>
              <Button className="w-full">Login</Button>
            </SignInButton>
            <SignUpButton mode='modal'>
              <Button className="w-full">Signup</Button>
            </SignUpButton>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
