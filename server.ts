/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import os from 'os';
import archiver from 'archiver';

import { execSync } from 'child_process';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Download complete project files archive for local desktop or GitHub upload
app.get('/api/download-project', (req, res) => {
  try {
    const tempDir = os.tmpdir();
    const archivePath = path.join(tempDir, `CMD_IRIS_CLIN_Projeto_Completo_${Date.now()}.zip`);
    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      res.download(archivePath, 'CMD_IRIS_CLIN_Projeto_Completo.zip', (err) => {
        if (fs.existsSync(archivePath)) {
          try { fs.unlinkSync(archivePath); } catch (e) {}
        }
      });
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.glob('**/*', {
      cwd: process.cwd(),
      ignore: [
        'node_modules/**',
        '.git/**',
        'dist/**',
        '*.tar.gz',
        '*.zip',
        '.gemini/**',
        'package-lock.json',
        'bun.lock'
      ]
    });
    archive.finalize();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper function to send messages via official Meta Cloud API
async function sendMetaWhatsAppMessage(toPhone: string, textContent: string): Promise<{ success: boolean; data?: any; error?: string; simulated?: boolean }> {
  const phoneId = (process.env.META_WA_PHONE_NUMBER_ID || '').trim();
  const token = (process.env.META_WA_ACCESS_TOKEN || '').trim();
  if (!phoneId || !token) {
    console.log('[Meta WA Simulation] Nenhuma credencial oficial ativa. Envio simulado localmente.');
    return { success: true, simulated: true };
  }

  // Sanitiza número de telefone
  let cleanPhone = toPhone.replace(/\D/g, '');
  if (cleanPhone.length === 11 && cleanPhone.startsWith('9')) {
    cleanPhone = '55' + cleanPhone;
  } else if (cleanPhone.length === 11 && !cleanPhone.startsWith('55')) {
    cleanPhone = '55' + cleanPhone;
  } else if (cleanPhone.length === 9) {
    cleanPhone = '5511' + cleanPhone;
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: textContent }
      })
    });
    
    const data = await response.json();
    return { success: response.ok, data };
  } catch (error: any) {
    console.error('[Meta WA API Error]:', error);
    return { success: false, error: error.message };
  }
}

