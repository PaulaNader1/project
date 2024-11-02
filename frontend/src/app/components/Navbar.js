'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if the user is authenticated
        const token = localStorage.getItem('authToken');
        setIsAuthenticated(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        setIsAuthenticated(false);
        router.push('/login');
    };

    return (
        <nav style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 20px', backgroundColor: '#0070f3', color: '#fff'
        }}>
            <h1 style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>MyApp</h1>
            <div style={{ display: 'flex', gap: '20px' }}>
                <button onClick={() => router.push('/')} style={{
                    background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem'
                }}>
                    Home
                </button>
                <button onClick={() => router.push('/profile')} style={{
                    background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem'
                }}>
                    Profile
                </button>
                {isAuthenticated ? (
                    <button onClick={handleLogout} style={{
                        background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem'
                    }}>
                        Logout
                    </button>
                ) : (
                    <button onClick={() => router.push('/login')} style={{
                        background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem'
                    }}>
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
}
