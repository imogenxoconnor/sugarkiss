# Sugar Kiss Storefront

This is a static NCEA Level 3 business website project for Sugar Kiss. It includes:

- A Sugar Kiss product catalogue with four sugar lip scrub flavours: Vanilla, Coconut, Raspberry, and Lemon.
- Product images, flavour filters, search, sorting, and stock limits.
- A working cart with quantity controls, delivery calculation, GST included, and local storage.
- A checkout form with validation.
- PayPal JavaScript SDK buttons using PayPal's demo/sandbox client ID.
- Business content for products, Pūtake, mission, innovation, goals, sustainability, and SWOT.

## Run It

Open `index.html` directly, or use the local server already started in this workspace:

```text
http://127.0.0.1:8080
```

## PayPal Notes

The page uses:

```html
<script src="https://www.paypal.com/sdk/js?client-id=test&currency=NZD&components=buttons"></script>
```

For a real business, replace `client-id=test` with your own PayPal sandbox or live client ID. A production checkout should create and capture orders from a server so the final price cannot be changed in the browser. For this school project, the static client-side version is suitable for demonstrating how a PayPal checkout works.

## Making Payments Real

There are two realistic ways to use PayPal for real Sugar Kiss orders:

1. Simple school-business option: create a PayPal Payment Link, Buy Button, or Shopping Cart Button inside a PayPal Business account, then paste the generated link or button code into this site. This works well with GitHub Pages because PayPal hosts the secure checkout page.
2. Full custom checkout option: keep this cart design, but add a backend server that creates and captures PayPal orders using PayPal credentials stored securely on the server. GitHub Pages cannot run that backend by itself, so the backend would need to be hosted somewhere like Vercel, Netlify Functions, Render, or another server host.

Do not put a PayPal client secret, API secret, or private key inside `index.html`, `app.js`, or any public GitHub repository.

## Publish With GitHub Pages

GitHub Pages can host this project because it is a static website made from HTML, CSS, and JavaScript.

Basic steps:

1. Create a GitHub account.
2. Create a new repository, for example `sugar-kiss`.
3. Upload `index.html`, `styles.css`, `app.js`, and `README.md` to the repository.
4. In the repository, open Settings, then Pages.
5. Set the source to deploy from the main branch and root folder.
6. GitHub will publish the site at a URL like `https://yourusername.github.io/sugar-kiss/`.

You can also connect a custom domain later if you buy one.

## Customise

Edit the `products` array in `app.js` to change prices, stock, flavour descriptions, and images.
