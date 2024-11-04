'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Navbar() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null); // Start with null to indicate loading state

    useEffect(() => {
        const fetchUserRole = async () => {
            // Check if the user is authenticated
            const token = localStorage.getItem('authToken');
            setIsAuthenticated(!!token);
            
            if (token) {
                const userId = localStorage.getItem('userId');
                try {
                    const role = await getRole(userId);
                    setUserRole(role);
                } catch (err) {
                    console.error("Error fetching user role:", err);
                }
            }
        };

        fetchUserRole();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        setIsAuthenticated(false);
        setUserRole(null); // Reset role on logout
        router.push('/login');
    };

    const getRole = async (id) => {
        const response = await axios.get(`http://localhost:3000/api/users/profile/${id}`);
        const role = response.data.userInfo.role;
        console.log("Fetched role:", role);
        return role;
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
                {userRole === 'admin' && (
                    <button onClick={() => router.push('/chat/admin')} style={{
                        background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem'
                    }}>
                        Admin Chat
                    </button>
                )}
                {userRole === 'user' && (
                    <button onClick={() => router.push('/chat/user')} style={{
                        background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem'
                    }}>
                        User Chat
                    </button>
                )}
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
