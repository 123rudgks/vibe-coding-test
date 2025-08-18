'use client'

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'

interface SidebarProps {
    currentPage?: 'dashboard' | 'playground' | 'assistant' | 'reports' | 'invoices' | 'docs';
}

export function Sidebar({ currentPage = 'dashboard' }: SidebarProps) {
    const { data: session } = useSession()
    const navItems = [
        {
            id: 'dashboard',
            name: 'Overview',
            href: '/dashboard',
            icon: '📊',
        },
        {
            id: 'assistant',
            name: 'Research Assistant',
            href: '#',
            icon: '🤖',
        },
        {
            id: 'reports',
            name: 'Research Reports',
            href: '#',
            icon: '📄',
        },
        {
            id: 'playground',
            name: 'API Playground',
            href: '/playground',
            icon: '⚡',
        },
        {
            id: 'invoices',
            name: 'Invoices',
            href: '#',
            icon: '💳',
        },
        {
            id: 'docs',
            name: 'Documentation',
            href: '#',
            icon: '📚',
            external: true,
        },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6">
                <h1 className="text-xl font-bold text-gray-900">Tavily AI</h1>
            </div>

            <nav className="flex-1 px-4">
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = currentPage === item.id;
                        const baseClasses = "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors";
                        const activeClasses = "text-blue-600 bg-blue-50";
                        const inactiveClasses = "text-gray-600 hover:text-gray-900 hover:bg-gray-50";

                        if (item.external) {
                            return (
                                <a
                                    key={item.id}
                                    href={item.href}
                                    className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.name}
                                    <span className="ml-auto text-xs">↗</span>
                                </a>
                            );
                        }

                        if (item.href === '#') {
                            return (
                                <a
                                    key={item.id}
                                    href={item.href}
                                    className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.name}
                                </a>
                            );
                        }

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                            >
                                <span className="mr-3">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center">
                    {session?.user?.image ? (
                        <Image
                            src={session.user.image}
                            alt="Profile"
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}
                    <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {session?.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {session?.user?.email}
                        </p>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="ml-auto text-gray-400 hover:text-red-600 transition-colors"
                        title="Sign out"
                    >
                        🚪
                    </button>
                </div>
            </div>
        </div>
    );
} 