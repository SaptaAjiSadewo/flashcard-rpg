// Local Storage Management
class StorageManager {
  constructor() {
    this.storageKey = "codecards_flashcards";
    this.chaptersKey = "codecards_chapters";
  }

  // Flashcard methods
  getFlashcards() {
    const cards = localStorage.getItem(this.storageKey);
    return cards ? JSON.parse(cards) : [];
  }

  saveFlashcard(card) {
    const cards = this.getFlashcards();
    const newCard = {
      id: this.generateId(),
      ...card,
      createdAt: new Date().toISOString(),
    };
    cards.push(newCard);
    localStorage.setItem(this.storageKey, JSON.stringify(cards));
    return newCard;
  }

  updateFlashcard(id, updatedCard) {
    const cards = this.getFlashcards();
    const index = cards.findIndex((card) => card.id === id);
    if (index !== -1) {
      cards[index] = {
        ...cards[index],
        ...updatedCard,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(cards));
      return cards[index];
    }
    return null;
  }

  deleteFlashcard(id) {
    const cards = this.getFlashcards();
    const filteredCards = cards.filter((card) => card.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filteredCards));
    return filteredCards;
  }

  // Chapter methods
  getChapters() {
    const chapters = localStorage.getItem(this.chaptersKey);
    return chapters ? JSON.parse(chapters) : {};
  }

  saveChapter(language, chapter) {
    const chapters = this.getChapters();
    if (!chapters[language]) {
      chapters[language] = [];
    }
    if (!chapters[language].includes(chapter)) {
      chapters[language].push(chapter);
      localStorage.setItem(this.chaptersKey, JSON.stringify(chapters));
    }
    return chapters;
  }

  // Utility methods
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getFilteredCards(languageFilter = "all", chapterFilter = "all") {
    const cards = this.getFlashcards();

    return cards.filter((card) => {
      const languageMatch =
        languageFilter === "all" || card.language === languageFilter;
      const chapterMatch =
        chapterFilter === "all" || card.chapter === chapterFilter;

      return languageMatch && chapterMatch;
    });
  }

  // Initialize with sample data if empty
  initializeSampleData() {
    const cards = this.getFlashcards();
    if (cards.length === 0) {
      const sampleCards = [
        {
          language: "javascript",
          chapter: "Variabel",
          question: "Apa perbedaan antara let, const, dan var?",
          code: `// let bisa diubah nilainya
let name = "John";
name = "Doe";

// const nilai tetap
const pi = 3.14;

// var (hindari penggunaannya)
var old = "old way";`,
          explanation:
            "let untuk variabel yang bisa diubah, const untuk nilai tetap, dan var adalah cara lama dengan function scope.",
        },
        {
          language: "html",
          chapter: "Struktur Dasar",
          question: "Bagaimana struktur dasar HTML5?",
          code: `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello World!</h1>
</body>
</html>`,
          explanation:
            "Struktur dasar HTML5 terdiri dari doctype, html, head (metadata), dan body (konten).",
        },
        {
          language: "css",
          chapter: "Flexbox",
          question: "Bagaimana cara membuat layout flexbox yang responsif?",
          code: `.container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.item {
    flex: 1 1 200px;
    min-width: 150px;
}`,
          explanation:
            "Flexbox memungkinkan layout yang fleksibel dengan properti seperti justify-content, align-items, dan flex-wrap.",
        },
      ];

      sampleCards.forEach((card) => {
        this.saveFlashcard(card);
        this.saveChapter(card.language, card.chapter);
      });
    }
  }
}
