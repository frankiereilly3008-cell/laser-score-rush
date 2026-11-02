# Laser Score Rush

A clean desktop and laptop counter game. Reach **1,000,000,000,000,000,000** with a laser cannon, or send the score below zero.

## Controls

- **Add one** / keyboard **+**: add exactly 1 and fire a green laser.
- **Subtract one** / keyboard **−**: subtract exactly 1 and fire a red laser.
- **Help me**: set the score to exactly 300 below the finish.
- **Subtract 999,999,999,999,999,999**: subtract the full amount, including into negative scores.
- **Reset**: set the score and shot count to exactly zero.
- Quick adjustments: +30, −222, −700, and −50,000.

The score saves in your browser on the current device. All score calculations use JavaScript BigInt so very large positive and negative values remain exact.

## Run locally

Open `index.html` in a modern browser, or serve this folder with a static web server. No installation or build is required.

## GitHub Pages

In the repository, open **Settings → Pages**, choose **Deploy from a branch**, and select **main / (root)**. The HTML, CSS, and JavaScript files should be at the repository root.

Google Fonts are optional; system font fallbacks are included. No backend, account, or API key is required.
