// Navegação entre abas
const navButtons = document.querySelectorAll('.nav-btn');
const tabViews = document.querySelectorAll('.tab-view');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        tabViews.forEach(v => v.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
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
        q: "Em Tangará da Serra, onde podemos encaminhar pequenos volumes de e-lixo?",
        options: ["Em qualquer terreno baldio", "Nos Ecopontos / SAMAE ou pontos de coleta parceiros", "No ralo da pia", "Junto com o lixo orgânico"],
        answer: 1,
        exp: "Os pontos oficiais garantem a triagem e a destinação ambientalmente adequada."
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
    allBtns.forEach(b => b.disabled = true);

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

// Registro de Descarte (LocalStorage para demonstração imediata)
const form = document.getElementById('discard-form');
const totalRegEl = document.getElementById('total-registros');
const totalPecasEl = document.getElementById('total-pecas');

function updateStats() {
    const stats = JSON.parse(localStorage.getItem('ecotech_stats') || '{"registros": 12, "pecas": 38}');
    totalRegEl.textContent = stats.registros;
    totalPecasEl.textContent = stats.pecas;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const qtd = parseInt(document.getElementById('qtd').value, 10) || 1;
    const stats = JSON.parse(localStorage.getItem('ecotech_stats') || '{"registros": 12, "pecas": 38}');
    stats.registros += 1;
    stats.pecas += qtd;
    localStorage.setItem('ecotech_stats', JSON.stringify(stats));
    updateStats();
    form.reset();
    alert('Descarte registrado com sucesso! Obrigado por contribuir com Tangará da Serra.');
});

updateStats();

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