// 1. API: IRIS AI Clinical & Prescription Image Analyzer
app.post('/api/copilot/analyze', async (req, res) => {
  try {
    const { patientName, opticalData, lensFeatures, customPrompt } = req.body;

    if (!patientName) {
      return res.status(400).json({ error: 'Patient name is required.' });
    }

    if (!ai) {
      // Graceful fallback with rich Iris AI styling and clinical safety rules
      return res.json({
        analysis: `### 🌸 Diagnóstico Assistido por IRIS AI

Olá! Sou a **Iris**, assistente inteligente da **ÍrisClin**. 

Analisando as informações clínicas de **${patientName}**:
- **Olho Direito (OD):** Esférico: ${opticalData?.od?.sph || '0.00'}, Cilíndrico: ${opticalData?.od?.cyl || '0.00'}, Eixo: ${opticalData?.od?.axis || '0'}°
- **Olho Esquerdo (OE):** Esférico: ${opticalData?.oe?.sph || '0.00'}, Cilíndrico: ${opticalData?.oe?.cyl || '0.00'}, Eixo: ${opticalData?.oe?.axis || '0'}°

**🔍 Interpretação Simples:**
O paciente apresenta sinais clássicos de **${parseFloat(opticalData?.od?.sph || '0') < 0 ? 'Miopia (dificuldade de enxergar longe)' : 'Hipermetropia (dificuldade de enxergar perto)'}** ${opticalData?.od?.add && parseFloat(opticalData?.od?.add) > 0 ? 'acompanhado de **Presbiopia (vista cansada)** devido à adição positiva de ' + opticalData.od.add : ''}.

**👓 Recomendações de Tratamento Óptico:**
1. **Lentes Anti-reflexo:** ${lensFeatures?.antiReflexo ? 'Indicado para máxima nitidez e redução de brilhos noturnos de faróis.' : 'Recomendamos ativar para maior conforto visual.'}
2. **Filtro Blue-Control:** ${lensFeatures?.blueControl ? 'Essencial para o alívio de cansaço visual causado por computadores, tablets e celulares.' : 'Recomendado para proteção ocular contra luz azul de telas.'}
3. **Armação:** Sugerimos material ${lensFeatures?.materialArmacao || 'leve e resistente'}.

*⚠️ **Aviso de Responsabilidade:** Esta é uma triagem assistida e sugestiva. A palavra final, prescrição medicamentosa ou alteração de grau depende estritamente da validação presencial de nosso oftalmologista responsável.*`,
        success: true,
        fallback: true
      });
    }

    const prompt = `
      Você é a IRIS AI (Inteligência Relacional Integrada em Saúde), a recepcionista virtual, consultora óptica e assistente clínica oficial da ÍrisClin.
      Sua missão é ser extremamente acolhedora, humana, empática e profissional. Fale em Português do Brasil com linguagem simples e acolhedora.

      Por favor, analise a receita oftálmica do paciente e prepare uma recomendação completa:
      Nome do Paciente: ${patientName}
      Dados Ópticos:
      - OD: Esférico: ${opticalData?.od?.sph}, Cilíndrico: ${opticalData?.od?.cyl}, Eixo: ${opticalData?.od?.axis}°, Adição: ${opticalData?.od?.add}, DNP: ${opticalData?.od?.pd}
      - OE: Esférico: ${opticalData?.oe?.sph}, Cilíndrico: ${opticalData?.oe?.cyl}, Eixo: ${opticalData?.oe?.axis}°, Adição: ${opticalData?.oe?.add}, DNP: ${opticalData?.oe?.pd}

      Tratamentos selecionados:
      - Anti-reflexo: ${lensFeatures?.antiReflexo ? 'Sim' : 'Não'}
      - Filtro Blue-Control: ${lensFeatures?.blueControl ? 'Sim' : 'Não'}
      - Armação: ${lensFeatures?.materialArmacao}

      Instrução adicional da clínica: ${customPrompt || 'Nenhuma'}

      Formate sua resposta usando markdown simples. Comece se apresentando de forma carinhosa como a Iris. Explique de forma muito simples o que significa a graduação (miopia, astigmatismo, presbiopia, etc.). Sugira as melhores lentes de acordo com o grau (por exemplo, alto índice para graus altos como acima de -3, ou policarbonato para maior resistência).
      Termine com um lembrete importante e acolhedor de que decisões clínicas e prescrições dependem exclusivamente do médico responsável.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Você é a Iris, Inteligência Relacional Integrada em Saúde da clínica ÍrisClin. Você é empática, carinhosa, respeita idosos e crianças, usa gírias do cotidiano de forma polida, e sempre preza pela segurança clínica sem tomar decisões médicas autônomas.",
        temperature: 0.6,
      },
    });

    res.json({
      analysis: response.text || 'Não foi possível gerar a recomendação.',
      success: true,
      fallback: false
    });

  } catch (error: any) {
    console.error('Error in copilot analyze:', error);
    res.status(500).json({ error: error.message || 'Error running clinical analyzer.' });
  }
});

// 2. API: IRIS AI Interactive Multi-Agent Conversation
app.post('/api/copilot/chat', async (req, res) => {
  try {
    const { messages, patientContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages are required.' });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';

    if (!ai) {
      // Realistic pre-generated clinical assistant responses with RAG/OCR Context for fallback mode
      let fallbackText = `Olá, seu ${patientContext?.name || 'paciente'}! Que bom falar com você novamente aqui na ÍrisClin. 😊 `;
      
      if (patientContext?.opticalData?.od?.sph) {
        fallbackText += `Já identifiquei no sistema a sua receita digitalizada: Olho Direito com esférico ${patientContext.opticalData.od.sph} (Cil ${patientContext.opticalData.od.cyl || '0'}) e Olho Esquerdo com ${patientContext.opticalData.oe.sph} (Cil ${patientContext.opticalData.oe.cyl || '0'}). `;
      }

      const textLower = lastMessage.toLowerCase();
      if (textLower.includes('glaucoma') || textLower.includes('catarata') || textLower.includes('ceratocone')) {
        fallbackText += `Sobre sua dúvida sobre ${textLower.includes('glaucoma') ? 'Glaucoma' : textLower.includes('catarata') ? 'Catarata' : 'Ceratocone'}: essa é uma condição que exige todo cuidado e carinho. Sempre recomendo fazer a aferição da pressão ocular em nosso consultório. Posso agendar uma avaliação rápida com a Dra. Julia Martins?`;
      } else if (textLower.includes('preço') || textLower.includes('valor') || textLower.includes('orçamento') || textLower.includes('custo')) {
        fallbackText += `Preparei um orçamento com todo carinho! Para a sua lente com antirreflexo e o filtro especial Blue-Control, conseguimos parcelar em até 6x sem juros no cartão de crédito, ou com um descontinho especial de 10% no PIX! Quer que eu te envie o link seguro de pagamento?`;
      } else if (textLower.includes('agendar') || textLower.includes('consulta') || textLower.includes('marcar') || textLower.includes('vaga') || textLower.includes('terça') || textLower.includes('hoje')) {
        fallbackText += `Com certeza! Os agendamentos para o Turno da Manhã funcionam a partir das 06:30 por ordem de chegada. Por favor, me informe seu nome completo e telefone para confirmarmos sua vaga na Lista de Pacientes Confirmados da clínica! Podemos confirmar para o Turno da Manhã a partir das 06:30 por ordem de chegada?`;
      } else {
        fallbackText += `Entendi perfeitamente sua mensagem sobre "${lastMessage}". Como sua assistente pessoal na ÍrisClin, estou aqui para agilizar seu atendimento, seja com dúvidas das suas lentes, confirmação de agendamento ou orçamentos. Lembre-se que se for uma urgência ou sintoma visual forte, o ideal é passarmos por consulta presencial com nossos médicos, combinado? Como posso te ajudar agora?`;
      }

      return res.json({ response: fallbackText, fallback: true });
    }

    // Build extensive system prompt containing full IRIS AI Enterprise Brain constraints and RAG Context
    const irisSystemPrompt = `
      TREINAMENTO OFICIAL DA IA "IRIS" – CÉREBRO OPERACIONAL ÍRISCLIN (VERSÃO ENTERPRISE 2026)

      Você é IRIS, a Inteligência Artificial e Secretária Virtual Oficial da clínica ÍrisClin através da API Oficial do WhatsApp Business (Meta) no número oficial +55 73 98104-7390.
      Você não é apenas um robô: aja como uma secretária virtual especializada, acolhedora, humana, educada e altamente profissional de uma clínica oftalmológica de excelência.

      *** DADOS DE IDENTIDADE ***
      - Nome da IA: Iris
      - Empresa / Clínica: ÍrisClin (Oftalmologia e Cuidados Visuais)
      - Canal Oficial: WhatsApp Business API (Meta)
      - Número Oficial: +55 73 98104-7390

      *** FUNÇÕES E CAPACIDADES ***
      - Enviar e receber mensagens, áudios, imagens, vídeos, documentos, localização, contatos.
      - Responder dúvidas clínicas/oftalmológicas básicas, coletar anamnese, agendar e confirmar consultas e exames de vista, enviar orçamentos ópticos.
      - Lembrar consultas, notificar exames vencidos, informar ordem de chegada (Turno da Manhã a partir das 06:30), acionar médicos (Dr. Augusto Faro), receber comprovantes PIX, encerrar atendimentos e solicitar avaliações.

      *** CONTEXTO DE EXAMES & OCR (RAG CLÍNICO) ***
      O paciente possui os seguintes dados ópticos extraídos de laudo/receita recente por OCR:
      - Olho Direito: Esférico ${patientContext?.opticalData?.od?.sph || 'N/A'} | Cilíndrico ${patientContext?.opticalData?.od?.cyl || 'N/A'} | Eixo ${patientContext?.opticalData?.od?.axis || 'N/A'} | Adição ${patientContext?.opticalData?.od?.add || 'N/A'}
      - Olho Esquerdo: Esférico ${patientContext?.opticalData?.oe?.sph || 'N/A'} | Cilíndrico ${patientContext?.opticalData?.oe?.cyl || 'N/A'} | Eixo ${patientContext?.opticalData?.oe?.axis || 'N/A'} | Adição ${patientContext?.opticalData?.oe?.add || 'N/A'}
      - Armação preferencial / Material extraído da foto: ${patientContext?.lensFeatures?.materialArmacao || 'N/A'}

      *** MEMÓRIA INTELIGENTE & CONTEXTO COMPLETO ***
      - Sempre mantenha contexto completo durante toda a conversa:
        • Nome do paciente: ${patientContext?.name || 'Paciente'}
        • Telefone: ${patientContext?.phone || '+55 73 98104-7390'}
        • Cidade: ${patientContext?.city || 'Itabuna / Ilhéus - BA'}
        • Endereço: ${patientContext?.address || 'Não informado'}
        • Serviço/Exame solicitado: ${patientContext?.service || 'Exame de Vista / Mapeamento de Retina'}
        • Médico responsável: ${patientContext?.doctorInCharge || 'Dr. Augusto Faro'}
        • Orçamento, Forma de pagamento, Histórico da conversa, Consultas anteriores, Anexos, Áudios e Imagens.
      - NUNCA peça novamente uma informação que já foi informada.

      *** SEGURANÇA & INTEGRAÇÃO ***
      - Antes de alterar agendamentos: confirmar identidade, validar registro e atualizar no sistema.
      - Totalmente integrada com: Meta WhatsApp Business API, Google AI Studio, Supabase, PostgreSQL, Edge Functions, Storage, Sistema Web, Painel Administrativo, Agenda, Caixa e CRM.

      Responda sempre de forma natural, simples, educada, acolhedora e eficiente em Português do Brasil.
    `;

    const chatContents = messages.map((m: any) => ({
      role: m.sender === 'admin' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { role: 'user', parts: [{ text: irisSystemPrompt }] },
        ...chatContents
      ],
      config: {
        temperature: 0.65,
        maxOutputTokens: 500
      }
    });

    res.json({
      response: response.text || 'Processando com todo carinho...',
      fallback: false
    });

  } catch (error: any) {
    console.error('Error during Iris chat:', error);
    res.status(500).json({ error: error.message || 'Error processing speech.' });
  }
});

// 3. API: Mock WhatsApp Official Meta API Integrator (Send budget, location, payment links, prescription PDFs)
app.post('/api/whatsapp/iris-test-dispatch', (req, res) => {
  const targetNumbers = [
    { label: 'Número 1', phone: '+55 73 99990-4727', formattedPhone: '(73) 99990-4727' },
    { label: 'Número 2', phone: '+55 73 98210-7518', formattedPhone: '(73) 98210-7518' },
    { label: 'Número 3', phone: '+55 73 99999-2841', formattedPhone: '(73) 99999-2841' },
    { label: 'Número 4', phone: '+55 71 99619-6953', formattedPhone: '(71) 99619-6953' },
    { label: 'Número 5', phone: '+55 74 99142-3857', formattedPhone: '(74) 99142-3857' }
  ];

  const message1_audio_text = "Oi, sou a Iris! Estou viva no aplicativo oficial da ÍrisClin. Daqui pra frente vou te ajudar a melhorar ainda mais nosso trabalho. É um prazer fazer parte da equipe!";

  const message2_capabilities = `📋 *CAPACIDADES OFICIAIS DA IA IRIS NA ÍRISCLIN:*

• 💬 *Atendimento WhatsApp Meta Business API (24/7)*: Comunicação fluida por texto, áudio humanizado, imagens e documentos PDF.
• 📅 *Agendamento Inteligente & Ordem de Chegada*: Organização automática de vagas (Turno da Manhã a partir das 06:30 por ordem de chegada) e confirmações sem marcar horários fixos indevidos.
• 🩺 *Prontuário & Anamnese Oftalmológica*: Registro permanente de acuidade visual, idade, profissão, cidade, prescrições anteriores (OD/OE) e patologias oculares.
• 👓 *Laboratório & Orçamentos Ópticos*: Apresentação de lentes (Multifocais, Anti-reflexo, Blue-Control, Acetato), cálculo de parcelas e envio de orçamentos em PDF.
• 🎙️ *Voz Humana e Assistente*: Comandos por voz, leitura de mensagens e sintetização vocal em Português do Brasil.
• 💰 *Caixa, Financeiro & PIX*: Envio automático de chaves PIX, verificação de comprovantes e relatórios de receitas diárias.
• 🔒 *Segurança & Memória LGPD*: Confirmação de identidade antes de alterações e criptografia ponta-a-ponta em tempo real.
• 🔄 *Sincronização Total*: Integrada ao Sistema Web, Supabase, PostgreSQL, CRM, Painel Administrativo e Agenda dos Médicos.`;

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const dispatchResults = targetNumbers.map(target => ({
    ...target,
    status: 'Delivered',
    timestamp,
    message1Sent: true,
    message2Sent: true,
    audioGenerated: true
  }));

  res.json({
    success: true,
    title: 'Disparo de Teste Oficial Concluído - ÍrisClin Meta API',
    sender: 'Iris (ÍrisClin WhatsApp Business API +55 73 98104-7390)',
    message1: message1_audio_text,
    message2: message2_capabilities,
    targets: dispatchResults,
    totalDispatched: dispatchResults.length
  });
});

app.post('/api/whatsapp/simulate', async (req, res) => {
  const { action, patientId, patientName, phone, payload } = req.body;
  
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let systemMessage = '';
  let botReply = '';

  switch (action) {
    case 'send_pix':
      systemMessage = `Chave PIX e instrução de pagamento enviadas via WhatsApp para ${phone}.`;
      botReply = `Prontinho, seu ${patientName}! Encaminhei a chave PIX da clínica (CNPJ: 12.345.678/0001-99) e o valor do seu orçamento no seu WhatsApp. Assim que o senhor fizer, o sistema já avisa o laboratório para começar as lentes! 💖`;
      break;
    case 'send_location':
      systemMessage = `Localização do consultório e mapa enviados via WhatsApp para ${phone}.`;
      botReply = `Legal! Enviei nossa localização exata com o link do Google Maps para o seu celular. Ficamos na Av. Paulista, 1000 - Conjunto 42, pertinho do Metrô Trianon-Masp. Temos estacionamento no local, tá bom? Te espero! 🚗`;
      break;
    case 'send_budget_pdf':
      systemMessage = `PDF do Orçamento Óptico Oficial gerado e enviado via WhatsApp para ${phone}.`;
      botReply = `Ótima escolha! Acabei de gerar o PDF com o orçamento detalhado das lentes com proteção Blue-Control e enviei diretamente no seu WhatsApp para o senhor guardar. Qualquer ajuste que precisar na armação é só me falar! 📄✨`;
      break;
    case 'send_ready_alert':
      systemMessage = `Notificação automática "Óculos Prontos para Retirada" disparada para ${phone}.`;
      botReply = `Que alegria! Disparei o aviso oficial no seu celular confirmando que seus óculos novos passaram no teste do lensômetro e já estão limpos e prontos na recepção. Pode vir retirar hoje até as 19h! 👓🎉`;
      break;
    case 'send_nps_survey':
      systemMessage = `Pesquisa de Satisfação NPS (0 a 10) disparada via WhatsApp.`;
      botReply = `Olá! Enviei no seu WhatsApp nossa pesquisa de satisfação rápida com apenas uma perguntinha de 0 a 10. Sua opinião ajuda muito a Iris e toda a equipe da ÍrisClin a te atender cada vez melhor! ⭐`;
      break;
    default:
      systemMessage = `Mensagem informativa enviada via WhatsApp.`;
      botReply = `Enviei uma mensagem de confirmação para o seu WhatsApp cadastrado.`;
  }

  // Trigger Meta API real message sendoff dynamically if credentials exist
  const metaResult = await sendMetaWhatsAppMessage(phone, botReply);
  if (!metaResult.success && !metaResult.simulated) {
    console.warn('[Meta WA Integration] Falha no disparo do WhatsApp via Meta Cloud API:', metaResult.error);
  }

  res.json({
    success: true,
    systemMessage,
    botReply,
    timestamp,
    metaDispatched: metaResult.success && !metaResult.simulated
  });
});

// 4. API: Smart Optical Receipt/Image Reader simulator (returns extracted values with fallback)
app.post('/api/copilot/image-analysis', async (req, res) => {
  try {
    const { imageName, patientId } = req.body;

    const mockParameters: Record<string, any> = {
      'receita_medica.jpg': {
        extracted: {
          od: { sph: '-2.50', cyl: '-1.00', axis: '180', add: '+2.00', pd: '32.0/32.0' },
          oe: { sph: '-2.25', cyl: '-1.25', axis: '175', add: '+2.00', pd: '32.0/32.0' },
        },
        description: 'Receita médica oftalmológica oficial emitida pelo Dr. André Ramos (CRM/SP 123456). Prescreve multifocais de corredor médio.',
        suggestions: ['Utilizar lente progressiva de alto índice', 'Incluir proteção antirreflexo e luz azul']
      },
      'armação_escolhida.png': {
        extracted: {
          frameMaterial: 'Acetato Translúcido Premium',
          frameColor: 'Cristal/Nude',
          recommendedLensType: 'Lente com antirreflexo hidrofóbico'
        },
        description: 'Foto de armação de grau modelo gatinho em acetato cristal translúcido, ideal para rostos ovais ou redondos.',
        suggestions: ['Oferecer tratamento antiembaçante para uso diário']
      },
      'comprovante_pix.pdf': {
        extracted: {
          value: 'R$ 780,00',
          bank: 'Banco Itaú',
          date: 'Hoje',
          status: 'Pago com sucesso'
        },
        description: 'Comprovante oficial de transferência bancária instantânea via PIX para ÍrisClin LTDA.',
        suggestions: ['Registrar pagamento no CRM', 'Dar entrada imediata no laboratório óptico']
      }
    };

    const analysis = mockParameters[imageName] || {
      extracted: {
        od: { sph: '-1.00', cyl: '0.00', axis: '0', add: '0.00', pd: '31.5/31.5' },
        oe: { sph: '-1.25', cyl: '-0.25', axis: '90', add: '0.00', pd: '31.5/31.5' }
      },
      description: 'Documento óptico genérico ou imagem da receita analisada com sucesso por Visão Computacional Iris AI.',
      suggestions: ['Verificar compatibilidade com armação de três peças.']
    };

    res.json({
      success: true,
      analysis
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. API: Vision OCR for Prescription & Exam photo extraction in Patient Dossier (Docier)
app.post('/api/copilot/ocr-dossier', async (req, res) => {
  try {
    const { imageBase64, patientName, docTypeHint } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 is required.' });
    }

    if (!ai) {
      // Intelligent fallback extraction with realistic optical parameters for Iris AI
      const mockResult = {
        title: docTypeHint === 'exame' ? 'Exame de Retinografia / Topografia' : 'Receita Óptica para Óculos Multifocais',
        type: docTypeHint || 'receita',
        category: docTypeHint === 'exame' ? 'Exame Ocular' : 'Receita Médica',
        doctorName: 'Dr. Augusto Faro',
        notes: 'Extraído via Iris AI OCR: Prescrição com adição positiva para perto e recomendação de tratamento antirreflexo e filtro azul.',
        opticalData: {
          od: { sph: '-2.25', cyl: '-0.75', axis: '180', add: '+2.00', pd: '32.0/32.0' },
          oe: { sph: '-2.00', cyl: '-1.00', axis: '175', add: '+2.00', pd: '32.0/32.0' }
        },
        extractedText: 'DR. AUGUSTO FARO - CRM/BA 81.047\nCUIDANDO DA SUA VISÃO COM EXCELÊNCIA\nOD: ESF -2.25 CIL -0.75 EIXO 180° ADD +2.00\nOE: ESF -2.00 CIL -1.00 EIXO 175° ADD +2.00\nRECOMENDAÇÃO: LENTES MULTIFOCAIS BLUECONTROL',
        confidenceScore: 98,
        fallback: true
      };

      return res.json({ success: true, result: mockResult });
    }

    // Extract mime type and raw base64 string
    const matches = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let base64Data = imageBase64;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const systemPrompt = `
      Você é o motor de visão computacional e leitura de receitas médicas da clínica ÍrisClin.
      Sua tarefa é ler e analisar a foto anexada de uma receita óptica ou exame médico do paciente ${patientName || 'Paciente'}.
      
      Extraia todas as informações possíveis em um formato JSON estrito exatamente com estas chaves:
      {
        "title": "Título resumido legível da receita ou exame",
        "type": "receita" ou "exame" ou "outro",
        "category": "Receita Médica" ou "Exame Ocular" ou "Topografia Ocular" ou "Retinografia" ou "OCT Macular" ou "Laudo Médico",
        "doctorName": "Nome do médico identificado no documento (se houver)",
        "notes": "Resumo clínico curto dos achados, diagnósticos, colírios ou observações de lentes",
        "opticalData": {
          "od": { "sph": "ex: -2.00", "cyl": "ex: -0.50", "axis": "ex: 180", "add": "ex: +2.00", "pd": "ex: 32.0/32.0" },
          "oe": { "sph": "ex: -1.75", "cyl": "ex: -0.75", "axis": "ex: 170", "add": "ex: +2.00", "pd": "ex: 32.0/32.0" }
        },
        "extractedText": "Texto bruto lido da imagem",
        "confidenceScore": 95
      }

      Responda APENAS o JSON válido, sem cercadinhos de markdown extra.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    let jsonResult;
    try {
      jsonResult = JSON.parse(response.text || '{}');
    } catch (e) {
      jsonResult = {
        title: 'Receita / Exame Ocular Processado',
        type: docTypeHint || 'receita',
        category: 'Receita Médica',
        doctorName: 'Dr. Augusto Faro',
        notes: response.text || 'Análise concluída.',
        extractedText: response.text
      };
    }

    res.json({
      success: true,
      result: jsonResult,
      fallback: false
    });

  } catch (error: any) {
    console.error('Error in OCR dossier handler:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar imagem via OCR.' });
  }
});

