# Deyar website

```
deyar/
├── index.html
├── css/style.css
├── js/main.js
└── data/store-data.json
```

Products and collections are loaded from `data/store-data.json` with `fetch()`,
so open the site through a local server (opening index.html directly via file:// blocks fetch):

    python3 -m http.server 8000   # then visit http://localhost:8000
