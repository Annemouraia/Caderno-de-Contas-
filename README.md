
Caderno de Contas
App pessoal para controlar ganhos e gastos do mês, com senha de acesso e uma análise de para onde foi o dinheiro. Feito em React + Vite + Tailwind.
Importante sobre os dados: este app guarda tudo no localStorage do navegador — ou seja, os dados ficam salvos só no aparelho e no navegador onde você usar o app. Se abrir em outro celular/computador, ou limpar os dados do navegador, os lançamentos não aparecem lá. Não há um servidor guardando suas informações.
Rodar localmente
Pré-requisito: Node.js instalado (versão 18 ou mais recente).
Comandos: npm install e depois npm run dev. Abra o endereço que aparecer no terminal (geralmente http://localhost:5173).
Publicar no GitHub Pages
Crie um repositório novo no GitHub e suba este projeto.
No GitHub, vá em Settings → Pages do repositório.
Em Build and deployment → Source, escolha GitHub Actions.
Pronto. O workflow em .github/workflows/deploy.yml já está configurado: toda vez que você mudar algo na branch main, o site é gerado e publicado automaticamente.
Sobre a senha
A senha fica protegida com um hash (SHA-256) salvo no localStorage, não em texto puro. Isso impede que alguém abrindo o navegador veja a senha direto, mas não é uma segurança de nível bancário — é uma trava simples para uso pessoal.
Estrutura do projeto
src/App.jsx
src/lib/storage.js
src/main.jsx
src/index.css
.github/workflows/deploy.yml
index.html
package.json
