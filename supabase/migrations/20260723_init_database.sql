-- ======================================================================
-- ÍRISCLIN / MANUTENÇÃO DI CASA - INSTALAÇÃO DO BANCO DE DADOS
-- MIGRATION INICIAL: CRIAÇÃO DE TABELAS, SEGURANÇA RLS & POLÍTICAS
-- TABELAS PREFIXADAS COM 'iris_' PARA EVITAR QUALQUER COLISÃO
-- ======================================================================

-- 1. HABILITAR EXTENSÕES RELEVANTES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM DE ROLES / PERFIS (ÍRISCLIN)
CREATE TYPE iris_user_role AS ENUM ('ceo', 'lider', 'profissional', 'cliente');

-- 3. TABELA DE PERFIS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.iris_perfis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(50),
    role iris_user_role NOT NULL DEFAULT 'cliente',
    lider_id UUID REFERENCES public.iris_perfis(id) ON DELETE SET NULL, -- Caso profissional pertença a um líder
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABELA DE CONSULTAS / CHAMADOS (DOMÍNIO INTEGRADO)
CREATE TABLE IF NOT EXISTS public.iris_consultas_chamados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.iris_perfis(id) ON DELETE CASCADE NOT NULL,
    profissional_id UUID REFERENCES public.iris_perfis(id) ON DELETE SET NULL,
    tipo_servico VARCHAR(255) NOT NULL, -- Ex: "Exame de Vista", "Mapeamento de Retina"
    localizacao VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'ABERTO', -- ABERTO, ACEITO, EM_EXECUCAO, FINALIZADO_PENDENTE_AVALIACAO, CONCLUIDO
    valor_total NUMERIC(10, 2) DEFAULT 0.00,
    status_pagamento VARCHAR(50) DEFAULT 'PENDENTE', -- PENDENTE, CONFIRMADO, FALHOU
    forma_pagamento VARCHAR(50), -- Dinheiro, Pix, Cartão, Depósito
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TABELA DE MENSAGENS DO CHAT
CREATE TABLE IF NOT EXISTS public.iris_mensagens_chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consulta_id UUID REFERENCES public.iris_consultas_chamados(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.iris_perfis(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. TABELA DE TRANSAÇÕES DE CAIXA
CREATE TABLE IF NOT EXISTS public.iris_transacoes_caixa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descricao TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- entrada, saida
    category VARCHAR(100) NOT NULL, -- Vendas, Despesas, Bancário, Saldo Inicial
    status VARCHAR(20) DEFAULT 'pago', -- pago, pendente
    forma_pagamento VARCHAR(50),
    data DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. TABELA DE AUDITORIA DE SEGURANÇA (LGPD)
CREATE TABLE IF NOT EXISTS public.iris_auditoria_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operacao VARCHAR(50) NOT NULL, -- SELECT, INSERT, UPDATE, DELETE
    tabela VARCHAR(100) NOT NULL,
    user_id UUID,
    detalhes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ======================================================================
-- INDEXES DE DESEMPENHO (OTIMIZAÇÃO DO BANCO)
-- ======================================================================

CREATE INDEX IF NOT EXISTS idx_iris_perfis_user_id ON public.iris_perfis(user_id);
CREATE INDEX IF NOT EXISTS idx_iris_perfis_lider_id ON public.iris_perfis(lider_id);
CREATE INDEX IF NOT EXISTS idx_iris_consultas_cliente_id ON public.iris_consultas_chamados(cliente_id);
CREATE INDEX IF NOT EXISTS idx_iris_consultas_profissional_id ON public.iris_consultas_chamados(profissional_id);
CREATE INDEX IF NOT EXISTS idx_iris_mensagens_consulta_id ON public.iris_mensagens_chat(consulta_id);
CREATE INDEX IF NOT EXISTS idx_iris_transacoes_data ON public.iris_transacoes_caixa(data);

-- ======================================================================
-- AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ======================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_iris_perfis_updated_at
    BEFORE UPDATE ON public.iris_perfis
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_iris_consultas_updated_at
    BEFORE UPDATE ON public.iris_consultas_chamados
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_iris_transacoes_updated_at
    BEFORE UPDATE ON public.iris_transacoes_caixa
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================================================================
-- SECURITY POLICY (RLS) - NÚCLEO DE SEGURANÇA
-- ======================================================================

ALTER TABLE public.iris_perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iris_consultas_chamados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iris_mensagens_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iris_transacoes_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iris_auditoria_logs ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: TABELA PERFIS
-- 1. CEO pode ler/escrever qualquer perfil
CREATE POLICY "CEO acesso total perfis" ON public.iris_perfis 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.iris_perfis WHERE user_id = auth.uid() AND role = 'ceo')
    );

