---
title: Integrações
description: Integrações representam aplicações externas vinculadas ao Pingo Notify, autorizadas a acessar recursos como conexões, planos e mensageria.
icon: cube
---

## O que são integrações?

Uma **integração** é o vínculo entre o **Pingo Notify** e uma **aplicação externa**, como um plugin, sistema ou plataforma.

::info
A integração **não é uma sessão do WhatsApp**.  
Ela é a autorização que permite que uma aplicação acesse o Pingo Notify.
::

Por meio de uma integração, uma aplicação pode interagir com o sistema de mensageria de forma segura e controlada.

---

## Para que servem as integrações?

As integrações permitem que aplicações externas possam:

- Enviar mensagens
- Acessar conexões disponíveis
- Consultar informações de plano
- Utilizar recursos de mensageria
- Operar dentro das permissões concedidas

Sem uma integração ativa, a aplicação **não consegue acessar o Pingo Notify**.

---

## O que esta tela mostra?

A tela **Integrações** exibe **todas as aplicações já vinculadas** à sua conta do Pingo Notify.

Cada item da lista representa:

- Uma aplicação integrada (ex.: WordPress)
- Uma autorização ativa
- Um vínculo válido com o sistema de mensageria

---

## Exemplo: Integração com WordPress

Quando você integra o **plugin WordPress** ao Pingo Notify:

- O WordPress passa a ser uma **integração**
- A conta WordPress ganha acesso ao sistema de mensageria
- O plugin pode:
  - Listar conexões
  - Usar conexões ativas
  - Consultar informações do plano
  - Enviar mensagens por eventos do site

::info
A integração libera o acesso.  
A conexão define qual WhatsApp será usado.
::

---

## Integração x Conexão

::callout{icon="circle-info"}
- **Integração**: vínculo com a aplicação (ex.: WordPress)  
- **Conexão**: sessão do WhatsApp (QR Code escaneado)  
::

Uma integração pode usar **uma ou mais conexões**, dependendo da configuração.

---

## O que posso fazer com uma integração?

Nesta tela, você pode:

- Visualizar quais aplicações estão integradas
- Identificar a origem do acesso (ex.: plugin, sistema, API)
- Controlar quais aplicações têm acesso ao Pingo Notify
- Revogar integrações que não devem mais acessar o sistema

---

## Importante saber

::warning
Se uma integração for removida ou desativada,  
a aplicação vinculada perde imediatamente o acesso ao Pingo Notify.
::

Isso não remove conexões nem mensagens, apenas bloqueia o acesso da aplicação.

---

## Resumo

::info
- Integração = autorização de acesso da aplicação  
- Plugin WordPress é um exemplo de integração  
- Integrações acessam conexões e recursos do plano  
- Sem integração, a aplicação não funciona  
::

Antes de uma aplicação enviar mensagens ou gerenciar conexões, ela precisa estar integrada ao Pingo Notify.
