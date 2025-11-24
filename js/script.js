const ul = document.querySelector('ul');
const loadMoreButton = document.querySelector('#load-more');

// Verificar se os elementos existem
if (!ul) {
  console.error('Elemento <ul> não encontrado!');
}
if (!loadMoreButton) {
  console.error('Botão #load-more não encontrado!');
}

let repoList = [];
let displayedRepos = 0;

function getRepoList(username) {
  fetch(`https://api.github.com/users/${username}/repos`, {
    headers: {
      'Authorization': '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' // Gere em: github.com/settings/tokens
    }
  })
  .then(res => res.json())
  .then(data => {
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    repoList = data;
    displayRepos(12);
  })
  .catch(e => console.error('Erro:', e));
}


function displayRepos(quantity) {
  const reposToShow = repoList.slice(displayedRepos, displayedRepos + quantity);
  
  console.log('Exibindo repositórios:', reposToShow.length);

  reposToShow.forEach(repo => {
    const li = document.createElement('li');

    const repoName = document.createElement('strong');
    repoName.textContent = repo.name.toUpperCase();
    li.appendChild(repoName);

    const repoUrl = document.createElement('a');
    repoUrl.href = repo.html_url;
    repoUrl.textContent = getShortLink(repo.html_url);
    repoUrl.style.color = '#97c5e9';
    repoUrl.target = '_blank';
    li.appendChild(repoUrl);

    const repoDate = document.createElement('span');
    repoDate.textContent = `Data de Criação: ${new Date(repo.created_at).toLocaleString('pt-BR')}`;
    li.appendChild(repoDate);

    ul.appendChild(li);
  });

  displayedRepos += quantity;

  // Controlar visibilidade do botão
  if (displayedRepos >= repoList.length) {
    loadMoreButton.style.display = 'none';
  } else {
    loadMoreButton.style.display = 'block';
  }
  
  console.log(`Exibidos ${displayedRepos} de ${repoList.length} repositórios`);
}

function getShortLink(url) {
  return url.replace('https://github.com/', '');
}

// Iniciar carregamento
getRepoList('AlanPrates');

// Event listener do botão
if (loadMoreButton) {
  loadMoreButton.addEventListener('click', () => {
    displayRepos(12);
  });
}
