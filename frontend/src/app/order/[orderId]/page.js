'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import io from 'socket.io-client';
import axios from 'axios';
import Navbar from '../../components/Navbar';

let socket;

export default function OrderDetails() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`http://192.168.1.24:3000/api/orders/${orderId}`);
                const orderData = response.data;

                if (orderData.length > 0) {
                    setOrder(orderData[0]);
                    setStatus(orderData[0].order_status);
                    setUserEmail(orderData[0].user_email);
                    setProducts(orderData);
                }
            } catch (err) {
                setError('Failed to load order details');
                console.error(err);
            }
        };

        fetchOrder();

        socket = io('http://192.168.1.24:3000'); // Connect to backend Socket.io server
        socket.on('orderStatusUpdated', ({ orderId: updatedOrderId, status: newStatus }) => {
            if (updatedOrderId === orderId) {
                setStatus(newStatus);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [orderId]);

    if (!order) return <div>Loading...</div>;

    return (
        <>
            <Navbar />
            <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: '#000' }}>Order Details</h1>
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <div style={{ marginBottom: '20px' }}>
                    <p><strong>Order ID:</strong> {orderId}</p>
                    <p><strong>Status:</strong> {status}</p>
                    <p><strong>User Email:</strong> {userEmail}</p>
                </div>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#000' }}>Products</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {products.map((product, index) => (
                        <div key={index} style={{
                            display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#fff', borderRadius: '5px',
                            border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}>
                            <p><strong>Product:</strong> {product.product_name}</p>
                            <p><strong>Quantity:</strong> {product.quantity}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
