---
title: Webhooks
description: Receba eventos do WhatsApp em tempo real vinculando webhooks a uma ou mais conexões no Pingo Notify.
icon: webhook
---

## O que são Webhooks?

Webhooks permitem que o **Pingo Notify avise sua aplicação** sempre que algo acontece no WhatsApp.

::info
Pense em webhooks como alertas automáticos enviados para o seu sistema.
::

Sempre que ocorre um evento, o Pingo Notify envia essas informações para uma URL configurada por você.

---

## Conexões e Webhooks

::info
A relação entre conexões e webhooks é flexível.
::

- Uma conexão pode estar vinculada a vários webhooks  
- Um webhook pode receber eventos de várias conexões  

Isso permite diferentes combinações de integração, dependendo da necessidade do seu sistema.

---

## Quando usar Webhooks?

Use webhooks quando quiser:

- Receber avisos sobre mensagens enviadas ou recebidas  
- Automatizar processos a partir do WhatsApp  
- Atualizar sistemas em tempo real  
- Integrar o WhatsApp com outras aplicações  

Se você apenas envia mensagens, o uso de webhooks é opcional.

---

## Como funciona

::info
Fluxo básico:  
**WhatsApp → Conexão → Pingo Notify → Webhook → Sua aplicação**
::

Sempre que algo acontece em qualquer conexão vinculada, o evento é enviado ao webhook.

---

## Configurar um Webhook

:::columns{cols=2}
  ::card{title="URL do Webhook" icon="link"}
  Informe o endereço HTTPS que receberá os eventos.
  ::

  ::card{title="Selecionar eventos" icon="list"}
  Escolha quais tipos de eventos sua aplicação deve receber.
  ::

  ::card{title="Status do Webhook" icon="toggle-on"}
  Ative ou pause o envio de eventos quando necessário.
  ::

  ::card{title="Vincular conexões" icon="layer-group"}
  Selecione uma ou mais conexões que irão disparar eventos para este webhook.
  ::
:::

---

## Eventos disponíveis

Os principais eventos que podem ser enviados são:

:::steps
  ::step{title="Mensagem enviada"}
  Quando uma conexão não oficial envia uma mensagem pelo WhatsApp.
  ::

  ::step{title="Mensagem recebida"}
  Quando uma mensagem chega ao WhatsApp conectado.
  ::

  ::step{title="Mensagem editada ou excluída"}
  Quando uma mensagem é alterada ou apagada.
  ::

  ::step{title="Presença atualizada"}
  Quando há mudança no estado de presença do contato.
  ::
:::

---

## O que Webhooks fazem e não fazem

::callout{icon="circle-info"}
- Recebem eventos em tempo real  
- Podem estar vinculados a várias conexões  
- Não enviam mensagens  
- Não criam conexões  
::

---

## Resumo

::info
- Webhooks recebem eventos do WhatsApp  
- Um webhook pode ouvir várias conexões  
- Uma conexão pode disparar eventos para vários webhooks  
::

Use webhooks quando sua aplicação precisar reagir automaticamente ao que acontece em uma ou mais conexões.
