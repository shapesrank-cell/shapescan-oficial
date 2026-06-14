import { spawnSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, '.env');
  if (!existsSync(envPath)) {
    console.error('❌ Arquivo .env não encontrado.');
    console.error('   Copie .env.example para .env e preencha os valores.');
    process.exit(1);
  }
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = value;
  }
}

loadEnv();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_CHAT_ID = process.env.TELEGRAM_ALLOWED_CHAT_ID;
const PROJECT_DIR = process.env.PROJECT_DIR ?? 'C:\\Users\\cauer\\shapescan-projeto';

if (!BOT_TOKEN || !ALLOWED_CHAT_ID) {
  console.error('❌ TELEGRAM_BOT_TOKEN e TELEGRAM_ALLOWED_CHAT_ID são obrigatórios no .env');
  process.exit(1);
}

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Estado da conversa
const state = {
  status: 'idle', // 'idle' | 'awaiting_approval'
  pendingInstruction: null,
};

async function tgPost(method, body) {
  const res = await fetch(`${API_BASE}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function sendMessage(chatId, text) {
  const MAX = 4096;
  for (let i = 0; i < text.length; i += MAX) {
    await tgPost('sendMessage', { chat_id: chatId, text: text.slice(i, i + MAX) });
  }
}

function runClaude(prompt, skipPermissions = false) {
  const args = ['--print', '-p', prompt];
  if (skipPermissions) args.push('--dangerously-skip-permissions');

  const result = spawnSync('claude', args, {
    cwd: PROJECT_DIR,
    timeout: 300_000,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
    shell: process.platform === 'win32',
    windowsHide: true,
  });

  if (result.error) throw result.error;

  const out = (result.stdout ?? '').trim();
  const err = (result.stderr ?? '').trim();

  if (!out && !err) return '✅ Concluído (sem saída de texto).';
  if (!out) return err;
  return out;
}

const APPROVAL_WORDS = new Set(['sim', 's', 'yes', 'y', 'ok', 'pode', 'executa', 'confirma', '👍']);
const REJECTION_WORDS = new Set(['não', 'nao', 'n', 'no', 'cancela', 'cancelar', 'para', '👎']);

async function handleMessage(chatId, text) {
  const lower = text.toLowerCase().trim();

  // Comandos especiais
  if (lower === '/start' || lower === '/ping') {
    await sendMessage(chatId, '✅ Bridge ativo! Mande sua instrução para o Claude Code.');
    return;
  }

  if (lower === '/cancelar' || lower === '/status') {
    if (state.status === 'awaiting_approval') {
      state.status = 'idle';
      state.pendingInstruction = null;
      await sendMessage(chatId, '❌ Instrução cancelada.');
    } else {
      await sendMessage(chatId, 'ℹ️ Nenhuma instrução pendente.');
    }
    return;
  }

  // Aguardando aprovação
  if (state.status === 'awaiting_approval') {
    if (APPROVAL_WORDS.has(lower)) {
      const instruction = state.pendingInstruction;
      state.status = 'idle';
      state.pendingInstruction = null;

      await sendMessage(chatId, '⚙️ Executando...');
      console.log(`▶️ Executando: ${instruction}`);

      try {
        const result = runClaude(instruction, true);
        console.log('✅ Concluído.');
        await sendMessage(chatId, `✅ Feito!\n\n${result}`);
      } catch (err) {
        await sendMessage(chatId, `❌ Erro: ${err.message}`);
      }
      return;
    }

    if (REJECTION_WORDS.has(lower)) {
      state.status = 'idle';
      state.pendingInstruction = null;
      await sendMessage(chatId, '❌ Cancelado.');
      return;
    }

    // Mensagem que não é sim/não → trata como nova instrução
    state.status = 'idle';
    state.pendingInstruction = null;
  }

  // Nova instrução — pedir plano primeiro
  const instruction = text.trim();
  const preview = instruction.length > 80 ? instruction.slice(0, 80) + '...' : instruction;
  console.log(`📨 Nova instrução: ${preview}`);

  await sendMessage(chatId, `🔍 Analisando o que precisa ser feito...`);

  const planPrompt = `Analise esta instrução e descreva o plano de execução de forma clara e objetiva. Liste os arquivos que serão criados ou modificados e o que mudará em cada um. Não execute nada ainda, apenas descreva o plano.

Instrução: ${instruction}`;

  try {
    const plan = runClaude(planPrompt);
    state.status = 'awaiting_approval';
    state.pendingInstruction = instruction;

    await sendMessage(
      chatId,
      `📋 Plano de execução:\n\n${plan}\n\n─────────────────\nResponda:\n✅ sim — para executar\n❌ não — para cancelar`,
    );
  } catch (err) {
    await sendMessage(chatId, `❌ Erro ao analisar: ${err.message}`);
  }
}

let offset = 0;

async function getUpdates() {
  const res = await fetch(`${API_BASE}/getUpdates?offset=${offset}&timeout=30`);
  const data = await res.json();
  return data.result ?? [];
}

async function main() {
  console.log('🤖 Bridge Telegram → Claude Code iniciado!');
  console.log(`📁 Projeto: ${PROJECT_DIR}`);
  console.log('📱 Aguardando mensagens no Telegram...\n');

  while (true) {
    try {
      const updates = await getUpdates();

      for (const update of updates) {
        offset = update.update_id + 1;

        const msg = update.message;
        if (!msg?.text) continue;

        const chatId = String(msg.chat.id);

        if (chatId !== ALLOWED_CHAT_ID) {
          await sendMessage(chatId, '⛔ Não autorizado.');
          continue;
        }

        await handleMessage(chatId, msg.text);
      }
    } catch (err) {
      console.error(`⚠️ Erro no loop: ${err.message}`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

main();