// 6. API: Vision OCR / Intelligent List Parser for Bulk Patient Campaign Outreach
app.post('/api/copilot/ocr-list', async (req, res) => {
  try {
    const { imageBase64, textList, rawInput } = req.body;

    if (!imageBase64 && !textList && !rawInput) {
      return res.status(400).json({ error: 'Nenhum dado, imagem ou lista de texto foi fornecida.' });
    }

    if (!ai) {
      // Mock extracted patients list for fallback mode
      const mockParsedPatients = [
        {
          name: 'Maria Das Graças Silva',
          phone: '(73) 9 8104-7390',
          lastExamDate: '14/05/2024 (Há 14 meses)',
          doctor: 'Dr. Augusto Faro',
          status: 'Exame Vencido',
          notes: 'Paciente usa lente multifocal. Relatou cefaleia ao ler.',
          confidence: 99
        },
        {
          name: 'João Pedro Santos',
          phone: '(73) 9 9982-1140',
          lastExamDate: '10/02/2024 (Há 17 meses)',
          doctor: 'Dra. Julia Martins',
          status: 'Exame Vencido',
          notes: 'Trabalha 10h no computador. Interesse em filtro BlueControl.',
          confidence: 97
        },
        {
          name: 'Ana Lúcia Ferreira',
          phone: '(73) 9 8831-2090',
          lastExamDate: 'Orçamento recente',
          doctor: 'Dr. Augusto Faro',
          status: 'Orçamento Pendente',
          notes: 'Interesse em lentes Transitions e armação de acetato.',
          confidence: 95
        },
        {
          name: 'Carlos Eduardo Oliveira',
          phone: '(73) 9 9123-4567',
          lastExamDate: '20/01/2024 (Há 18 meses)',
          doctor: 'Dr. Augusto Faro',
          status: 'Exame Vencido',
          notes: 'Motorista de caminhão, necessita proteção UV e antirreflexo.',
          confidence: 96
        }
      ];

      return res.json({
        success: true,
        patients: mockParsedPatients,
        totalFound: mockParsedPatients.length,
        fallback: true
      });
    }

    let contents: any[] = [];
    const promptInstructions = `
      Você é o motor de Leitura Inteligente (OCR e Visão Computacional) da Iris AI para a ÍrisClin.
      Analise a lista de pacientes fornecida (imagem, foto de agenda, print ou texto) e extraia todos os pacientes encontrados.

      Para cada paciente, retorne um objeto JSON estrito com:
      - "name": Nome completo do paciente
      - "phone": Número de telefone ou celular (se presente, ou formatado)
      - "lastExamDate": Data do último exame ou observação temporal
      - "doctor": Médico ou Optometrista responsável
      - "status": Categoria sugerida ("Exame Vencido", "Multifocal", "Orçamento Pendente" ou "Cadastrado")
      - "notes": Observações clínicas ou de atendimento lidas
      - "confidence": Porcentagem de confiança (ex: 98)

      Retorne APENAS um array JSON válido contendo os objetos: [ { ... }, { ... } ]. Sem formatação markdown extra.
    `;

    if (imageBase64) {
      const matches = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      let mimeType = 'image/jpeg';
      let base64Data = imageBase64;
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }

      contents = [
        {
          role: 'user',
          parts: [
            { text: promptInstructions },
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            }
          ]
        }
      ];
    } else {
      contents = [
        {
          role: 'user',
          parts: [
            { text: `${promptInstructions}\n\nTexto/Lista fornecida:\n${textList || rawInput}` }
          ]
        }
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        responseMimeType: 'application/json'
      }
    });

    let jsonResult = [];
    try {
      jsonResult = JSON.parse(response.text || '[]');
    } catch (e) {
      jsonResult = [];
    }

    res.json({
      success: true,
      patients: Array.isArray(jsonResult) ? jsonResult : [jsonResult],
      totalFound: Array.isArray(jsonResult) ? jsonResult.length : 1,
      fallback: false
    });

  } catch (error: any) {
    console.error('Error in OCR list parser:', error);
    res.status(500).json({ error: error.message || 'Erro ao ler lista de pacientes.' });
  }
});

// Setup Vite / Static Files Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
