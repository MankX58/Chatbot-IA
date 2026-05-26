-- Tabla para guardar los tickets de soporte
CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(100) PRIMARY KEY,
    owner_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    rating INTEGER,
    last_confidence JSONB,
    breadcrumb VARCHAR(255),
    preview TEXT,
    messages JSONB DEFAULT '[]'::jsonb,
    support_responses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para la base de conocimientos aprendida dinámicamente
CREATE TABLE IF NOT EXISTS learned_kb (
    id SERIAL PRIMARY KEY,
    tema VARCHAR(255) NOT NULL,
    problema TEXT NOT NULL,
    solucion TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
