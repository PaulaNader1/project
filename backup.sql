--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chats (
    id integer NOT NULL,
    user_id integer,
    message text NOT NULL,
    is_markdown boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.chats OWNER TO postgres;

--
-- Name: chats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chats_id_seq OWNER TO postgres;

--
-- Name: chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chats_id_seq OWNED BY public.chats.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    quantity integer NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    status character varying(50) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: chats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats ALTER COLUMN id SET DEFAULT nextval('public.chats_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chats (id, user_id, message, is_markdown, created_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, quantity) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, status, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, description, price, created_at) FROM stdin;
1	Smartphone	Experience sound like never before.	879.29	2024-03-13 11:49:45.786032
2	Laptop	Stay connected on the go.	974.91	2024-10-14 11:49:45.827415
3	Laptop	Experience sound like never before.	824.18	2024-07-07 11:49:45.828414
4	Smartwatch	A high-performance device suitable for various tasks.	353.04	2024-07-25 11:49:45.828414
5	Headphones	A high-performance device suitable for various tasks.	360.72	2024-02-28 11:49:45.829414
6	Smartwatch	A high-performance device suitable for various tasks.	404.10	2024-05-03 11:49:45.829414
7	Tablet	Experience sound like never before.	343.62	2024-04-14 11:49:45.830415
8	Smartwatch	Stay connected on the go.	622.90	2024-01-22 11:49:45.830415
9	Smartphone	A high-performance device suitable for various tasks.	169.35	2024-07-28 11:49:45.831416
10	Laptop	Capture moments in high resolution.	755.61	2024-01-30 11:49:45.831416
11	Smartwatch	Experience sound like never before.	932.99	2024-02-19 11:49:45.831416
12	Tablet	Perfect for work, play, and everything in between.	431.44	2024-08-02 11:49:45.831416
13	Laptop	Experience sound like never before.	253.94	2024-09-18 11:49:45.832924
14	Laptop	Experience sound like never before.	587.32	2024-09-29 11:49:45.832924
15	Tablet	A versatile smartphone with an amazing camera.	443.03	2023-12-22 11:49:45.833934
16	Camera	Perfect for work, play, and everything in between.	306.65	2024-09-22 11:49:45.833934
17	Tablet	Experience sound like never before.	986.27	2024-09-17 11:49:45.834946
18	Laptop	A versatile smartphone with an amazing camera.	111.63	2024-02-15 11:49:45.834946
19	Camera	Capture moments in high resolution.	543.63	2024-09-25 11:49:45.834946
20	Smartwatch	A versatile smartphone with an amazing camera.	604.61	2024-05-25 11:49:45.835933
21	Tablet	A high-performance device suitable for various tasks.	492.85	2024-04-13 11:49:45.835933
22	Smartwatch	Experience sound like never before.	393.86	2024-01-24 11:49:45.835933
23	Smartwatch	Capture moments in high resolution.	891.41	2024-08-02 11:49:45.837065
24	Smartwatch	A versatile smartphone with an amazing camera.	770.41	2024-01-04 11:49:45.837065
25	Laptop	Capture moments in high resolution.	532.24	2024-06-17 11:49:45.837065
26	Smartwatch	Perfect for work, play, and everything in between.	529.83	2024-09-21 11:49:45.838088
27	Tablet	Perfect for work, play, and everything in between.	248.16	2023-12-13 11:49:45.838088
28	Laptop	Experience sound like never before.	360.12	2024-06-18 11:49:45.838088
29	Tablet	Capture moments in high resolution.	642.30	2024-03-02 11:49:45.839093
30	Tablet	Capture moments in high resolution.	690.92	2024-05-01 11:49:45.839093
31	Tablet	Capture moments in high resolution.	960.93	2024-08-25 11:49:45.839093
32	Smartwatch	Capture moments in high resolution.	355.55	2023-12-16 11:49:45.840089
33	Smartwatch	Experience sound like never before.	950.47	2024-01-04 11:49:45.840089
34	Smartphone	Stay connected on the go.	265.65	2024-06-01 11:49:45.840089
35	Tablet	Stay connected on the go.	760.19	2024-07-10 11:49:45.841089
36	Smartphone	A high-performance device suitable for various tasks.	655.60	2024-01-10 11:49:45.841089
37	Smartwatch	Capture moments in high resolution.	783.98	2024-09-07 11:49:45.842089
38	Tablet	A versatile smartphone with an amazing camera.	949.54	2024-08-23 11:49:45.842089
39	Smartwatch	Perfect for work, play, and everything in between.	650.20	2023-12-07 11:49:45.842089
40	Smartwatch	Perfect for work, play, and everything in between.	717.95	2024-03-08 11:49:45.842089
41	Laptop	Experience sound like never before.	771.88	2024-01-05 11:49:45.843089
42	Laptop	Capture moments in high resolution.	645.43	2024-03-21 11:49:45.843089
43	Camera	Capture moments in high resolution.	719.25	2024-01-14 11:49:45.843089
44	Tablet	Capture moments in high resolution.	618.92	2023-12-02 11:49:45.844087
45	Tablet	A versatile smartphone with an amazing camera.	728.68	2024-01-07 11:49:45.844087
46	Laptop	Capture moments in high resolution.	191.46	2024-04-14 11:49:45.844087
47	Smartphone	Perfect for work, play, and everything in between.	445.07	2023-11-30 11:49:45.844087
48	Smartwatch	Experience sound like never before.	227.95	2024-10-14 11:49:45.844087
49	Camera	Capture moments in high resolution.	96.32	2024-10-26 11:49:45.845177
50	Laptop	A versatile smartphone with an amazing camera.	607.80	2023-11-13 11:49:45.845177
51	Smartphone	A high-performance device suitable for various tasks.	567.33	2024-03-28 11:49:45.845699
52	Headphones	Perfect for work, play, and everything in between.	324.01	2024-09-09 11:49:45.845699
53	Tablet	A high-performance device suitable for various tasks.	426.07	2023-12-25 11:49:45.845699
54	Smartphone	Capture moments in high resolution.	459.97	2024-02-02 11:49:45.845699
55	Camera	A high-performance device suitable for various tasks.	278.56	2024-08-17 11:49:45.845699
56	Smartwatch	A versatile smartphone with an amazing camera.	338.05	2024-01-07 11:49:45.847105
57	Laptop	Perfect for work, play, and everything in between.	424.21	2024-10-27 11:49:45.847105
58	Smartphone	A high-performance device suitable for various tasks.	341.72	2023-12-08 11:49:45.847105
59	Tablet	Perfect for work, play, and everything in between.	716.71	2024-04-05 11:49:45.847105
60	Laptop	Perfect for work, play, and everything in between.	476.52	2024-02-18 11:49:45.847105
61	Laptop	A high-performance device suitable for various tasks.	466.30	2024-05-03 11:49:45.848404
62	Camera	Stay connected on the go.	919.28	2024-05-09 11:49:45.848404
63	Headphones	Experience sound like never before.	860.07	2024-10-10 11:49:45.848404
64	Tablet	Perfect for work, play, and everything in between.	289.53	2024-05-12 11:49:45.848404
65	Camera	Capture moments in high resolution.	968.87	2024-03-17 11:49:45.849411
66	Smartwatch	Capture moments in high resolution.	515.24	2024-07-28 11:49:45.849411
67	Laptop	A high-performance device suitable for various tasks.	633.25	2024-06-21 11:49:45.849411
68	Camera	A versatile smartphone with an amazing camera.	459.69	2024-05-29 11:49:45.849411
69	Smartwatch	Stay connected on the go.	462.57	2024-04-15 11:49:45.850425
70	Headphones	A high-performance device suitable for various tasks.	112.39	2024-01-03 11:49:45.850425
71	Headphones	Capture moments in high resolution.	642.68	2023-11-22 11:49:45.850425
72	Headphones	A versatile smartphone with an amazing camera.	756.95	2024-09-15 11:49:45.850425
73	Tablet	Capture moments in high resolution.	861.11	2024-07-06 11:49:45.850425
74	Headphones	A high-performance device suitable for various tasks.	295.65	2024-09-17 11:49:45.850425
75	Laptop	Perfect for work, play, and everything in between.	748.50	2024-02-24 11:49:45.851843
76	Laptop	Stay connected on the go.	640.53	2024-04-05 11:49:45.851843
77	Camera	A high-performance device suitable for various tasks.	288.87	2024-08-27 11:49:45.851843
78	Laptop	A high-performance device suitable for various tasks.	319.62	2024-08-24 11:49:45.851843
79	Camera	A versatile smartphone with an amazing camera.	245.80	2024-01-14 11:49:45.851843
80	Laptop	Perfect for work, play, and everything in between.	987.57	2024-10-29 11:49:45.852863
81	Smartwatch	A high-performance device suitable for various tasks.	353.05	2024-02-08 11:49:45.852863
82	Tablet	A versatile smartphone with an amazing camera.	274.81	2024-03-20 11:49:45.853864
83	Laptop	Experience sound like never before.	963.38	2024-06-20 11:49:45.853864
84	Laptop	A high-performance device suitable for various tasks.	87.51	2024-01-15 11:49:45.854862
85	Headphones	A high-performance device suitable for various tasks.	555.40	2024-10-23 11:49:45.854862
86	Camera	A high-performance device suitable for various tasks.	954.15	2024-05-02 11:49:45.854862
87	Smartphone	Capture moments in high resolution.	901.68	2024-06-20 11:49:45.854862
88	Headphones	Stay connected on the go.	533.26	2024-08-16 11:49:45.855862
89	Camera	Stay connected on the go.	765.54	2024-10-29 11:49:45.855862
90	Smartwatch	A high-performance device suitable for various tasks.	597.81	2023-11-15 11:49:45.855862
91	Laptop	Experience sound like never before.	512.45	2024-05-17 11:49:45.855862
92	Tablet	A versatile smartphone with an amazing camera.	606.62	2024-01-26 11:49:45.855862
93	Headphones	Perfect for work, play, and everything in between.	801.23	2024-07-11 11:49:45.856859
94	Tablet	Capture moments in high resolution.	312.83	2024-10-17 11:49:45.856859
95	Camera	Experience sound like never before.	629.36	2024-04-01 11:49:45.856859
96	Tablet	Perfect for work, play, and everything in between.	826.71	2024-06-07 11:49:45.856859
97	Smartwatch	Experience sound like never before.	151.08	2024-06-23 11:49:45.856859
98	Camera	A versatile smartphone with an amazing camera.	80.31	2024-03-20 11:49:45.856859
99	Smartwatch	Stay connected on the go.	437.87	2024-05-27 11:49:45.856859
100	Headphones	Perfect for work, play, and everything in between.	487.99	2024-01-14 11:49:45.858206
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password) FROM stdin;
1	paula.nader@hotmail.com	$2a$10$X6BcT/D0vu/hVUJujM.FTeyAXlP1huwbOVNIbtJjMZIyUb49bKzym
\.


--
-- Name: chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chats_id_seq', 1, false);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: chats chats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

