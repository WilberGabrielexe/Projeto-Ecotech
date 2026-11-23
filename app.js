// Cole aqui a URL gerada no Google Apps Script (terminada em /exec)
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbyVTZ4cJou_Ewlf6inJYzIhCHweU7HN-sXzA4SWSY4LX57hU9tX_LOWfz5EiU9DQX0PxQ/exec";

// Navegação entre abas
const navButtons = document.querySelectorAll('.nav-btn');
const tabViews = document.querySelectorAll('.tab-view');

navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;

        navButtons.forEach((b) => b.classList.remove('active'));
        tabViews.forEach((v) => v.classList.remove('active'));

        btn.classList.add('active');
        targetSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Quiz Educativo
const questions = [
    {
        q: "Qual destes itens é considerado lixo eletrônico (e-lixo)?",
        options: ["Casca de banana", "Carregador de celular estragado", "Garrafa PET", "Papelão molhado"],
        answer: 1,
        exp: "Cabos, carregadores, pilhas e aparelhos eletrônicos são resíduos eletroeletrônicos."
    },
    {
        q: "Por que pilhas e baterias não devem ir para o lixo comum?",
        options: ["Porque ocupam muito espaço", "Porque contêm metais pesados que contaminam o solo e a água", "Porque são feitas de papel", "Porque derretem no caminhão"],
        answer: 1,
        exp: "Metais como chumbo, mercúrio e cádmio vazam e contaminam lençóis freáticos."
    },
    {
        q: "O que você deve fazer antes de descartar um celular ou notebook antigo?",
        options: ["Quebrar a tela com martelo", "Apagar seus dados pessoais e remover o chip/cartão SD", "Jogar na água", "Queimar a bateria"],
        answer: 1,
        exp: "Fazer backup e restaurar as configurações de fábrica protege sua privacidade."
    },
    {
        q: "Qual material valioso pode ser recuperado na reciclagem de placas eletrônicas?",
        options: ["Ouro e Cobre", "Madeira", "Algodão", "Vidro temperado"],
        answer: 0,
        exp: "Placas de circuito contêm ouro, prata, cobre e alumínio que voltam para a indústria."
    },
    {
        q: "Em Tangará da Serra, onde podemos encaminhar resíduos eletrônicos para destinação correta?",
        options: ["Em qualquer terreno baldio", "Na COOPERTAN, nos Ecopontos do SAMAE ou pontos parceiros", "No ralo da pia", "Junto com o lixo orgânico"],
        answer: 1,
        exp: "Os pontos oficiais e cooperativas garantem a triagem e a destinação ambientalmente adequada."
    }
];

let currentQ = 0;
let score = 0;

const qProgress = document.getElementById('quiz-progress');
const qText = document.getElementById('quiz-question');
const qOptions = document.getElementById('quiz-options');
const qFeedback = document.getElementById('quiz-feedback');
const btnNext = document.getElementById('btn-next-question');
const quizContainer = document.getElementById('quiz-container');
const quizResult = document.getElementById('quiz-result');

function loadQuestion() {
    const item = questions[currentQ];
    qProgress.textContent = `Pergunta ${currentQ + 1} de ${questions.length}`;
    qText.textContent = item.q;
    qOptions.innerHTML = '';
    qFeedback.classList.add('hidden');
    btnNext.classList.add('hidden');

    item.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => selectAnswer(idx, btn);
        qOptions.appendChild(btn);
    });
}

function selectAnswer(idx, btnSelected) {
    const item = questions[currentQ];
    const allBtns = qOptions.querySelectorAll('.option-btn');
    allBtns.forEach((b) => (b.disabled = true));

    if (idx === item.answer) {
        btnSelected.classList.add('correct');
        score++;
        qFeedback.textContent = "✅ Correto! " + item.exp;
    } else {
        btnSelected.classList.add('wrong');
        allBtns[item.answer].classList.add('correct');
        qFeedback.textContent = "❌ Atenção: " + item.exp;
    }

    qFeedback.classList.remove('hidden');
    btnNext.classList.remove('hidden');
}

btnNext.addEventListener('click', () => {
    currentQ++;
    if (currentQ < questions.length) {
        loadQuestion();
    } else {
        quizContainer.classList.add('hidden');
        quizResult.classList.remove('hidden');
        document.getElementById('quiz-score-text').textContent =
            `Você acertou ${score} de ${questions.length} perguntas sobre descarte sustentável!`;
    }
});

document.getElementById('btn-restart-quiz').addEventListener('click', () => {
    currentQ = 0;
    score = 0;
    quizResult.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    loadQuestion();
});

loadQuestion();

// Registro de Descarte + Sincronização com Google Sheets
const form = document.getElementById('discard-form');
const totalRegEl = document.getElementById('total-registros');
const totalPecasEl = document.getElementById('total-pecas');

function renderStats(registros, pecas) {
    totalRegEl.textContent = registros;
    totalPecasEl.textContent = pecas;
}

async function loadStats() {
    const localStats = JSON.parse(localStorage.getItem('ecotech_stats') || '{"registros": 0, "pecas": 0}');
    renderStats(localStats.registros, localStats.pecas);

    if (!GOOGLE_SHEETS_URL.startsWith("https://")) return;

    try {
        const res = await fetch(GOOGLE_SHEETS_URL);
        const data = await res.json();
        if (typeof data.registros === "number") {
            localStorage.setItem('ecotech_stats', JSON.stringify(data));
            renderStats(data.registros, data.pecas);
        }
    } catch (err) {
        // Mantém os dados locais caso esteja offline
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btnSubmit = form.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Enviando registro...";

    const bairro = document.getElementById('bairro').value.trim();
    const qtd = parseInt(document.getElementById('qtd').value, 10) || 1;
    const itensMarcados = Array.from(document.querySelectorAll('input[name="item"]:checked'))
        .map((el) => el.value);
    const itens = itensMarcados.length > 0 ? itensMarcados.join(", ") : "Não especificado";

    if (GOOGLE_SHEETS_URL.startsWith("https://")) {
        try {
            await fetch(GOOGLE_SHEETS_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ bairro, itens, qtd })
            });
        } catch (err) {
            console.error("Erro ao enviar para planilha:", err);
        }
    }

    const stats = JSON.parse(localStorage.getItem('ecotech_stats') || '{"registros": 0, "pecas": 0}');
    stats.registros += 1;
    stats.pecas += qtd;
    localStorage.setItem('ecotech_stats', JSON.stringify(stats));
    renderStats(stats.registros, stats.pecas);

    form.reset();
    btnSubmit.disabled = false;
    btnSubmit.textContent = textoOriginal;
    alert('Descarte registrado com sucesso na planilha do Projeto EcoTech!');
});

loadStats();

// PWA Service Worker & Instalação
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

let deferredPrompt;
const btnInstall = document.getElementById('btnInstall');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    btnInstall.classList.remove('hidden');
});

btnInstall.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    btnInstall.classList.add('hidden');
});