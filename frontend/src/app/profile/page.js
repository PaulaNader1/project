// 'use client';
// import { useEffect, useState } from 'react';
// import io from 'socket.io-client';
// import axios from 'axios';
// import Navbar from '../components/Navbar';

// let socket;

// export default function Profile() {
//     const [userInfo, setUserInfo] = useState({});
//     const [orders, setOrders] = useState([]);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         const fetchProfile = async () => {
//             try {
//                 const userId = localStorage.getItem('userId');
//                 const response = await axios.get(`http://192.168.1.24:3000/api/users/profile/${userId}`);
//                 setUserInfo(response.data.userInfo);
//                 setOrders(response.data.userOrders);
//             } catch (err) {
//                 setError('Failed to load profile data');
//                 console.error(err);
//             }
//         };

//         fetchProfile();

//         // Initialize WebSocket connection
//         socket = io('http://192.168.1.24:3000');

//         // Listen for real-time updates on the order status
//         socket.on('orderStatusUpdated', ({ orderId, status }) => {
//             setOrders((prevOrders) =>
//                 prevOrders.map((order) =>
//                     order.order_id === orderId ? { ...order, order_status: status } : order
//                 )
//             );
//         });

//         // Clean up WebSocket connection on component unmount
//         return () => {
//             socket.disconnect();
//         };
//     }, []);

//     const updateOrderStatus = async (orderId, status) => {
//         try {
//             await axios.put(`http://192.168.1.24:3000/api/orders/${orderId}/status`, { status });
//             // Emit status update via WebSocket
//             socket.emit('updateOrderStatus', { orderId, status });
//         } catch (err) {
//             console.error('Failed to update order status', err);
//             setError('Failed to update order status');
//         }
//     };

//     if (!userInfo || orders.length === 0) return <div>Loading...</div>;

//     return (
//         <>
//             <Navbar />
//             <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
//                 <h1 style={{ fontSize: '2rem', color: '#000', marginBottom: '20px' }}>User Profile</h1>
//                 {error && <p style={{ color: 'red' }}>{error}</p>}

//                 <div style={{
//                     marginBottom: '20px',
//                     backgroundColor: '#fff',
//                     padding: '20px',
//                     borderRadius: '8px',
//                     boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
//                 }}>
//                     <p style={{ color: '#000' }}><strong>Email:</strong> {userInfo.email}</p>
//                     <p style={{ color: '#000' }}><strong>User ID:</strong> {userInfo.id}</p>
//                 </div>

//                 <h2 style={{ fontSize: '1.5rem', color: '#000', marginBottom: '20px' }}>Order History</h2>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//                     {orders.map((order, index) => (
//                         <div key={index} style={{
//                             border: '1px solid #ddd',
//                             padding: '20px',
//                             borderRadius: '8px',
//                             backgroundColor: '#fff',
//                             boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//                             display: 'flex',
//                             flexDirection: 'column',
//                         }}>
//                             <p style={{ color: '#000' }}><strong>Order ID:</strong> {order.order_id}</p>
//                             <p style={{ color: '#000' }}><strong>Status:</strong> {order.order_status}</p>
//                             <p style={{ color: '#000' }}><strong>Products:</strong></p>
//                             <ul style={{ paddingLeft: '20px', color: '#000' }}>
//                                 {order.products.map((product, i) => (
//                                     <li key={i} style={{ color: '#000' }}>
//                                         {product.product_name} - Quantity: {product.quantity}
//                                     </li>
//                                 ))}
//                             </ul>
//                             <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
//                                 <button
//                                     onClick={() => updateOrderStatus(order.order_id, 'Shipped')}
//                                     style={{
//                                         padding: '10px 20px',
//                                         backgroundColor: '#0070f3',
//                                         color: '#fff',
//                                         border: 'none',
//                                         borderRadius: '5px',
//                                         cursor: 'pointer',
//                                     }}
//                                     disabled={order.order_status !== 'Pending'}
//                                 >
//                                     Mark as Shipped
//                                 </button>
//                                 <button
//                                     onClick={() => updateOrderStatus(order.order_id, 'Delivered')}
//                                     style={{
//                                         padding: '10px 20px',
//                                         backgroundColor: '#28a745',
//                                         color: '#fff',
//                                         border: 'none',
//                                         borderRadius: '5px',
//                                         cursor: 'pointer',
//                                     }}
//                                     disabled={order.order_status !== 'Shipped'}
//                                 >
//                                     Mark as Delivered
//                                 </button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </>
//     );
// }


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

                console.log("User ID:", userId);

                const response = await axios.get(`http://localhost:3000/api/users/profile/${userId}`);
                const role = response.data.userInfo.role;
                setUserInfo(response.data.userInfo);
                console.log("Role:", role);

                if (role === 'admin') {
                    // Admins fetch all orders with user data
                    const allOrdersResponse = await axios.get(`http://localhost:3000/api/orders`);
                    console.log("Fetched All Orders with User Data (Admin):", allOrdersResponse.data);
                    setOrders(allOrdersResponse.data);
                } else {
                    // Normal users fetch their own profile and orders
                    console.log("Fetched User Profile Data (User):", response.data);
                    setOrders(response.data.userOrders);
                }
            } catch (err) {
                setError('Failed to load profile data');
                console.error("Error fetching profile data:", err);
            }
        };

        fetchProfile();

        socket = io('http://localhost:3000');
        socket.on('orderStatusUpdated', ({ orderId, status }) => {
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.order_id === orderId ? { ...order, status } : order
                )
            );
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const updateOrderStatus = async (orderId, status) => {
        try {
            await axios.put(`http://localhost:3000/api/orders/${orderId}/status`, { status });
            socket.emit('updateOrderStatus', { orderId, status });
        } catch (err) {
            console.error('Failed to update order status', err);
            setError('Failed to update order status');
        }
    };

    if (orders.length === 0) return <div>Loading...</div>;

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
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <p style={{ color: '#000' }}><strong>Order ID:</strong> {order.order_id}</p>
                            <p style={{ color: '#000' }}><strong>Status:</strong> {order.status}</p>

                            {userInfo.role === 'admin' && (
                                <>
                                    <p style={{ color: '#000' }}><strong>User Email:</strong> {order.user_email}</p>
                                    <p style={{ color: '#000' }}><strong>User ID:</strong> {order.user_id}</p>
                                </>
                            )}

                            <p style={{ color: '#000' }}><strong>Products:</strong></p>
                            <ul style={{ paddingLeft: '20px', color: '#000' }}>
                                {order.products && order.products.map((product, i) => (
                                    <li key={i} style={{ color: '#000' }}>
                                        {product.product_name} - Quantity: {product.quantity}
                                    </li>
                                ))}
                            </ul>

                            {userInfo.role === 'admin' && (
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button
                                        onClick={() => updateOrderStatus(order.order_id, 'Shipped')}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#0070f3',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                        }}
                                        disabled={order.status !== 'Pending'}
                                    >
                                        Mark as Shipped
                                    </button>
                                    <button
                                        onClick={() => updateOrderStatus(order.order_id, 'Delivered')}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#28a745',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                        }}
                                        disabled={order.status !== 'Shipped'}
                                    >
                                        Mark as Delivered
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
