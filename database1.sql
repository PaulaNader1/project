PGDMP  $                 
    |            database    17.0    17.0 (                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            !           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            "           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            #           1262    16388    database    DATABASE     �   CREATE DATABASE database WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United Kingdom.1252';
    DROP DATABASE database;
                     postgres    false            �            1259    16411    chats    TABLE     �   CREATE TABLE public.chats (
    id integer NOT NULL,
    user_id integer,
    message text NOT NULL,
    is_markdown boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.chats;
       public         heap r       postgres    false            �            1259    16410    chats_id_seq    SEQUENCE     �   CREATE SEQUENCE public.chats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.chats_id_seq;
       public               postgres    false    222            $           0    0    chats_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.chats_id_seq OWNED BY public.chats.id;
          public               postgres    false    221            �            1259    16464    order_products    TABLE     �   CREATE TABLE public.order_products (
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1
);
 "   DROP TABLE public.order_products;
       public         heap r       postgres    false            �            1259    16434    orders    TABLE     �   CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    status character varying(50) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.orders;
       public         heap r       postgres    false            �            1259    16433    orders_id_seq    SEQUENCE     �   CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.orders_id_seq;
       public               postgres    false    224            %           0    0    orders_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;
          public               postgres    false    223            �            1259    16401    products    TABLE     �   CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.products;
       public         heap r       postgres    false            �            1259    16400    products_id_seq    SEQUENCE     �   CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.products_id_seq;
       public               postgres    false    220            &           0    0    products_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;
          public               postgres    false    219            �            1259    16390    users    TABLE     �   CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL
);
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    16389    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    218            '           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    217            m           2604    16414    chats id    DEFAULT     d   ALTER TABLE ONLY public.chats ALTER COLUMN id SET DEFAULT nextval('public.chats_id_seq'::regclass);
 7   ALTER TABLE public.chats ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    222    221    222            p           2604    16437 	   orders id    DEFAULT     f   ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);
 8   ALTER TABLE public.orders ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    223    224    224            k           2604    16404    products id    DEFAULT     j   ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);
 :   ALTER TABLE public.products ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    219    220    220            j           2604    16393    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    217    218    218                      0    16411    chats 
   TABLE DATA           N   COPY public.chats (id, user_id, message, is_markdown, created_at) FROM stdin;
    public               postgres    false    222   �,                 0    16464    order_products 
   TABLE DATA           H   COPY public.order_products (order_id, product_id, quantity) FROM stdin;
    public               postgres    false    225   �,                 0    16434    orders 
   TABLE DATA           A   COPY public.orders (id, user_id, status, created_at) FROM stdin;
    public               postgres    false    224   -                 0    16401    products 
   TABLE DATA           L   COPY public.products (id, name, description, price, created_at) FROM stdin;
    public               postgres    false    220   u-                 0    16390    users 
   TABLE DATA           4   COPY public.users (id, email, password) FROM stdin;
    public               postgres    false    218   �3       (           0    0    chats_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.chats_id_seq', 1, false);
          public               postgres    false    221            )           0    0    orders_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.orders_id_seq', 3, true);
          public               postgres    false    223            *           0    0    products_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.products_id_seq', 1, false);
          public               postgres    false    219            +           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 1, true);
          public               postgres    false    217            {           2606    16420    chats chats_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.chats DROP CONSTRAINT chats_pkey;
       public                 postgres    false    222                       2606    16469 "   order_products order_products_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public.order_products
    ADD CONSTRAINT order_products_pkey PRIMARY KEY (order_id, product_id);
 L   ALTER TABLE ONLY public.order_products DROP CONSTRAINT order_products_pkey;
       public                 postgres    false    225    225            }           2606    16441    orders orders_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_pkey;
       public                 postgres    false    224            y           2606    16409    products products_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.products DROP CONSTRAINT products_pkey;
       public                 postgres    false    220            u           2606    16399    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    218            w           2606    16397    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    218            �           2606    16421    chats chats_user_id_fkey    FK CONSTRAINT     w   ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 B   ALTER TABLE ONLY public.chats DROP CONSTRAINT chats_user_id_fkey;
       public               postgres    false    4727    218    222            �           2606    16470 +   order_products order_products_order_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.order_products
    ADD CONSTRAINT order_products_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.order_products DROP CONSTRAINT order_products_order_id_fkey;
       public               postgres    false    224    4733    225            �           2606    16475 -   order_products order_products_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.order_products
    ADD CONSTRAINT order_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
 W   ALTER TABLE ONLY public.order_products DROP CONSTRAINT order_products_product_id_fkey;
       public               postgres    false    225    220    4729            �           2606    16442    orders orders_user_id_fkey    FK CONSTRAINT     y   ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 D   ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_user_id_fkey;
       public               postgres    false    4727    224    218                  x������ � �            x�3�4�4�b if��qqq !��         ^   x�eʱ� К�� �� �v [K��b,�_j}�s
