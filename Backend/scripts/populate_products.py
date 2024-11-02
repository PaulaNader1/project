import psycopg2
from psycopg2 import sql
from random import uniform, choice, randint  # Added randint import
from datetime import datetime, timedelta

# PostgreSQL database connection parameters
db_params = {
    'dbname': 'database',
    'user': 'postgres',
    'password': 'pass',
    'host': 'localhost', 
    'port': '5432',
}

# Connect to the PostgreSQL database
connection = psycopg2.connect(**db_params)
cursor = connection.cursor()

# Sample data for products
names = ['Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Camera', 'Smartwatch']
descriptions = [
    'A high-performance device suitable for various tasks.',
    'A versatile smartphone with an amazing camera.',
    'Perfect for work, play, and everything in between.',
    'Experience sound like never before.',
    'Capture moments in high resolution.',
    'Stay connected on the go.'
]

# Insert random products into the products table
for i in range(1, 101):  # Insert 100 products
    random_name = choice(names)
    random_description = choice(descriptions)
    random_price = round(uniform(50, 1000), 2)  # Generate a price between 50 and 1000 with 2 decimal places
    random_created_at = datetime.now() - timedelta(days=randint(0, 365))  # Random date within the past year

    # Insert product into the table
    cursor.execute(
        """
        INSERT INTO products (id, name, description, price, created_at)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (i, random_name, random_description, random_price, random_created_at)
    )

# Commit the transaction
connection.commit()

# Close the database connection
cursor.close()
connection.close()

print("Products table has been populated with sample data.")
