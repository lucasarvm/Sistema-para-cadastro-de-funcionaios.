const $modal = document.querySelector('.modal-container');
const $tbody = document.querySelector('tbody');
const $form = document.querySelector('#employeeForm');
const $emptyState = document.querySelector('#emptyState');
const $contador = document.querySelector('#contador-funcionarios');

const $campos = {
  nome: document.querySelector('#modal-nome'),
  funcao: document.querySelector('#modal-funcao'),
  salario: document.querySelector('#modal-salario')
};

const $confirmDeleteModal = document.querySelector('#confirmDeleteModal');
const $confirmDeleteMessage = document.querySelector('#confirmDeleteMessage');
const $confirmDeleteButton = document.querySelector('#confirmDelete');
const $cancelDeleteButton = document.querySelector('#cancelDelete');
const $closeDeleteModalButton = document.querySelector('#closeDeleteModal');

let $itens = [];
let idEdicao = null;
let idExclusao = null;

/* ---------- Armazenamento ---------- */

function getItensBD() {
  try {
    return JSON.parse(localStorage.getItem('dbfunc')) ?? [];
  } catch {
    return [];
  }
}

function setItensBD() {
  localStorage.setItem('dbfunc', JSON.stringify($itens));
}

/* ---------- Utilitários ---------- */

function formatarSalario(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function criarCelula(texto) {
  const td = document.createElement('td');
  td.textContent = texto; // evita interpretar dados como HTML
  return td;
}

function criarBotaoAcao(icone, label, onClick, className = '') {
  const td = document.createElement('td');
  td.className = 'acao';
  const btn = document.createElement('button');
  btn.type = 'button';
  if (className) btn.className = className;
  btn.setAttribute('aria-label', label);
  btn.innerHTML = `<i class='bx ${icone}'></i>`;
  btn.addEventListener('click', onClick);
  td.appendChild(btn);
  return td;
}

/* ---------- Tabela ---------- */

function insertItem(item, index) {
  const tr = document.createElement('tr');
  tr.append(
    criarCelula(item.nome),
    criarCelula(item.funcao),
    criarCelula(formatarSalario(item.salario)),
    criarBotaoAcao('bx-edit-alt', 'Editar funcionário', () => openModal(true, index)),
    criarBotaoAcao('bx-trash', 'Excluir funcionário', () => deleteItem(index), 'delete-button')
  );
  $tbody.appendChild(tr);
}

function loadItens() {
  $itens = getItensBD();
  $tbody.innerHTML = '';
  $itens.forEach(insertItem);

  $emptyState?.classList.toggle('hidden', $itens.length > 0);
  if ($contador) $contador.textContent = $itens.length;
}

/* ---------- Modal de cadastro/edição ---------- */

function openModal(edit = false, index = 0) {
  $modal.classList.add('active');

  if (edit && $itens[index]) {
    const item = $itens[index];
    $campos.nome.value = item.nome;
    $campos.funcao.value = item.funcao;
    $campos.salario.value = item.salario;
    idEdicao = index;
  } else {
    $form.reset();
    idEdicao = null;
  }

  $campos.nome.focus();
}

function closeModal() {
  $modal.classList.remove('active');
  $form.reset();
  idEdicao = null;
}

$form.addEventListener('submit', (event) => {
  event.preventDefault();

  const nome = $campos.nome.value.trim();
  const funcao = $campos.funcao.value.trim();
  const salario = $campos.salario.value;

  if (!nome || !funcao || salario === '' || Number(salario) < 0) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  const funcionario = { nome, funcao, salario: Number(salario) };

  if (idEdicao !== null) {
    $itens[idEdicao] = funcionario;
  } else {
    $itens.push(funcionario);
  }

  setItensBD();
  closeModal();
  loadItens();
});

/* ---------- Modal de exclusão ---------- */

function deleteItem(index) {
  idExclusao = index;
  $confirmDeleteMessage.textContent =
    `Tem certeza de que deseja excluir o cadastro de ${$itens[index].nome}?`;
  $confirmDeleteModal.classList.add('active');
  $confirmDeleteButton.focus();
}

function closeDeleteModal() {
  $confirmDeleteModal.classList.remove('active');
  idExclusao = null;
}

function confirmDeleteItem() {
  if (idExclusao !== null && $itens[idExclusao]) {
    $itens.splice(idExclusao, 1);
    setItensBD();
    loadItens();
  }
  closeDeleteModal();
}

$confirmDeleteButton.addEventListener('click', confirmDeleteItem);
$cancelDeleteButton.addEventListener('click', closeDeleteModal);
$closeDeleteModalButton.addEventListener('click', closeDeleteModal);

/* ---------- Eventos gerais ---------- */

document.querySelectorAll('.adicionar, #novo-funcionario, #adicionar, .btn-adicionar')
  .forEach((btn) => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  }));

document.querySelectorAll('.fechar, .modal-close, .cancelar')
  .forEach((btn) => btn.addEventListener('click', closeModal));

$modal.addEventListener('click', (e) => {
  if (e.target === $modal) closeModal();
});

$confirmDeleteModal.addEventListener('click', (e) => {
  if (e.target === $confirmDeleteModal) closeDeleteModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if ($modal.classList.contains('active')) closeModal();
  if ($confirmDeleteModal.classList.contains('active')) closeDeleteModal();
});

// Permite usar onclick="openModal()" no HTML
window.openModal = openModal;
window.closeModal = closeModal;

loadItens();
