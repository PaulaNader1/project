// const pool = require('./db'); // Import the database connection pool

// // Function to create a new order
// const createOrder = async (userId, products) => {
//     const client = await pool.connect();
//     try {
//         await client.query('BEGIN');

//         // Insert a new order
//         const orderResult = await client.query(
//             'INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING id, status, created_at',
//             [userId, 'Pending']
//         );
//         const orderId = orderResult.rows[0].id;

//         // Insert products for the order
//         for (const product of products) {
//             await client.query(
//                 'INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3)',
//                 [orderId, product.product_id, product.quantity]
//             );
//         }   

//         await client.query('COMMIT');
//         return { orderId, status: 'Pending', created_at: orderResult.rows[0].created_at };
//     } catch (err) {
//         await client.query('ROLLBACK');
//         throw err;
//     } finally {
//         client.release();
//     }
// };

// // Function to get order details by order ID
// const getOrderById = async (orderId) => {
//     const result = await pool.query(
//         `SELECT o.id AS order_id, o.status, o.created_at, u.email AS user_email, p.name AS product_name, op.quantity
//          FROM orders o
//          JOIN users u ON o.user_id = u.id
//          JOIN order_products op ON o.id = op.order_id
//          JOIN products p ON op.product_id = p.id
//          WHERE o.id = $1`,
//         [orderId]
//     );
//     return result.rows;
// };

// // Function to update order status
// const updateOrderStatus = async (orderId, status) => {
//     await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
// };

// const getOrdersByUserId = async (userId) => {
//     const result = await pool.query(
//         `SELECT o.id AS order_id, o.status AS order_status, o.created_at, p.name AS product_name, op.quantity
//          FROM orders o
//          JOIN order_products op ON o.id = op.order_id
//          JOIN products p ON op.product_id = p.id
//          WHERE o.user_id = $1
//          ORDER BY o.created_at DESC`,
//         [userId]
//     );

//     // Group products by order
//     const orders = {};
//     result.rows.forEach(row => {
//         if (!orders[row.order_id]) {
//             orders[row.order_id] = {
//                 order_id: row.order_id,
//                 order_status: row.order_status,
//                 created_at: row.created_at,
//                 products: []
//             };
//         }
//         orders[row.order_id].products.push({
//             product_name: row.product_name,
//             quantity: row.quantity
//         });
//     });

//     return Object.values(orders); // Convert the grouped orders object to an array
// };

// const getAllOrders = async () => {
//     const result = await pool.query(
//         `SELECT o.id AS order_id, o.status AS order_status, o.created_at, p.name AS product_name, op.quantity
//          FROM orders o
//          JOIN order_products op ON o.id = op.order_id
//          JOIN products p ON op.product_id = p.id
//          ORDER BY o.created_at DESC`,
//         [userId]
//     );
//     return result.rows;
// };

// const getAllOrdersWithUserData = async () => {
//     const result = await pool.query(`
//         SELECT o.id AS order_id, o.status, o.created_at, u.id AS user_id, u.email AS user_email, 
//                p.name AS product_name, op.quantity
//         FROM orders o
//         JOIN users u ON o.user_id = u.id
//         JOIN order_products op ON o.id = op.order_id
//         JOIN products p ON op.product_id = p.id
//     `);
//     return result.rows;
// };

// module.exports = { getAllOrdersWithUserData, createOrder, getOrderById, updateOrderStatus, getOrdersByUserId, getAllOrders};



const pool = require('./db');

// Function to create a new order
const createOrder = async (userId, products) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const orderResult = await client.query(
            'INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING id, status, created_at',
            [userId, 'Pending']
        );
        const orderId = orderResult.rows[0].id;

        for (const product of products) {
            await client.query(
                'INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3)',
                [orderId, product.product_id, product.quantity]
            );
        }

        await client.query('COMMIT');
        return { orderId, status: 'Pending', created_at: orderResult.rows[0].created_at };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// Function to get order details by order ID
const getOrderById = async (orderId) => {
    const result = await pool.query(
        `SELECT o.id AS order_id, o.status, o.created_at, u.email AS user_email, p.name AS product_name, op.quantity
         FROM orders o
         JOIN users u ON o.user_id = u.id
         JOIN order_products op ON o.id = op.order_id
         JOIN products p ON op.product_id = p.id
         WHERE o.id = $1`,
        [orderId]
    );
    return result.rows;
};

// Function to update order status
const updateOrderStatus = async (orderId, status) => {
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, orderId]);
};

// Function to get orders by user ID
const getOrdersByUserId = async (userId) => {
    const result = await pool.query(
        `SELECT o.id AS order_id, o.status, o.created_at, p.name AS product_name, op.quantity
         FROM orders o
         JOIN order_products op ON o.id = op.order_id
         JOIN products p ON op.product_id = p.id
         WHERE o.user_id = $1
         ORDER BY o.created_at DESC`,
        [userId]
    );

    const orders = {};
    result.rows.forEach(row => {
        if (!orders[row.order_id]) {
            orders[row.order_id] = {
                order_id: row.order_id,
                status: row.status,
                created_at: row.created_at,
                products: []
            };
        }
        orders[row.order_id].products.push({
            product_name: row.product_name,
            quantity: row.quantity
        });
    });

    return Object.values(orders);
};

// Function to get all orders with user data (for admin)
const getAllOrdersWithUserData = async () => {
    const result = await pool.query(`
        SELECT o.id AS order_id, o.status, o.created_at, u.id AS user_id, u.email AS user_email, 
               p.name AS product_name, op.quantity
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN order_products op ON o.id = op.order_id
        JOIN products p ON op.product_id = p.id
    `);

    const orders = {};
    result.rows.forEach(row => {
        if (!orders[row.order_id]) {
            orders[row.order_id] = {
                order_id: row.order_id,
                status: row.status,
                created_at: row.created_at,
                user_id: row.user_id,
                user_email: row.user_email,
                products: []
            };
        }
        orders[row.order_id].products.push({
            product_name: row.product_name,
            quantity: row.quantity
        });
    });

    return Object.values(orders);
};

module.exports = { createOrder, getOrderById, updateOrderStatus, getOrdersByUserId, getAllOrdersWithUserData };
