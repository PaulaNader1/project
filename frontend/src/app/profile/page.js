'use client';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Navbar from '../components/Navbar';

let socket;

export default function Profile() {
    const [userInfo, setUserInfo] = useState({});
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userId = localStorage.getItem('userId');
                const response = await axios.get(`http://localhost:3000/api/users/profile/${userId}`);
                setUserInfo(response.data.userInfo);
                setOrders(response.data.userOrders);
            } catch (err) {
                setError('Failed to load profile data');
                console.error(err);
            }
        };

        fetchProfile();

        socket = io('http://localhost:3000');
        socket.on('orderStatusUpdated', ({ orderId, status }) => {
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.order_id === orderId ? { ...order, order_status: status } : order
                )
            );
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    if (!userInfo || orders.length === 0) return <div>Loading...</div>;

    return (
        <>
            <Navbar />
            <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                <h1 style={{ fontSize: '2rem', color: '#000', marginBottom: '20px' }}>User Profile</h1>
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <div style={{
                    marginBottom: '20px',
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                }}>
                    <p style={{ color: '#000' }}><strong>Email:</strong> {userInfo.email}</p>
                    <p style={{ color: '#000' }}><strong>User ID:</strong> {userInfo.id}</p>
                </div>

                <h2 style={{ fontSize: '1.5rem', color: '#000', marginBottom: '20px' }}>Order History</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {orders.map((order, index) => (
                        <div key={index} style={{
                            border: '1px solid #ddd',
                            padding: '20px',
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}>
                            <p style={{ color: '#000' }}><strong>Order ID:</strong> {order.order_id}</p>
                            <p style={{ color: '#000' }}><strong>Status:</strong> {order.order_status}</p>
                            <p style={{ color: '#000' }}><strong>Products:</strong></p>
                            <ul style={{ paddingLeft: '20px', color: '#000' }}>
                                {order.products.map((product, i) => (
                                    <li key={i} style={{ color: '#000' }}>
                                        {product.product_name} - Quantity: {product.quantity}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
