'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, CreditCard, Settings } from 'lucide-react';
import { LogoutButton } from './logout-button';

const navItems = [
	{ label: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
	{ label: 'Perfil', href: '/ingresos', icon: <User size={20} /> },
	{ label: 'Facturación', href: '/egresos', icon: <CreditCard size={20} /> },
	{ label: 'Configuraciones', href: '/materias-primas', icon: <Settings size={20} /> }
];

export default function Sidebar(): React.ReactElement {
	const path = usePathname();

	return (
		<>
			{/* Sidebar lateral para desktop */}
			<aside className="hidden md:flex w-56 h-full bg-white border-r border-gray-200 flex-col justify-between px-4 py-6">
				<div>
					<div className="mb-10 flex items-center space-x-2">
						<div className="h-6 w-6 bg-black rounded-sm" />
						<span className="text-lg font-semibold text-gray-800">Dumar</span>
					</div>
					<nav>
						<ul className="space-y-2">
							{navItems.map(item => {
								const isActive = path === item.href;
								return (
									<li key={item.href}>
										<Link
											href={item.href}
											className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group
                        ${isActive
													? 'bg-black text-white'
													: 'text-gray-700 hover:bg-gray-100'}
                      `}
										>
											{item.icon}
											<span className="text-sm font-medium">{item.label}</span>
										</Link>
									</li>
								);
							})}
						</ul>
					</nav>
				</div>
				<div className="mt-10">
					{/** @ts-ignore */}
					<LogoutButton className="w-full text-sm px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition" />
				</div>
			</aside>

			{/* Bottom nav para mobile */}
			<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex  justify-around bg-white border-t border-gray-200 py-3 pb-[env(safe-area-inset-bottom)] shadow-lg">
				{navItems.map(item => {
					const isActive = path === item.href;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex flex-col items-center justify-center px-2 py-1 text-xs transition
                ${isActive ? 'text-black font-medium' : 'text-gray-500 hover:text-gray-900'}
              `}
						>
							{item.icon}
							<span className="text-xs mt-1.5">{item.label}</span>
						</Link>
					);
				})}
			</nav>
		</>
	);
}