// Flashcard Management - WITH EDIT/DELETE
class CardManager {
  constructor(storageManager) {
    this.storage = storageManager;
    this.cardsGrid = document.getElementById("cardsGrid");
    this.languageFilter = document.getElementById("languageFilter");
    this.chapterFilter = document.getElementById("chapterFilter");
    this.currentEditCardId = null;

    this.initializeEventListeners();
    this.loadChapters();
    this.renderCards();
  }

  initializeEventListeners() {
    this.languageFilter.addEventListener("change", () =>
      this.handleFilterChange()
    );
    this.chapterFilter.addEventListener("change", () =>
      this.handleFilterChange()
    );

    // Edit modal events
    document
      .getElementById("editCardForm")
      .addEventListener("submit", (e) => this.handleEditFormSubmit(e));
    document
      .getElementById("deleteCardBtn")
      .addEventListener("click", () => this.openDeleteConfirmation());
    document
      .getElementById("confirmDeleteBtn")
      .addEventListener("click", () => this.confirmDelete());
  }

  handleFilterChange() {
    this.renderCards();
  }

  loadChapters() {
    const chapters = this.storage.getChapters();
    const chapterFilter = this.chapterFilter;

    while (chapterFilter.children.length > 1) {
      chapterFilter.removeChild(chapterFilter.lastChild);
    }

    const selectedLanguage = this.languageFilter.value;
    if (selectedLanguage !== "all" && chapters[selectedLanguage]) {
      chapters[selectedLanguage].forEach((chapter) => {
        const option = document.createElement("option");
        option.value = chapter;
        option.textContent = chapter;
        chapterFilter.appendChild(option);
      });
    }
  }

  renderCards() {
    const languageFilter = this.languageFilter.value;
    const chapterFilter = this.chapterFilter.value;

    const filteredCards = this.storage.getFilteredCards(
      languageFilter,
      chapterFilter
    );

    this.cardsGrid.innerHTML = "";

    if (filteredCards.length === 0) {
      this.cardsGrid.innerHTML = `
                <div class="no-cards">
                    <h3>📝 Tidak ada kartu yang ditemukan</h3>
                    <p>Tambahkan kartu baru atau ubah filter pencarian</p>
                </div>
            `;
      return;
    }

    filteredCards.forEach((card) => {
      const cardElement = this.createCardElement(card);
      this.cardsGrid.appendChild(cardElement);
    });

    if (typeof hljs !== "undefined") {
      document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
      });
    }
  }

  createCardElement(card) {
    const cardDiv = document.createElement("div");
    cardDiv.className = "flashcard";
    cardDiv.setAttribute("data-card-id", card.id);
    cardDiv.innerHTML = `
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <div class="language-badge">${card.language}</div>
                    <div class="chapter-badge">${card.chapter}</div>
                    <div class="card-content">
                        <div class="card-question">${card.question}</div>
                    </div>
                    <div class="card-actions">
                        <button class="btn-action btn-edit" data-card-id="${
                          card.id
                        }">✏️ Edit</button>
                        <button class="btn-action btn-delete" data-card-id="${
                          card.id
                        }">🗑️ Hapus</button>
                    </div>
                    <div class="card-hint">👆 Klik untuk melihat jawaban</div>
                </div>
                <div class="flashcard-back">
                    <div class="code-container">
                        <pre><code class="language-${
                          card.language
                        }">${this.escapeHtml(card.code)}</code></pre>
                    </div>
                    <div class="explanation">
                        ${this.escapeHtml(card.explanation)}
                    </div>
                    <div class="card-actions">
                        <button class="btn-action btn-edit" data-card-id="${
                          card.id
                        }">✏️ Edit</button>
                        <button class="btn-action btn-delete" data-card-id="${
                          card.id
                        }">🗑️ Hapus</button>
                    </div>
                    <div class="card-hint">👆 Klik untuk kembali</div>
                </div>
            </div>
        `;

    // Flip functionality
    cardDiv.addEventListener("click", (e) => {
      if (!e.target.classList.contains("btn-action")) {
        cardDiv.classList.toggle("flipped");
      }
    });

    // Edit and Delete buttons
    const editButtons = cardDiv.querySelectorAll(".btn-edit");
    const deleteButtons = cardDiv.querySelectorAll(".btn-delete");

    editButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.editCard(card.id);
      });
    });

    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openDeleteConfirmation(card.id);
      });
    });

    return cardDiv;
  }

  editCard(cardId) {
    const cards = this.storage.getFlashcards();
    const card = cards.find((c) => c.id === cardId);

    if (card) {
      this.currentEditCardId = cardId;

      // Fill edit form
      document.getElementById("editCardId").value = cardId;
      document.getElementById("editCardLanguage").value = card.language;
      document.getElementById("editCardChapter").value = card.chapter;
      document.getElementById("editCardQuestion").value = card.question;
      document.getElementById("editCardCode").value = card.code;
      document.getElementById("editCardExplanation").value = card.explanation;

      // Show edit modal
      document.getElementById("editCardModal").classList.add("show");
    }
  }

  handleEditFormSubmit(e) {
    e.preventDefault();

    const cardData = {
      language: document.getElementById("editCardLanguage").value,
      chapter: document.getElementById("editCardChapter").value,
      question: document.getElementById("editCardQuestion").value,
      code: document.getElementById("editCardCode").value,
      explanation: document.getElementById("editCardExplanation").value,
    };

    if (this.currentEditCardId) {
      const updatedCard = this.storage.updateFlashcard(
        this.currentEditCardId,
        cardData
      );
      if (updatedCard) {
        this.showNotification("Kartu berhasil diperbarui!", "success");
        this.closeEditModal();
        this.renderCards();
      }
    }
  }

  openDeleteConfirmation(cardId = null) {
    if (cardId) {
      this.currentEditCardId = cardId;
    }

    if (this.currentEditCardId) {
      document.getElementById("confirmDeleteModal").classList.add("show");
    }
  }

  confirmDelete() {
    if (this.currentEditCardId) {
      this.storage.deleteFlashcard(this.currentEditCardId);
      this.showNotification("Kartu berhasil dihapus!", "success");
      this.closeDeleteModal();
      this.closeEditModal();
      this.renderCards();
      this.currentEditCardId = null;
    }
  }

  closeEditModal() {
    document.getElementById("editCardModal").classList.remove("show");
    this.currentEditCardId = null;
  }

  closeDeleteModal() {
    document.getElementById("confirmDeleteModal").classList.remove("show");
  }

  addNewCard(cardData) {
    const newCard = this.storage.saveFlashcard(cardData);
    this.storage.saveChapter(cardData.language, cardData.chapter);
    this.loadChapters();
    this.renderCards();
    return newCard;
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

    if (!document.querySelector("#notification-styles")) {
      const styles = document.createElement("style");
      styles.id = "notification-styles";
      styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #27ae60;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    z-index: 1001;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.3s ease;
                }
                .notification-error { background: #e74c3c; }
                .notification-warning { background: #f39c12; }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);

    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        notification.parentNode.removeChild(notification);
      });
  }

  // Public method to refresh chapters
  refreshChapters() {
    this.loadChapters();
    this.renderCards();
  }
}
