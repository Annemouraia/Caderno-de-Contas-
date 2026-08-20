# Caderno de Contas

App pessoal para controlar ganhos e gastos do mês, com senha de acesso e
uma análise de para onde foi o dinheiro. Feito em React + Vite + Tailwind.

> **Importante sobre os dados:** este app guarda tudo no `localStorage` do
> navegador — ou seja, os dados ficam salvos **só no aparelho e no navegador**
> onde você usar o app. Se abrir em outro celular/computador, ou limpar os
> dados do navegador, os lançamentos não aparecem lá. Não há um servidor
> guardando suas informações.

## Rodar localmente

Pré-requisito: [Node.js](https://nodejs.org) instalado (versão 18 ou mais recente).

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (geralmente `http://localhost:5173`).

## Publicar no GitHub Pages (deixar o app online, de graça)

1. Crie um repositório novo no GitHub (pode ser público ou privado) e suba este projeto:

   ```bash
   git init
   git add .
   git commit -m "Primeiro commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git
   git push -u origin main
   ```

2. No GitHub, vá em **Settings → Pages** do repositório.
3. Em **Build and deployment → Source**, escolha **GitHub Actions**.
4. Pronto. O workflow em `.github/workflows/deploy.yml` já está configurado:
   toda vez que você der `git push` na branch `main`, o site é gerado e
   publicado automaticamente. O link fica algo como:

   ```
   https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/
   ```

   Ele aparece na própria aba **Actions** do repositório e em **Settings → Pages**
   depois que a primeira publicação terminar (leva 1–2 minutos).

## Sobre a senha

A senha fica protegida com um hash (SHA-256) salvo no `localStorage`, não em
texto puro. Isso impede que alguém abrindo o navegador veja a senha direto,
mas **não é uma segurança de nível bancário** — é uma trava simples para uso
pessoal. Se você limpar os dados do navegador, a senha é esquecida e o app
pede para criar uma nova (os lançamentos de cada mês ficam em chaves
separadas da senha, mas também dependem do mesmo `localStorage`).

## Estrutura do projeto

```
├── src/
│   ├── App.jsx          # Tela de senha + app principal
│   ├── lib/storage.js   # Camada de armazenamento (localStorage)
│   ├── main.jsx         # Ponto de entrada do React
│   └── index.css        # Tailwind
├── .github/workflows/deploy.yml   # Publicação automática no GitHub Pages
├── index.html
└── package.json
```
