# [Varun's Portfolio, Work and Opinions.](https://varunest.com) [![travis][travis-image]][travis-url]
[travis-image]: https://img.shields.io/travis/varunest/varunest.com/master.svg?style=flat
[travis-url]: https://travis-ci.org/varunest/varunest.com

Copyright (c) Varun Verma

Hi, I'm Varun and this is the source code for my blog, [https://varunest.com](https://varunest.com). Feel free to browse the source and [ask me questions](https://twitter.com/varunest).

## Run it

### Install dependencies
Please note that on Mojave `install-system-deps` will fail if you do not have installed Ruby using HomeBrew. Follow [this](https://desiredpersona.com/install-jekyll-on-macos/) guide to install Jekyll before running following commands.

```bash
npm install
npm run install-system-deps # macOS only
```

### Build site

```bash
npm run build
```

### Start server

```bash
npm start
```

### Start development server

```bash
npm run watch
```

### Run tests

```bash
npm test
```

### Publish site

```bash
npm run deploy
```

On the server, I serve the generated files with `nginx` and run the Node.js app using `Supervisord` (to restart the app if it crashes).

That's pretty much it.

# License

Copyright (c) [Varun Verma](https://varunest.com/)
