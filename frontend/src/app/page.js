'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from './components/Navbar';

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
    } else {
      fetchProducts();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://192.168.1.24:3000/api/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const handleOrder = async (productId) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.post('http://192.168.1.24:3000/api/orders/create', {
        userId,
        products: [{ product_id: productId, quantity: 1 }]
      });
      setMessage('Order created successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to create order');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '20px' }}>Products</h1>
        {message && (
          <div style={{
            backgroundColor: '#0070f3',
            color: '#fff',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '1rem'
          }}>
            {message}
          </div>
        )}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
          width: '100%',
        }}>
          {products.map((product) => (
            <div key={product.id} style={{
              border: '1px solid #ddd',
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: '#fff',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#333' }}>{product.name}</h2>
              <p style={{ color: '#333', flexGrow: 1 }}>{product.description}</p>
              <p style={{ fontWeight: 'bold', color: '#333' }}>Price: ${product.price}</p>
              <button onClick={() => handleOrder(product.id)} style={{
                padding: '10px 20px',
                backgroundColor: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px',
              }}>
                Order
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
