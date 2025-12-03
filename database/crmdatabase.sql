--
-- PostgreSQL database dump
--

\restrict ncnOGzJeX7KEA79wxNRPCm6bwhWhekvkrGpy0WRGIxM8otSc8qfTQo8THsYgUql

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2025-12-03 22:50:53

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

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- TOC entry 222 (class 1259 OID 24591)
-- Name: client_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_addresses (
    id integer NOT NULL,
    client_id integer NOT NULL,
    city character varying(100) NOT NULL,
    postal_code character varying(6) NOT NULL,
    street character varying(100) NOT NULL,
    building_number character varying(20) NOT NULL,
    nip character varying(15) NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 24590)
-- Name: client_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4958 (class 0 OID 0)
-- Dependencies: 221
-- Name: client_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_addresses_id_seq OWNED BY public.client_addresses.id;


--
-- TOC entry 220 (class 1259 OID 24577)
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    is_lead boolean NOT NULL,
    email character varying(150) NOT NULL,
    phone character varying(30)
);


--
-- TOC entry 219 (class 1259 OID 24576)
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4959 (class 0 OID 0)
-- Dependencies: 219
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- TOC entry 228 (class 1259 OID 24645)
-- Name: pricing_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pricing_history (
    id integer NOT NULL,
    client_id integer NOT NULL,
    project_id integer NOT NULL,
    quote_date date DEFAULT CURRENT_DATE NOT NULL,
    cost numeric(12,2),
    currency character varying(3) DEFAULT 'PLN'::character varying,
    status character varying(50) DEFAULT 'draft'::character varying,
    is_paid boolean DEFAULT false,
    notes text
);


--
-- TOC entry 227 (class 1259 OID 24644)
-- Name: pricing_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pricing_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4960 (class 0 OID 0)
-- Dependencies: 227
-- Name: pricing_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pricing_history_id_seq OWNED BY public.pricing_history.id;


--
-- TOC entry 226 (class 1259 OID 24626)
-- Name: project_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_details (
    id integer NOT NULL,
    project_id integer NOT NULL,
    project_name character varying(200),
    description text,
    technologies text,
    estimated_hours numeric(10,2),
    estimated_price numeric(12,2),
    status character varying(50) DEFAULT 'new'::character varying,
    start_date date DEFAULT CURRENT_DATE,
    end_date date DEFAULT CURRENT_DATE
);


--
-- TOC entry 225 (class 1259 OID 24625)
-- Name: project_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4961 (class 0 OID 0)
-- Dependencies: 225
-- Name: project_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_details_id_seq OWNED BY public.project_details.id;


--
-- TOC entry 224 (class 1259 OID 24612)
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    client_id integer NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 24611)
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4962 (class 0 OID 0)
-- Dependencies: 223
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- TOC entry 4776 (class 2604 OID 24594)
-- Name: client_addresses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_addresses ALTER COLUMN id SET DEFAULT nextval('public.client_addresses_id_seq'::regclass);


--
-- TOC entry 4775 (class 2604 OID 24580)
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- TOC entry 4782 (class 2604 OID 24648)
-- Name: pricing_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_history ALTER COLUMN id SET DEFAULT nextval('public.pricing_history_id_seq'::regclass);


--
-- TOC entry 4778 (class 2604 OID 24629)
-- Name: project_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_details ALTER COLUMN id SET DEFAULT nextval('public.project_details_id_seq'::regclass);


--
-- TOC entry 4777 (class 2604 OID 24615)
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- TOC entry 4792 (class 2606 OID 24605)
-- Name: client_addresses client_addresses_client_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_addresses
    ADD CONSTRAINT client_addresses_client_id_key UNIQUE (client_id);


--
-- TOC entry 4794 (class 2606 OID 24603)
-- Name: client_addresses client_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_addresses
    ADD CONSTRAINT client_addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 4788 (class 2606 OID 24589)
-- Name: clients clients_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_email_key UNIQUE (email);


--
-- TOC entry 4790 (class 2606 OID 24587)
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- TOC entry 4800 (class 2606 OID 24660)
-- Name: pricing_history pricing_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_history
    ADD CONSTRAINT pricing_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4798 (class 2606 OID 24638)
-- Name: project_details project_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_details
    ADD CONSTRAINT project_details_pkey PRIMARY KEY (id);


--
-- TOC entry 4796 (class 2606 OID 24619)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- TOC entry 4801 (class 2606 OID 24606)
-- Name: client_addresses fk_client_address; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_addresses
    ADD CONSTRAINT fk_client_address FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- TOC entry 4804 (class 2606 OID 24661)
-- Name: pricing_history fk_history_client; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_history
    ADD CONSTRAINT fk_history_client FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- TOC entry 4805 (class 2606 OID 24666)
-- Name: pricing_history fk_history_project; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_history
    ADD CONSTRAINT fk_history_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- TOC entry 4802 (class 2606 OID 24620)
-- Name: projects fk_project_client; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_project_client FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- TOC entry 4803 (class 2606 OID 24639)
-- Name: project_details fk_project_details; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_details
    ADD CONSTRAINT fk_project_details FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


-- Completed on 2025-12-03 22:50:53

--
-- PostgreSQL database dump complete
--

\unrestrict ncnOGzJeX7KEA79wxNRPCm6bwhWhekvkrGpy0WRGIxM8otSc8qfTQo8THsYgUql

