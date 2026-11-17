# Priyanka Sharma — personal website

A plain HTML, CSS and JavaScript site. There is no build step and nothing to install: what is in this folder is exactly what gets published.

## Where it is published

The site is live at <https://prinkashar.github.io/>. GitHub Pages serves it from the `main` branch of the repository `prinkashar/prinkashar.github.io`.

## Preview it on your computer

Double-click `index.html` to open it in your browser.

For a preview that is closer to the published site, run this in the folder and open <http://localhost:8000>:

```
python -m http.server 8000 --bind 127.0.0.1
```

## What is where

| File or folder | What it is |
| --- | --- |
| `index.html` | Home page |
| `research.html` | Research areas and current work, publications, talks and conference presentations |
| `projects.html` | Project spotlights, with figures |
| `teaching.html` | Courses taught, courses prepared to teach, research on teaching |
| `industry.html` | Product and commercialization work, industry roles, credentials, work samples |
| `cv.html` | Full CV (has a "Print or save as PDF" button) |
| `contact.html` | Email and profile links |
| `404.html` | Shown by GitHub Pages when a page is not found |
| `assets/css/style.css` | All styling. Colours, fonts and spacing are set once at the top, under "Design tokens" |
| `assets/js/main.js` | Mobile menu, image viewer, document previews, fade-in effects |
| `assets/img/` | Every image the site uses. `social-card.jpg` is the picture shown when the site is shared on LinkedIn or X |
| `assets/fonts/` | The two typefaces (Newsreader and Inter), with their licences |
| `Images/` | Your original uploads. The site does not use this folder (it uses optimised copies in `assets/img/`), and it is not published |

## Publish a change

After editing, send the change to GitHub. Either use the Source Control panel in VS Code (write a short message, click **Commit**, then **Sync Changes**), or run:

```
git add .
git commit -m "Describe the change"
git push
```

The live site updates a minute or two after the push.

File names are case-sensitive once published: `Photo.jpg` and `photo.jpg` are different files on GitHub, even though Windows treats them as the same. Keep new file names lowercase, with hyphens instead of spaces.

The site's address is written into each page (for link previews and search engines) and into `robots.txt` and `sitemap.xml`. If the address ever changes, for example to a custom domain, search the folder for `prinkashar.github.io` and replace it everywhere. If you add a page, add it to `sitemap.xml` too.

Two files matter for publishing and should stay: the empty `.nojekyll` (tells GitHub to publish the files exactly as they are) and `.gitignore` (keeps `Images/` and system files out of the repository).
