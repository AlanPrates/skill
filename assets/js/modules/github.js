/**
 * GitHub Repository Fetcher
 */

const GitHubManager = {
    username: 'AlanPrates',
    repos: [],
    displayedCount: 0,
    perPage: 6,

    init() {
        this.container = document.getElementById('projects-grid');
        this.loadMoreBtn = document.getElementById('load-more');

        if (this.container) {
            this.fetchRepos();
            this.bindEvents();
        }
    },

    async fetchRepos() {
        this.showLoading();

        try {
            const response = await fetch(
                `https://api.github.com/users/${this.username}/repos?sort=created&per_page=100`
            );

            if (!response.ok) throw new Error('Falha ao carregar repositórios');

            const data = await response.json();
            this.repos = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            this.displayRepos();
        } catch (error) {
            this.showError(error.message);
        }
    },

    displayRepos() {
        const toShow = this.repos.slice(this.displayedCount, this.displayedCount + this.perPage);

        if (this.displayedCount === 0) {
            this.container.innerHTML = '';
        }

        toShow.forEach((repo, index) => {
            const card = this.createCard(repo);
            card.style.animationDelay = `${index * 0.1}s`;
            this.container.appendChild(card);
        });

        this.displayedCount += toShow.length;
        this.updateLoadMoreButton();
    },

    createCard(repo) {
        const card = document.createElement('article');
        card.className = 'project-card fade-in-up';

        const date = new Date(repo.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        card.innerHTML = `
      <div class="project-card__header">
        <h3 class="project-card__title">${repo.name}</h3>
        <a href="${repo.html_url}" target="_blank" rel="noopener" class="project-card__link" title="Ver no GitHub">
          ↗
        </a>
      </div>
      <p class="project-card__date">Criado em ${date}</p>
    `;

        return card;
    },

    showLoading() {
        this.container.innerHTML = `
      <div class="loading">
        <div class="loading__spinner"></div>
        <span>Carregando projetos...</span>
      </div>
    `;
    },

    showError(message) {
        this.container.innerHTML = `
      <div class="loading">
        <span>❌ ${message}</span>
      </div>
    `;
    },

    updateLoadMoreButton() {
        if (this.loadMoreBtn) {
            this.loadMoreBtn.style.display =
                this.displayedCount >= this.repos.length ? 'none' : 'inline-flex';
        }
    },

    bindEvents() {
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => this.displayRepos());
        }
    }
};

export default GitHubManager;
