# Collaborating on LOOM

This repo is meant for team edits on GitHub.

## Get access

1. Owner adds you on GitHub: **Repo → Settings → Collaborators → Add people**
2. Accept the invite email from GitHub
3. Clone:
   ```bash
   git clone https://github.com/<owner>/loom.git
   cd loom
   ```

## Make changes

```bash
git checkout -b your-feature-name
# edit files
git add -A
git commit -m "Describe what you changed"
git push -u origin your-feature-name
```

Open a **Pull Request** on GitHub. Owner reviews and merges.

## What to edit

| Area | Path |
|------|------|
| LOOM storefront shell | `clothing/` |
| Shopify playbook | `SHOPIFY.md` |
| Approved product list | `CATALOG_LINKS.md` |
| Sourcing rules | `SUPPLIERS.md` |
| Research tool | `index.html` |

## Rules

- Do not commit `.env` or API keys (see `.gitignore`)
- Do not add fake product catalogs — real supplier SKUs only
- No CJ Dropshipping links in this project

## Live store

Shopify is the live checkout path. See `SHOPIFY.md`. This repo’s `clothing/` folder is reference / prototype HTML.
