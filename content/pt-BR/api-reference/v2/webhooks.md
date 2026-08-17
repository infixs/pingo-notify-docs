---
title: "Webhooks"
description: "Nesta seção, você aprende como integrar e utilizar webhooks e eventos de mensageria para conectar a aplicação aos seus projetos."
icon: "webhook"
---

::info
**Pré-requisitos**
- Ter uma conta ativa no **Pingo Notify**.
- Dispor de um endpoint HTTP para receber as requisições — qualquer serviço de webhook pode ser utilizado.
::


## Criar uma conexão

:::columns{cols=2}
  ::card{title="1. Acessar Conexões" icon="qrcode" to="https://pingonotify.com/dashboard/connections"}
  Entre na aba **Conexões** no dashboard e visualize todas as integrações criadas.
  ::

  ::card{title="2. Criar nova conexão" icon="plus"}
  Clique em **Criar**, escolha um nome e ajuste as configurações conforme sua necessidade.
  ::

  ::card{title="3. Vincular ao WhatsApp" icon="expand"}
  Depois de criar a conexão, clique no ícone do **QR Code** e escaneie-o usando o leitor de QR Code do WhatsApp.
  É exatamente o mesmo processo utilizado no WhatsApp Web.
  ::

  ::card{title="4. Conexão ativada" icon="wifi"}
  Após a leitura do QR Code, o status será atualizado automaticamente e a conexão ficará ativa.
  ::
:::

::warning{icon="triangle-exclamation"}
Mantenha o WhatsApp ativo no dispositivo vinculado.
::

## Configurar Webhooks

Depois de criar sua conexão, você pode configurar webhooks para receber eventos em tempo real diretamente no seu endpoint HTTPS.

:::columns{cols=2}
  ::card{title="1. Definir a URL do Webhook" icon="link" to="https://pingonotify.com/dashboard/webhooks"}
  Informe a URL HTTPS do seu endpoint.  
  É para essa rota que o Pingo Notify enviará todos os eventos selecionados.
  ::

  ::card{title="2. Selecionar eventos de Webhook" icon="list"}
  Escolha quais eventos deseja escutar.  
  A lista inclui ações como mensagens enviadas, recebidas, editadas e muito mais.
  ::

  ::card{title="3. Ativar ou desativar o Webhook" icon="toggle-on"}
  Utilize o switch **“Status do webhook”** para habilitar ou pausar o envio de eventos sem precisar deletar a configuração.
  ::

  ::card{title="4. Agrupamento de mensagens" icon="layer-group"}
  O campo **“Habilitar agrupamento de mensagens”** permite reduzir a quantidade de requisições agrupando eventos durante um intervalo de tempo.
  ::

  ::card{title="5. Simulação de digitação" icon="keyboard"}
  A opção **“Habilitar simulação de digitação”** envia ao WhatsApp sinais de “digitando...” como um humano faria.
  ::

  ::card{title="6. Tempo de agrupamento" icon="timer"}
  Caso o agrupamento esteja ativo, informe o tempo (em segundos) para reunir vários eventos antes de enviá-los em um único payload.
  ::
:::

---

## Eventos Disponíveis

Os eventos listados representam tudo o que o sistema pode enviar para seu webhook.  
Aqui está a explicação de cada um:

:::steps
  ::step{title="Mensagem enviada"}
  Disparado quando **sua integração envia uma mensagem** pelo WhatsApp.  
  Inclui dados como ID da mensagem, conteúdo, destinatário e horário.
  ::

  ::step{title="Mensagem recebida"}
  Acionado quando **uma mensagem chega ao WhatsApp conectado**.  
  Inclui texto, mídia, remetente e metadados de origem.
  ::

  ::step{title="Mensagem atualizada"}
  Ocorre quando uma mensagem sofre alguma mudança — por exemplo, quando o WhatsApp atualiza o status interno.
  ::

  ::step{title="Mensagem excluída"}
  Enviado quando uma mensagem é apagada (tanto por você quanto pelo remetente).  
  Útil para sincronização de interfaces.
  ::

  ::step{title="Mensagem editada"}
  Disparado quando uma mensagem existente é alterada no WhatsApp, recurso recente da plataforma.
  ::

  ::step{title="Presença atualizada"}
  Indica mudanças no estado de presença do contato (digitando, gravando áudio, online etc.).
  ::
:::

::callout{icon="circle-info"}
Todos os eventos são enviados via requisições POST em JSON, permitindo processamento rápido e integração com qualquer backend.
::
