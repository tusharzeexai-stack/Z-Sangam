-- ==============================================================================
-- Z-SANGAM ENTERPRISE PROJECT MANAGEMENT PLATFORM
-- Migration 005: Seed Data for Demo & Standard Organizations
-- ==============================================================================

-- 1. Insert Default Organization
INSERT INTO public.organizations (id, name, slug, logo_url, description)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Z-Sangam Demo Organization',
    'zsangam-demo',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
    'Premier multi-departmental enterprise orchestrating high-velocity technology and strategic initiatives.'
) ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Core Departments
INSERT INTO public.departments (id, organization_id, name, code, description, status, accent_color, category)
VALUES 
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Engineering & Technology',
    'ENG',
    'Core platform development, cloud architecture, frontend systems, distributed engines, and DevOps infrastructure.',
    'ON TRACK',
    '#3b82f6',
    'Core Engineering'
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'Artificial Intelligence & ML',
    'AIML',
    'Deep generative reasoning, neural network pipelines, multimodal inference, grounding frameworks, and LLM evaluation.',
    'SCALING',
    '#8b5cf6',
    'Strategic Innovation'
),
(
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Product Strategy & Design',
    'PROD',
    'Enterprise user experience, strategic roadmap definition, design systems, usability research, and feature scoping.',
    'STABLE',
    '#ec4899',
    'Strategic Innovation'
),
(
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004',
    'Operations & Infrastructure',
    'OPS',
    'Global cloud compute optimization, site reliability engineering, network topologies, database clusters, and compliance.',
    'ON TRACK',
    '#10b981',
    'Business & Operations'
)
ON CONFLICT (organization_id, code) DO NOTHING;

-- 3. Insert Teams under Departments
INSERT INTO public.teams (id, organization_id, department_id, name, code, short_tag, description, focus_area, status)
VALUES
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Frontend Engineering',
    'FE-01',
    'FE',
    'Builds next-generation responsive dashboards, design systems, and client telemetry.',
    'React, Tailwind, Motion UI, Web Vitals & Realtime streaming UI',
    'Active'
),
(
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Backend Systems',
    'BE-01',
    'BE',
    'High-throughput distributed APIs, PostgreSQL schemas, real-time message brokers, and security.',
    'Microservices, Node, Go, Supabase, Redis & Event Pipelines',
    'Active'
),
(
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'Generative Intelligence',
    'GENAI',
    'GI',
    'Foundation models, RAG vector retrieval, agent tool orchestration, and model reasoning.',
    'Gemini API, PyTorch, Vector DBs & Autonomous Agents',
    'Active'
),
(
    '20000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000003',
    'Design Systems & UX',
    'UX-01',
    'UX',
    'User journeys, design tokens, accessibility standards, interactive mockups, and client workflows.',
    'Figma, Atomic UI tokens, WCAG AA & Enterprise ergonomics',
    'Active'
)
ON CONFLICT (department_id, code) DO NOTHING;