j)-׶+�,ЖHBH�E&/��֣^W���I`b���5��>����8D�G���A         \  x������6���S��g���z�@z�E�Uw���ۛm���lI�L��� rH�9���'��/������ԫ_�y�w�zs_�����|^��M��ޕ_꿷�ڬ$�A]�Eg���׏�L�\�^����χ�{y��l��C�Pn7��.�f������p�5�7 �B�3ĉ_��6߫����S��~|�����A?���M������\���o�n�}ۗ�j�uoV��������ou�pL�~n�&`�P�A�	��w�mL�m�P<�,HX����pS��w��5��a:���|�*�h�.�C�@:��y�V�(�0�<pS���/�]]�l_��a_�7ǐ��o����Ƭ�a��l΃��oɨ���� 4gbwB���L����}�P�>W�?�UD7���Y����^�q�ށ�]%K���'���Ў�w0J)*��I0{jΣn�����}uX�����Q��O1e�R��l��z�wU�z�U�t�.<+1�.�9{��d�Y6Li��ZK���١�9�>��t���	 0�R�Q��.��5*���sڱtMZ.G��ی����&f���J2��8����h>g�!�D���+�,S�~A�C�	19���#E-�N���O��H��u�Y��`B�H�a�\��kƸ0Nx�"o͌L����ro�0{4���l\j��_����d �������vܺ'Nm�.Q:0����s��.���+�e����nd�)�g�%��:%4u��S����p��r?čI��R�0�t�DC }C����#Sfp�j(yt9Z�	�:@��օ�{�0D�`�R�J�HJ`DR�[̻#��6�zׯo��-�M1⥑R����'IH+Q�#J��VB��:Ābx�ʐ�yJ*�לl��ya��s�|d��f��
҆��b��*����2'�C���G��� ���L#�6���G�E�r�$�w�AG�:�X� ^��\�I55�Z\�T(8��m�ф��`=��nj���I]��[51Ľ�d�^��X���,�ҜӜ�T1=u��,/O�}7:	��Qt��&@/b��rĳ]����ҫ�gH�0��G>{��ѓ������y�lƘ$��7���.�˳!	�͙~��E�_r��s<M�q1z7�z��y�]$�tE<{�k�a��s��9E�$R�^�����	=V�h����3
�)���G*�]��o�����Q`����3G��٫e�x��,qr�z11n�{�כ��'��o��Ni���>NE�k��i� ��"��?İ�I΄�����[�!���F�e���*���b&tfsc�\�s�,�{*������P8��'}����$��3/K�H�x8��	�B&}IPv�I��<��X����ͱ�xa,�'|�#��g����QxYW)y����T'����<�'�ss]U���>X:���n+0�O=Yw)j�wihK�t}�<ʤ���է����7�۸���}�b�Vu�k ]?ah�����I5.f�{�o�m�y���%��j\zM���ܲ�����`�S_R���A[��9�{�5���ȷZOҐ��!}$��K�G�U�2K-��(����         d   x�3�,H,�I��KLI-r��/�M���K���T1JT14P�0sJ�w1(+���*���sI�t��	0�(-O���L*����M2�L������� tK     