--
-- PostgreSQL database dump
--

\restrict n9aaiwa1dZT6S6em2cwfEbHGtBEvsSYQaG7ZLz3pWG52k4TjAYIuwoXfxf6eQD9

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2025-12-04 14:47:40

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
-- TOC entry 4989 (class 0 OID 0)
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
-- TOC entry 4990 (class 0 OID 0)
-- Dependencies: 219
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- TOC entry 233 (class 1259 OID 24695)
-- Name: employee_technology; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_technology (
    employee_id integer NOT NULL,
    technology_id integer NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 24683)
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    busy_from date,
    busy_to date,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    CONSTRAINT busy_range_chk CHECK (((busy_from IS NULL) OR (busy_to IS NULL) OR (busy_from <= busy_to)))
);


--
-- TOC entry 231 (class 1259 OID 24682)
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4991 (class 0 OID 0)
-- Dependencies: 231
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


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
-- TOC entry 4992 (class 0 OID 0)
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
-- TOC entry 4993 (class 0 OID 0)
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
    client_id integer NOT NULL,
    employee_id integer
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
-- TOC entry 4994 (class 0 OID 0)
-- Dependencies: 223
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- TOC entry 230 (class 1259 OID 24672)
-- Name: technologies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.technologies (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 24671)
-- Name: technologies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.technologies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4995 (class 0 OID 0)
-- Dependencies: 229
-- Name: technologies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.technologies_id_seq OWNED BY public.technologies.id;


--
-- TOC entry 4790 (class 2604 OID 24594)
-- Name: client_addresses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_addresses ALTER COLUMN id SET DEFAULT nextval('public.client_addresses_id_seq'::regclass);


--
-- TOC entry 4789 (class 2604 OID 24580)
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- TOC entry 4802 (class 2604 OID 24686)
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- TOC entry 4796 (class 2604 OID 24648)
-- Name: pricing_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_history ALTER COLUMN id SET DEFAULT nextval('public.pricing_history_id_seq'::regclass);


--
-- TOC entry 4792 (class 2604 OID 24629)
-- Name: project_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_details ALTER COLUMN id SET DEFAULT nextval('public.project_details_id_seq'::regclass);


--
-- TOC entry 4791 (class 2604 OID 24615)
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- TOC entry 4801 (class 2604 OID 24675)
-- Name: technologies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.technologies ALTER COLUMN id SET DEFAULT nextval('public.technologies_id_seq'::regclass);


--
-- TOC entry 4810 (class 2606 OID 24605)
-- Name: client_addresses client_addresses_client_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_addresses
    ADD CONSTRAINT client_addresses_client_id_key UNIQUE (client_id);


--
-- TOC entry 4812 (class 2606 OID 24603)
-- Name: client_addresses client_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_addresses
    ADD CONSTRAINT client_addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 4806 (class 2606 OID 24589)
-- Name: clients clients_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_email_key UNIQUE (email);


--
-- TOC entry 4808 (class 2606 OID 24587)
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- TOC entry 4827 (class 2606 OID 24701)
-- Name: employee_technology employee_technology_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_technology
    ADD CONSTRAINT employee_technology_pkey PRIMARY KEY (employee_id, technology_id);


--
-- TOC entry 4824 (class 2606 OID 24694)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 4818 (class 2606 OID 24660)
-- Name: pricing_history pricing_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_history
    ADD CONSTRAINT pricing_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4816 (class 2606 OID 24638)
-- Name: project_details project_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_details
    ADD CONSTRAINT project_details_pkey PRIMARY KEY (id);


--
-- TOC entry 4814 (class 2606 OID 24619)
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- TOC entry 4820 (class 2606 OID 24681)
-- Name: technologies technologies_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.technologies
    ADD CONSTRAINT technologies_name_key UNIQUE (name);


--
-- TOC entry 4822 (class 2606 OID 24679)
-- Name: technologies technologies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.technologies
    ADD CONSTRAINT technologies_pkey PRIMARY KEY (id);


--
-- TOC entry 4825 (class 1259 OID 24712)
-- Name: employee_technology_emp_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX employee_technology_emp_idx ON public.employee_technology USING btree (employee_id);


--
-- TOC entry 4828 (class 1259 OID 24713)
-- Name: employee_technology_tech_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX employee_technology_tech_idx ON public.employee_technology USING btree (technology_id);


--
-- TOC entry 4835 (class 2606 OID 24702)
-- Name: employee_technology employee_technology_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_technology
    ADD CONSTRAINT employee_technology_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 4836 (class 2606 OID 24707)
-- Name: employee_technology employee_technology_technology_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_technology
    ADD CONSTRAINT employee_technology_technology_id_fkey FOREIGN KEY (technology_id) REFERENCES public.technologies(id) ON DELETE RESTRICT;


--
-- TOC entry 4829 (class 2606 OID 24606)
-- Name: client_addresses fk_client_address; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_addresses
    ADD CONSTRAINT fk_client_address FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- TOC entry 4833 (class 2606 OID 24661)
-- Name: pricing_history fk_history_client; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_history
    ADD CONSTRAINT fk_history_client FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- TOC entry 4834 (class 2606 OID 24666)
-- Name: pricing_history fk_history_project; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_history
    ADD CONSTRAINT fk_history_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- TOC entry 4830 (class 2606 OID 24620)
-- Name: projects fk_project_client; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_project_client FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- TOC entry 4832 (class 2606 OID 24639)
-- Name: project_details fk_project_details; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_details
    ADD CONSTRAINT fk_project_details FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- TOC entry 4831 (class 2606 OID 24714)
-- Name: projects fk_project_employee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_project_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


-- Completed on 2025-12-04 14:47:40

--
-- PostgreSQL database dump complete
--

\unrestrict n9aaiwa1dZT6S6em2cwfEbHGtBEvsSYQaG7ZLz3pWG52k4TjAYIuwoXfxf6eQD9

