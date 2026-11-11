# Повторна публікація «Бронювання»

## Стан

Окремий Firebase-проєкт створено та сайт опубліковано 2026-11-04 після двох окремих підтверджень власника. Публічні HTTPS-перевірки пройшли.

- Назва: `hotel-booking-portfolio`.
- Project ID: `hotel-booking-portfolio-7c9a2`, Project Number: `430764183111`.
- Тариф: лише Spark, без підключення білінгу та платних сервісів.
- Google Cloud Billing API підтвердив: `billingEnabled: false`, платіжний акаунт не прикріплений.
- Публічна HTTPS-адреса: https://hotel-booking-portfolio-7c9a2.web.app
- Опублікована версія Firebase Hosting: `77282cd42ec55c4a` (121 файл).
- Firebase CLI 15.34.2 перевірено, авторизація чинна. До створення нового проєкту `projects:list` повернув лише `clothing-portfolio-6f2a9-9d2b3` та `happy-tails-vet-clinic-9f2c7a`; вони не є цілями deployment цього сайту та не змінювалися.

## Збірка та перевірки

Виконувати з поточної папки «Бронювання». У Windows PowerShell використано `.cmd`, щоб не змінювати Execution Policy.

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run build
```

`build` виконує TypeScript typecheck та Vite production build у `dist`. Стек: React 19, TypeScript, Vite 7, Tailwind CSS 4, React Router 7, GSAP, Lenis. `base` — `/`. Source maps вимкнені. Firebase публікує лише `dist`, додатково виключає приховані файли та `.map`; документація, тести, вихідні TS/TSX і конфігурації до публічної директорії не входять. Ліцензії локальних шрифтів залишаються поруч зі шрифтами.

Для наявних браузерних тестів запустити у першому терміналі:

```powershell
npm.cmd run preview -- --port 5174 --strictPort
```

У другому терміналі (локальні браузери вже наявні в цьому checkout):

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.local-browsers'
npx.cmd playwright test
```

## Firebase CLI та авторизація

CLI можна запускати без глобального встановлення і без зміни залежностей сайту:

```powershell
npm.cmd exec --yes --package=firebase-tools@15.34.2 -- firebase login
npm.cmd exec --yes --package=firebase-tools@15.34.2 -- firebase projects:list
```

Завершити вхід у Google у браузері. Не копіювати токени до файлів проєкту. Перевірити, що вибраний Google-акаунт правильний.

Проєкт уже створено після підтвердження власника наведеною нижче командою. Повторно її не виконувати:

```powershell
npm.cmd exec --yes --package=firebase-tools@15.34.2 -- firebase projects:create hotel-booking-portfolio-7c9a2 --display-name hotel-booking-portfolio
```

ID підтверджений успішним створенням. Зберігати тариф Spark без billing account. Не використовувати Firebase-проєкти «Одяг» або «Ветлікарня».

## Публікація та оновлення

Перша публікація виконана після окремого підтвердження власника. Перед наступними оновленнями також отримувати дозвіл на публікацію.

```powershell
npm.cmd test
npm.cmd run build
npm.cmd exec --yes --package=firebase-tools@15.34.2 -- firebase deploy --only hosting --project hotel-booking-portfolio-7c9a2
```

Параметр `--project` явно обмежує ціль цим сайтом. Не запускати deployment з батьківських або сусідніх папок. Не підключати Functions, Cloud Run, базу даних, Storage чи Blaze.

Після deployment відкрити повернену CLI HTTPS-адресу; перевірити зображення, обидві родини шрифтів, меню, анімації, галереї, форми та пряме відкриття/оновлення `/rooms`, `/rooms/forest-suite`, `/experiences`, `/about`, `/contact`, `/booking`, `/booking/details`. Firebase SPA rewrite віддає `index.html` для клієнтських маршрутів. `/booking/review` потребує введених даних гостя; `/booking/confirmation` — локального демонстраційного підтвердження. Без них перехід на попередній крок очікуваний.

## Функціональні обмеження

Бронювання — демонстрація на фронтенді. Валідація дат, місткості та даних гостя й обчислення вартості працюють локально. Вибір перебування та номер `DEMO-…` зберігаються у localStorage; дані гостя — у пам'яті React та зникають після перезавантаження. Жодного реального резервування, перевірки наявності, платежу чи email немає. Контактна форма також не надсилає повідомлення. Реальні бронювання потребуватимуть окремо погодженого бекенду; його не додано.

## Результати початкової перевірки

- 2026-11-04: 9/9 модульних тестів та 6/6 Playwright тестів пройшли.
- Production build та TypeScript typecheck пройшли.
- Перевірено 8 сторінок на ширинах 1440, 1024, 768, 390 та 375 px: без горизонтального переповнення, відсутніх зображень чи JS-помилок у тестах.
- 112 унікальних локальних посилань на ресурси існують; 114 файлів `public` скопійовані до збірки без змін (приблизно 12,7 МБ).
- Відео й аудіо у проєкті відсутні.
- Після фінальної збірки перевірено HTTP-віддачу всіх 121 файлів: вміст збігається з файлами `dist`, помилок немає. Усі 5 накреслень локальних шрифтів завантажуються; `.map`, TS/TSX, документація та приховані файли у `dist` відсутні.
- Публічна HTTPS-перевірка пройшла: HTTP 200, TLS 1.3, сертифікат браузер приймає без винятків.
- Усі 121 опубліковані файли завантажено через HTTPS та порівняно зі збіркою `dist`: розбіжностей немає. Усі 5 накреслень шрифтів завантажуються.
- Пряме відкриття та оновлення 11 адрес (включно з кроками бронювання та невідомим маршрутом) повертають SPA; JS-помилок у перевірці немає. Невідомий маршрут показує клієнтську сторінку 404.
- Повторно запущено 6/6 наявних Playwright тестів проти публічної HTTPS-адреси: всі пройшли (33,8 с). Підтверджено адаптивність, зображення, навігацію, галереї, сортування, календар, нормальні анімації, демобронювання й контактну форму.
- Критичних проблем у виконаних перевірках не знайдено. Функціональні обмеження форм описані вище; бекенд не створювався.
- Детальний звіт: `artifacts/firebase-verification.json`. Конфігурація повторного браузерного тесту: `artifacts/playwright.firebase.config.ts`.

Повторити браузерні перевірки публічного сайту:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.local-browsers'
npx.cmd playwright test --config artifacts/playwright.firebase.config.ts
```

Офіційна документація: [Firebase Hosting](https://firebase.google.com/docs/hosting/quickstart), [конфігурація та SPA rewrites](https://firebase.google.com/docs/hosting/full-config).
