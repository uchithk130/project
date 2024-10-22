'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton, useUser, UserButton } from '@clerk/nextjs';
import { Button } from './ui/button';

function Sidebar() {
  const { isSignedIn, user } = useUser();
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
              className={`hover:bg-gray-300 hover:border-gray-600`}
            >
              <h1 className="text-2xl font-bold">Interview Automation</h1>
            </a>
          </Link>
        </div>
        
        {/* Conditionally render the navigation items */}
        {isSignedIn && (
          <nav>
            <ul className="space-y-4">
              <li>
                <Link href="/admin" legacyBehavior>
                  <a
                    onClick={() => handleLinkClick('/admin')}
                    className={`block py-2 px-3 border-l-4 ${activePath === '/admin' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                  >
                    Admin Registration
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/candidate" legacyBehavior>
                  <a
                    onClick={() => handleLinkClick('/candidate')}
                    className={`block py-2 px-3 border-l-4 ${activePath === '/candidate' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                  >
                    Candidate Registration
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/jobadd" legacyBehavior>
                  <a
                    onClick={() => handleLinkClick('/jobadd')}
                    className={`block py-2 px-3 border-l-4 ${activePath === '/jobadd' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                  >
                    Add New Job
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/jobs" legacyBehavior>
                  <a
                    onClick={() => handleLinkClick('/jobs')}
                    className={`block py-2 px-3 border-l-4 ${activePath === '/jobs' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                  >
                    Jobs
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/myapplications" legacyBehavior>
                  <a
                    onClick={() => handleLinkClick('/myapplications')}
                    className={`block py-2 px-3 border-l-4 ${activePath === '/myapplications' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                  >
                    My Applications
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/resume" legacyBehavior>
                  <a
                    onClick={() => handleLinkClick('/resume')}
                    className={`block py-2 px-3 border-l-4 ${activePath === '/resume' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                  >
                    Resume
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/scheduling" legacyBehavior>
                  <a
                    onClick={() => handleLinkClick('/scheduling')}
                    className={`block py-2 px-3 border-l-4 ${activePath === '/scheduling' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                  >
                    Scheduling
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/interview" legacyBehavior>
                  <a
                    onClick={() => handleLinkClick('/interview')}
                    className={`block py-2 px-3 border-l-4 ${activePath === '/interview' ? 'bg-gray-300 border-gray-600' : 'hover:bg-gray-300 hover:border-gray-600'}`}
                  >
                    Interview
                  </a>
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
      
      <div className="mt-auto">
        {isSignedIn ? (
          <div className="flex items-center space-x-4">
            <UserButton appearance={{ elements: { avatarBox: "h-[44px] w-[44px]" } }} />
            <span className="text-lg font-medium text-gray-900">{user?.firstName + " " + user?.lastName}</span>
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
