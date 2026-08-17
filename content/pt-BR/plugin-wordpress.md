---
title: Primeiros passos
description: Plugin WordPress que conecta eventos do seu site ao Pingo Notify para envio automático de notificações.
icon: "wordpress"
---

## Visão geral

[![Pingo Notify WordPress Plugin Banner](https://ps.w.org/infixs-pingo-notify/assets/banner-1544x500.png?rev=3407499)](https://wordpress.org/plugins/infixs-pingo-notify/)

Este **[plugin WordPress](https://wordpress.org/plugins/infixs-pingo-notify/)** integra seu site ao **Pingo Notify**, permitindo enviar notificações automáticas a partir de eventos do WordPress.

---

## O que o plugin faz

- Conecta o WordPress ao Pingo Notify  
- Captura eventos do site (ex.: WooCommerce)  
- Envia esses eventos ao Pingo Notify  
- Permite configurações de integração direto no painel do WordPress  

---

## Dependência obrigatória

::warning
Para o plugin funcionar, você precisa ter uma conta no **Pingo Notify**.
::

O Pingo Notify é o serviço responsável por processar e enviar as mensagens.

---

## Como o plugin funciona

::info
Fluxo básico:  
**WordPress → Plugin → Pingo Notify → Mensagem enviada**
::

O plugin detecta o evento no WordPress e envia as informações ao Pingo Notify, que realiza o envio.

---

## Instalação

:::steps
  ::step{title="Instalar o plugin"}
  Plugins → Adicionar novo → Buscar por **Pingo Notify** → Instalar e ativar
  ::

  ::step{title="Criar conta no Pingo Notify"}
  Criar conta no site do Pingo Notify e escolher um plano (pode começar pelo gratuito)
  ::

  ::step{title="Conectar o plugin"}
  Informar as credenciais do Pingo Notify no painel do WordPress
  ::

  ::step{title="Configurar eventos"}
  Definir quais eventos do site vão gerar notificações
  ::
:::

---

## Integração com WooCommerce

O plugin pode capturar eventos como:

- Novo pedido  
- Mudança de status  
- Pedido concluído  

::info
O WooCommerce gera o evento →  
o plugin envia para o Pingo Notify →  
o Pingo Notify dispara a mensagem.
::

---

## Sem WooCommerce

Também funciona em qualquer site WordPress:

- Institucionais  
- Blogs  
- Landing pages  

Útil para alertas administrativos e eventos internos.

---

## Resumo

::info
- O plugin faz a integração  
- O Pingo Notify faz o envio  
- Você pode começar com um plano gratuito
::

Com os dois configurados, seu site envia notificações automaticamente.