-- 2. Líder pode ver profissionais associados a ele e seu próprio perfil
CREATE POLICY "Líder visualiza seu time e si mesmo" ON public.iris_perfis
    FOR SELECT USING (
        user_id = auth.uid() OR 
        lider_id IN (SELECT id FROM public.iris_perfis WHERE user_id = auth.uid() AND role = 'lider')
    );

-- 3. Profissional e Cliente podem ler seus próprios perfis
CREATE POLICY "Usuário lê seu próprio perfil" ON public.iris_perfis
    FOR SELECT USING (user_id = auth.uid());


-- POLÍTICAS: TABELA CONSULTAS_CHAMADOS
-- 1. CEO acesso total
CREATE POLICY "CEO acesso total consultas" ON public.iris_consultas_chamados
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.iris_perfis WHERE user_id = auth.uid() AND role = 'ceo')
    );

-- 2. Líder vê consultas de profissionais do seu time ou consultas onde ele mesmo está associado
CREATE POLICY "Líder vê consultas do time" ON public.iris_consultas_chamados
    FOR SELECT USING (
        profissional_id IN (
            SELECT id FROM public.iris_perfis 
            WHERE lider_id IN (SELECT id FROM public.iris_perfis WHERE user_id = auth.uid() AND role = 'lider')
        )
    );

-- 3. Profissional vê apenas consultas atribuídas a ele
CREATE POLICY "Profissional vê suas consultas atribuídas" ON public.iris_consultas_chamados
    FOR ALL USING (
        profissional_id IN (SELECT id FROM public.iris_perfis WHERE user_id = auth.uid() AND role = 'profissional')
    );

-- 4. Cliente vê apenas suas próprias consultas
CREATE POLICY "Cliente vê suas próprias consultas" ON public.iris_consultas_chamados
    FOR ALL USING (
        cliente_id IN (SELECT id FROM public.iris_perfis WHERE user_id = auth.uid() AND role = 'cliente')
    );


-- POLÍTICAS: TABELA MENSAGENS_CHAT
-- 1. CEO acesso total à auditoria do chat
CREATE POLICY "CEO auditoria chat" ON public.iris_mensagens_chat
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.iris_perfis WHERE user_id = auth.uid() AND role = 'ceo')
    );

-- 2. Participantes da consulta (Cliente e Profissional atribuído) podem conversar
CREATE POLICY "Participantes conversam no chat" ON public.iris_mensagens_chat
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.iris_consultas_chamados c
            JOIN public.iris_perfis p ON (p.id = c.cliente_id OR p.id = c.profissional_id)
            WHERE c.id = iris_mensagens_chat.consulta_id AND p.user_id = auth.uid()
        )
    );


-- POLÍTICAS: TABELA TRANSAÇÕES DE CAIXA
-- 1. CEO acesso total financeiro
CREATE POLICY "CEO controle financeiro total" ON public.iris_transacoes_caixa
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.iris_perfis WHERE user_id = auth.uid() AND role = 'ceo')
    );

-- 2. Líderes podem ler transações para controle de fechamento do caixa
CREATE POLICY "Líder lê transações financeiras" ON public.iris_transacoes_caixa
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.iris_perfis WHERE user_id = auth.uid() AND role = 'lider')
    );


-- POLÍTICAS: TABELA AUDITORIA LOGS (LGPD)
-- 1. Apenas CEO pode ler logs de auditoria
CREATE POLICY "CEO auditoria de logs" ON public.iris_auditoria_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.iris_perfis WHERE user_id = auth.uid() AND role = 'ceo')
    );
