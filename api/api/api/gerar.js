export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { senha, produto, detalhes } = req.body;
    const SENHA_SECRETA = process.env.SENHA_CLIENTE || "VIP2024";

    if (senha !== SENHA_SECRETA) {
        return res.status(403).json({ error: 'Código de acesso incorreto!' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da IA não configurada no servidor.' });
    }

    const prompt = `Gere textos de vendas altamente persuasivos para: ${produto}. Detalhes: ${detalhes || 'Nenhum'}`;
    const systemInstruction = "Você é um Copywriter profissional especialista em conversão e vendas. Crie: 1) Título chamativo, 2) Legenda para Instagram com gancho, 3) Mensagem de WhatsApp com chamada para ação, 4) Hashtags recomendadas.";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!texto) return res.status(500).json({ error: 'Erro ao gerar conteúdo.' });

        return res.status(200).json({ resultado: texto });
    } catch (err) {
        return res.status(500).json({ error: 'Falha de conexão com a inteligência artificial.' });
    }
          }
