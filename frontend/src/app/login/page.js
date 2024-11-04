'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState({ email: '', password: '' });

    const validateForm = () => {
        let isValid = true;
        let emailError = '';
        let passwordError = '';

        if (!email) {
            emailError = 'Email is required';
            isValid = false;
        }

        if (!password) {
            passwordError = 'Password is required';
            isValid = false;
        }

        setError({ email: emailError, password: passwordError });
        return isValid;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await axios.post(`http://192.168.1.24:3000/api/users/login`, { email, password });
            const { token } = response.data;
            const role = response.data.role
            const userId = response.data.id
            console.log(userId);
            console.log(role);
            localStorage.setItem('authToken', token);
            localStorage.setItem('role', role);
            localStorage.setItem('userId', userId); // Store userId for profile page
            setMessage('Login successful! Redirecting...');
            setTimeout(() => {
                router.push('/'); // Redirect to home page
            }, 1500);
        } catch (error) {
            setMessage(error.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <form onSubmit={onSubmit} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                maxWidth: '400px', width: '100%'
            }}>
                <h1 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '20px' }}>Login to Your Account</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        width: '100%', padding: '10px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '5px',
                        backgroundColor: '#fff', color: '#000'
                    }}
                />
                {error.email && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error.email}</p>}

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        width: '100%', padding: '10px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '5px',
                        backgroundColor: '#fff', color: '#000'
                    }}
                />
                {error.password && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error.password}</p>}

                <button type="submit" style={{
                    backgroundColor: '#0070f3', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px',
                    cursor: 'pointer', transition: 'background-color 0.3s', fontSize: '1rem', marginTop: '10px'
                }}>
                    Login
                </button>
                {message && <p style={{ color: 'green', fontSize: '0.9rem', marginTop: '10px' }}>{message}</p>}

                <p style={{ marginTop: '15px', color: '#000000' }}>
                    Don't have an account?{' '}
                    <span
                        onClick={() => router.push('/register')}
                        style={{ color: '#0070f3', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Signup
                    </span>.
                </p>
            </form>
        </div>
    );
}
