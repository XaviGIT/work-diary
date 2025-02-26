# Work Diary

A clean, modern work diary application built with Astro, React, and TailwindCSS that helps you track your daily work activities with markdown support.

![Work Diary Screenshot](src/assets/background.svg)

## Features

- 📝 Simple, intuitive entry interface
- 🌗 Dark/light mode support
- 🔍 Search through entries
- 📆 Filter by month
- 📄 Export entries to PDF
- 👁️ Content hiding for privacy
- ✏️ Markdown support (including images)
- 📱 Responsive design

## 🚀 Project Structure

```
/
├── public/
├── src/
│   ├── assets/            # Static assets like SVGs
│   ├── components/        # React components
│   │   ├── DiaryEntry.jsx # Main component
│   │   ├── EntryCard.jsx  # Entry display component
│   │   └── ...
│   ├── layouts/
│   │   └── Layout.astro   # Main layout
│   ├── pages/
│   │   ├── api/           # API endpoints
│   │   │   └── entries.js # CRUD operations for entries
│   │   └── index.astro    # Main page
│   └── utils/             # Utility functions
│       ├── dates.js       # Date formatting
│       ├── markdown.js    # Markdown utilities
│       ├── pdf.js         # PDF export
│       └── storage.js     # Local storage utilities
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Installs dependencies                        |
| `npm run dev`     | Starts local dev server at `localhost:4321`  |
| `npm run build`   | Build your production site to `./dist/`      |
| `npm run preview` | Preview your build locally, before deploying |

## 💾 Database Setup

The project uses PostgreSQL for data storage. You'll need to:

1. Create a PostgreSQL database named `work_diary`
2. Create a table with the following structure:

```sql
CREATE TABLE diary_entries (
  id SERIAL PRIMARY KEY,
  entry_date DATE NOT NULL,
  entry_time TIME NOT NULL,
  description TEXT NOT NULL
);
```

3. Update the database connection string in `src/pages/api/entries.js` to match your configuration

## 🔧 Configuration

- Update the database connection settings in `src/pages/api/entries.js` to match your PostgreSQL setup
- Modify the theme colors in `tailwind.config.cjs` if desired

## 📚 Technologies Used

- [Astro](https://astro.build/) - Web framework
- [React](https://reactjs.org/) - UI components
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Marked](https://marked.js.org/) - Markdown parsing
- [jsPDF](https://parall.ax/products/jspdf) - PDF generation
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Lucide React](https://lucide.dev/) - Icons
- [React Hot Toast](https://react-hot-toast.com/) - Toast notifications
