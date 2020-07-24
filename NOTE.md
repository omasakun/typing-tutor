## Git setting up commands
``` bash
git init
git remote add origin git@github.com:omasakun/typing-tutor

git config alias.nffm "merge --no-ff"
git config alias.sqm "merge --squash"

git push -u origin --all
```

- @tscc/tscc を使うと、 google closure compiler + typescript の相性が良くなりそう？
- Babel を導入して、古いブラウザーへのサポートも提供すべき？
- gulp-cache, gulp-cached を入れてビルド(dev/prod)早くしたほうがいい？

- [Netlify / Using pnpm and pnpm workspaces](https://community.netlify.com/t/using-pnpm-and-pnpm-workspaces/2759) [Github:netlify/build-image#449] が、pnpmを使うためのworkaroundをなくしてくれるかもしれない。