-- ======================================================================
-- ÍRISCLIN WEB - PATCH OFICIAL VERSÃO 2.0
-- CRIAÇÃO DE NOVAS TABELAS, ÍNDICES, RLS E TRIGGERS DE SEGURANÇA
-- ======================================================================

-- 1. TABELA DE DOCUMENTOS DETALHADOS DO PACIENTE (DOSSIÊ ESCANEADO)
CREATE TABLE IF NOT EXISTS public.iris_patient_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- receita, exame, ocr_ficha, outro
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    category VARCHAR(100), -- Receita Médica, Exame Ocular, Ficha Digitalizada
    date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    doctor_name VARCHAR(255),
    usuario_nome VARCHAR(255),
    versao VARCHAR(20) DEFAULT '2.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TABELA DE DETALHES DE OCR E PROCESSAMENTO DE FICHAS COM IA
CREATE TABLE IF NOT EXISTS public.iris_patient_ocr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id VARCHAR(100),
    image_url TEXT,
    raw_text TEXT,
    structured_json JSONB,
    resumo_ia TEXT,
    usuario_nome VARCHAR(255),
    versao VARCHAR(20) DEFAULT '2.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABELA DE HISTÓRICO DE ATUALIZAÇÃO E HIGIENIZAÇÃO DE CADASTROS (ANTI DUPLICIDADE)
CREATE TABLE IF NOT EXISTS public.iris_patient_update_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id VARCHAR(100) NOT NULL,
    alterado_por VARCHAR(255) NOT NULL,
    campos_alterados JSONB NOT NULL, -- { "email": { "antigo": "", "novo": "paciente@email.com" } }
    origem VARCHAR(50) DEFAULT 'OCR', -- OCR, Manual
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABELA DE RESUMO E ANÁLISE DE SEGURANÇA E CONSISTÊNCIA DE IA IRIS
CREATE TABLE IF NOT EXISTS public.iris_patient_ai_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id VARCHAR(100) NOT NULL UNIQUE,
    resumo TEXT NOT NULL,
    inconsistencias TEXT, -- "CPF inválido, CEP inválido"
    campos_faltando TEXT, -- "RG, E-mail"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ======================================================================
-- INDEXES DE DESEMPENHO E BUSCA RÁPIDA (CONFORME REQUISITOS DO PATCH)
-- ======================================================================

CREATE INDEX IF NOT EXISTS idx_iris_patient_documents_paciente ON public.iris_patient_documents(paciente_id);
CREATE INDEX IF NOT EXISTS idx_iris_patient_ocr_paciente ON public.iris_patient_ocr(paciente_id);
CREATE INDEX IF NOT EXISTS idx_iris_patient_history_paciente ON public.iris_patient_update_history(paciente_id);

-- ======================================================================
-- AUTOMATIC UPDATED_AT TRIGGER PARA RESUMO IA
-- ======================================================================

CREATE OR REPLACE FUNCTION public.set_patient_summary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_iris_patient_summary_updated_at
    BEFORE UPDATE ON public.iris_patient_ai_summary
    FOR EACH ROW EXECUTE FUNCTION public.set_patient_summary_updated_at();

-- ======================================================================
-- SECURITY POLICY (RLS) - NÚCLEO DE SEGURANÇA
-- ======================================================================

ALTER TABLE public.iris_patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iris_patient_ocr ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iris_patient_update_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iris_patient_ai_summary ENABLE ROW LEVEL SECURITY;

-- 1. POLÍTICAS: CEO ACESSO TOTAL
CREATE POLICY "CEO acesso total patient_documents" ON public.iris_patient_documents 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.iris_perfis WHERE user_id = auth.uid() AND role = 'ceo')
    );

CREATE POLICY "CEO acesso total patient_ocr" ON public.iris_patient_ocr 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.iris_perfis WHERE user_id = auth.uid() AND role = 'ceo')
    );

CREATE POLICY "CEO acesso total patient_update_history" ON public.iris_patient_update_history 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.iris_perfis WHERE user_id = auth.uid() AND role = 'ceo')
    );

CREATE POLICY "CEO acesso total patient_ai_summary" ON public.iris_patient_ai_summary 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.iris_perfis WHERE user_id = auth.uid() AND role = 'ceo')
    );

-- 2. POLÍTICAS: LÍDERES E PROFISSIONAIS PODEM SELECIONAR E INSERIR
CREATE POLICY "Líder e Profissional acesso docs" ON public.iris_patient_documents
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.iris_perfis WHERE user_id = auth.uid() AND role IN ('ceo', 'lider', 'profissional'))
    );

CREATE POLICY "Líder e Profissional acesso ocr" ON public.iris_patient_ocr
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.iris_perfis WHERE user_id = auth.uid() AND role IN ('ceo', 'lider', 'profissional'))
    );

CREATE POLICY "Líder e Profissional acesso history" ON public.iris_patient_update_history
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.iris_perfis WHERE user_id = auth.uid() AND role IN ('ceo', 'lider', 'profissional'))
    );

CREATE POLICY "Líder e Profissional acesso summary" ON public.iris_patient_ai_summary
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.iris_perfis WHERE user_id = auth.uid() AND role IN ('ceo', 'lider', 'profissional'))
    );
