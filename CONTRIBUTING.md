# 🤝 Contributing to E-Cell Quizzes

First off, thank you for taking the time to contribute! Contributions make the open-source community an amazing place to learn, inspire, and create.

---

## 🛠 How Can I Contribute?

### 🐛 Reporting Bugs
* Check the existing issues list to see if the bug has already been reported.
* If not, open a new issue with a clear title, description, steps to reproduce, and screenshots/gifs if applicable.

### ✨ Suggesting Enhancements
* Open an issue describing the feature you would like to see added.
* Explain *why* this feature is useful and how it should work.

### 💾 Submitting Pull Requests (PRs)
1. **Fork** the repository to your own account.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Quiz-system.git
   cd Quiz-system
   ```
3. Create a **feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. Make your changes, keeping the following guidelines in mind:
   * Keep your code clean, well-commented, and aligned with the project's styling.
   * Do not commit your personal `.env.local` keys.
5. **Lint** your code:
   ```bash
   npm run lint
   ```
6. **Commit** your changes with a clear description:
   ```bash
   git commit -m "feat: add amazing new feature"
   ```
7. **Push** to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
8. Open a **Pull Request** against the `main` branch.

---

## 🎨 Style Guidelines

* **Framework**: Next.js App Router (using TypeScript).
* **Styling**: Tailwind CSS v4. Maintain the bold, high-contrast Neobrutalist design (thick borders, offset box-shadows, uppercase titles, etc.).
* **State Management**: Context-based logic (`AuthContext`, `QuizContext`). Keep Firestore database logic separated cleanly inside the contexts.
