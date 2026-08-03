-- Customer data is managed exclusively through authenticated server routes.
CREATE TABLE public.customers (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    ubicacion1 TEXT NOT NULL,
    ubicacion2 TEXT,
    correo_electronico TEXT,
    source TEXT NOT NULL DEFAULT 'whatsapp',
    status TEXT NOT NULL DEFAULT 'prospecto',
    tipo_cliente TEXT NOT NULL DEFAULT 'nuevo',
    created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT customers_pkey PRIMARY KEY (id),
    CONSTRAINT customers_nombre_check CHECK (char_length(btrim(nombre)) BETWEEN 2 AND 160),
    CONSTRAINT customers_telefono_check CHECK (char_length(btrim(telefono)) BETWEEN 7 AND 30),
    CONSTRAINT customers_ubicacion1_check CHECK (char_length(btrim(ubicacion1)) BETWEEN 3 AND 300),
    CONSTRAINT customers_ubicacion2_check CHECK (ubicacion2 IS NULL OR char_length(btrim(ubicacion2)) <= 300),
    CONSTRAINT customers_correo_check CHECK (correo_electronico IS NULL OR char_length(correo_electronico) <= 254),
    CONSTRAINT customers_source_check CHECK (source IN ('whatsapp', 'instagram', 'facebook', 'sitio_web', 'recomendacion', 'otro')),
    CONSTRAINT customers_status_check CHECK (status IN ('prospecto', 'activo', 'inactivo')),
    CONSTRAINT customers_tipo_cliente_check CHECK (tipo_cliente IN ('nuevo', 'recurrente', 'corporativo'))
);

CREATE INDEX customers_status_tipo_nombre_idx
    ON public.customers (status, tipo_cliente, nombre, id);

CREATE INDEX customers_source_idx ON public.customers (source);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.customers IS
    'Clientes administrados por las rutas autenticadas del panel; sin acceso directo por Data API.';
