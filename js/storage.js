// Local Storage Management - DIPERBAIKI
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

  // Chapter methods - DIPERBAIKI
  getChapters() {
    const chapters = localStorage.getItem(this.chaptersKey);
    if (chapters) {
      try {
        return JSON.parse(chapters);
      } catch (error) {
        console.error("Error parsing chapters:", error);
        return this.initializeDefaultChapters();
      }
    }
    return this.initializeDefaultChapters();
  }

  initializeDefaultChapters() {
    const defaultChapters = {
      javascript: [
        {
          id: "js-variables",
          name: "Variabel",
          description: "Konsep variabel dan tipe data dalam JavaScript",
          language: "javascript",
          createdAt: new Date().toISOString(),
        },
        {
          id: "js-functions",
          name: "Fungsi",
          description: "Pembuatan dan penggunaan fungsi dalam JavaScript",
          language: "javascript",
          createdAt: new Date().toISOString(),
        },
      ],
      html: [
        {
          id: "html-structure",
          name: "Struktur Dasar",
          description: "Dasar-dasar struktur dokumen HTML",
          language: "html",
          createdAt: new Date().toISOString(),
        },
        {
          id: "html-forms",
          name: "Formulir",
          description: "Pembuatan formulir HTML",
          language: "html",
          createdAt: new Date().toISOString(),
        },
      ],
      css: [
        {
          id: "css-flexbox",
          name: "Flexbox",
          description: "Layout fleksibel dengan CSS Flexbox",
          language: "css",
          createdAt: new Date().toISOString(),
        },
        {
          id: "css-grid",
          name: "Grid",
          description: "Layout dengan CSS Grid",
          language: "css",
          createdAt: new Date().toISOString(),
        },
      ],
      php: [
        {
          id: "php-basics",
          name: "Dasar PHP",
          description: "Pengenalan pemrograman server-side dengan PHP",
          language: "php",
          createdAt: new Date().toISOString(),
        },
      ],
    };

    try {
      localStorage.setItem(this.chaptersKey, JSON.stringify(defaultChapters));
    } catch (error) {
      console.error("Error saving default chapters:", error);
    }

    return defaultChapters;
  }

  saveChapter(chapterData) {
    const chapters = this.getChapters();
    const newChapter = {
      id: this.generateId(),
      ...chapterData,
      createdAt: new Date().toISOString(),
    };

    // Pastikan language key ada
    if (!chapters[chapterData.language]) {
      chapters[chapterData.language] = [];
    }

    // Validasi data chapter
    if (!newChapter.name || !newChapter.description) {
      console.error("Chapter data is incomplete:", newChapter);
      return null;
    }

    // Cek apakah chapter dengan nama yang sama sudah ada
    const existingChapter = chapters[chapterData.language].find(
      (ch) => ch.name.toLowerCase() === chapterData.name.toLowerCase()
    );

    if (existingChapter) {
      return existingChapter;
    }

    chapters[chapterData.language].push(newChapter);

    try {
      localStorage.setItem(this.chaptersKey, JSON.stringify(chapters));
      return newChapter;
    } catch (error) {
      console.error("Error saving chapter:", error);
      return null;
    }
  }

  updateChapter(chapterId, updatedChapter) {
    const chapters = this.getChapters();

    // Validasi data
    if (!updatedChapter.name || !updatedChapter.description) {
      console.error("Updated chapter data is incomplete:", updatedChapter);
      return null;
    }

    for (const language in chapters) {
      const chapterIndex = chapters[language].findIndex(
        (ch) => ch.id === chapterId
      );
      if (chapterIndex !== -1) {
        // Jika language berubah, pindahkan chapter ke array language yang baru
        if (updatedChapter.language && updatedChapter.language !== language) {
          const movedChapter = chapters[language].splice(chapterIndex, 1)[0];
          movedChapter.language = updatedChapter.language;
          movedChapter.updatedAt = new Date().toISOString();

          if (!chapters[updatedChapter.language]) {
            chapters[updatedChapter.language] = [];
          }
          chapters[updatedChapter.language].push(movedChapter);
        } else {
          // Update chapter di tempat yang sama
          chapters[language][chapterIndex] = {
            ...chapters[language][chapterIndex],
            ...updatedChapter,
            updatedAt: new Date().toISOString(),
          };
        }

        try {
          localStorage.setItem(this.chaptersKey, JSON.stringify(chapters));
          return chapters[updatedChapter.language || language].find(
            (ch) => ch.id === chapterId
          );
        } catch (error) {
          console.error("Error updating chapter:", error);
          return null;
        }
      }
    }
    return null;
  }

  deleteChapter(chapterId) {
    const chapters = this.getChapters();
    let deletedChapter = null;

    for (const language in chapters) {
      const chapterIndex = chapters[language].findIndex(
        (ch) => ch.id === chapterId
      );
      if (chapterIndex !== -1) {
        deletedChapter = chapters[language][chapterIndex];
        chapters[language].splice(chapterIndex, 1);

        // Also delete all flashcards in this chapter
        this.deleteFlashcardsByChapter(language, deletedChapter.name);

        try {
          localStorage.setItem(this.chaptersKey, JSON.stringify(chapters));
          break;
        } catch (error) {
          console.error("Error deleting chapter:", error);
          return null;
        }
      }
    }
    return deletedChapter;
  }

  deleteFlashcardsByChapter(language, chapterName) {
    const cards = this.getFlashcards();
    const filteredCards = cards.filter(
      (card) => !(card.language === language && card.chapter === chapterName)
    );
    localStorage.setItem(this.storageKey, JSON.stringify(filteredCards));
    return filteredCards;
  }

  getChaptersByLanguage(language) {
    const chapters = this.getChapters();
    return chapters[language] || [];
  }

  getChapterById(chapterId) {
    const chapters = this.getChapters();
    for (const language in chapters) {
      const chapter = chapters[language].find((ch) => {
        // Pastikan chapter ada dan memiliki property yang diperlukan
        return ch && ch.id === chapterId;
      });
      if (chapter) return chapter;
    }
    return null;
  }

  getChapterByName(language, chapterName) {
    const chapters = this.getChapters();
    if (chapters[language]) {
      return chapters[language].find((ch) => ch && ch.name === chapterName);
    }
    return null;
  }

  getFlashcardsByChapter(language, chapterName) {
    const cards = this.getFlashcards();
    return cards.filter(
      (card) => card.language === language && card.chapter === chapterName
    );
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

  // Initialize with sample data if empty - DIPERBAIKI
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
          language: "javascript",
          chapter: "Fungsi",
          question: "Bagaimana cara membuat arrow function?",
          code: `// Function biasa
function regularFunction(a, b) {
    return a + b;
}

// Arrow function
const arrowFunction = (a, b) => {
    return a + b;
};

// Arrow function dengan return implisit
const implicitReturn = (a, b) => a + b;`,
          explanation:
            "Arrow function adalah sintaks modern JavaScript yang lebih ringkas dan tidak memiliki binding 'this' sendiri.",
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
      });
    }

    // Pastikan chapters juga terinisialisasi
    this.getChapters();
  }

  // Method untuk membersihkan data yang rusak
  cleanupCorruptedData() {
    try {
      const chapters = this.getChapters();
      let hasCorruption = false;

      for (const language in chapters) {
        chapters[language] = chapters[language].filter(
          (chapter) =>
            chapter &&
            chapter.id &&
            chapter.name &&
            chapter.description &&
            chapter.language
        );

        // Validasi setiap chapter
        chapters[language].forEach((chapter) => {
          if (!chapter.name || chapter.name === "undefined") {
            chapter.name = "Bab Tanpa Nama";
            hasCorruption = true;
          }
          if (!chapter.description || chapter.description === "undefined") {
            chapter.description = "Deskripsi tidak tersedia";
            hasCorruption = true;
          }
        });
      }

      if (hasCorruption) {
        localStorage.setItem(this.chaptersKey, JSON.stringify(chapters));
      }

      return chapters;
    } catch (error) {
      console.error("Error cleaning up data:", error);
      return this.initializeDefaultChapters();
    }
  }
}
