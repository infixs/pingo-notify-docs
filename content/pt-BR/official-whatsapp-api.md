---
title: "API Oficial do WhatsApp"
description: "Guia passo a passo para solicitar acesso à API Oficial do WhatsApp Business e conectá-la ao Pingo Notify."
icon: "badge-check"
---

A **API Oficial do WhatsApp Business** é o caminho aprovado pela Meta para empresas que precisam de escala, perfil verificado e modelos de mensagem prontos para envios em grande volume.

Diferente de uma conexão por QR Code, a API oficial roda na **própria infraestrutura da Meta** — por isso a configuração acontece dentro do painel **Meta for Developers** e depois é vinculada ao Pingo Notify.

::info
Este guia segue a documentação oficial da Meta [Plataforma do WhatsApp Business — Começar](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started), adaptada para o fluxo do Pingo Notify.
::

::note
A API oficial é **opcional**. Se você só precisa enviar e receber mensagens a partir de um único dispositivo, uma [Conexão](/pt-BR/connections) comum via QR Code já é suficiente.
::

---

## Antes de começar

::info
**O que você vai precisar**
- Uma **conta no Facebook** pessoal para acessar o [Meta for Developers](https://developers.facebook.com/)
- Um **Portfólio Empresarial da Meta** no [Meta Business Suite](https://business.facebook.com/) (Business Manager) para a sua empresa
- Um **número de telefone** que **não** esteja ativo no aplicativo comum do WhatsApp ou WhatsApp Business
- Uma conta ativa no **[Pingo Notify](https://pingonotify.com/dashboard)**
::

O número usado na API oficial deixa de funcionar no aplicativo comum do WhatsApp, então escolha uma linha dedicada ao seu negócio.

---

## A jornada em resumo

::info
Visão geral:  
**Conta no Meta Developer → App da Meta → Produto WhatsApp → Número verificado → Webhook → Pingo Notify**
::

Os passos abaixo levam você do zero até um número aprovado que envia e recebe mensagens através do Pingo Notify.

---

## Passo a passo

:::steps
  ::step{title="Crie uma conta no Meta for Developers"}
  Acesse o portal [Meta for Developers](https://developers.facebook.com/) e cadastre-se com a sua conta do Facebook.  
  Confirme o e-mail e, se solicitado, ative a verificação em duas etapas — a Meta exige isso para contas que administram aplicativos.
  ::

  ::step{title="Crie um App da Meta"}
  No [Painel de Apps](https://developers.facebook.com/apps/), clique em **Criar App** e escolha o tipo **Empresa (Business)**.  
  Dê um nome ao app, informe um e-mail de contato e vincule-o ao seu **Portfólio Empresarial**.  
  Esse app é o contêiner que vai abrigar o produto WhatsApp. Consulte a referência [Criar um App](https://developers.facebook.com/docs/development/create-an-app) da Meta para detalhes.
  ::

  ::step{title="Adicione o produto WhatsApp"}
  Na página do app, encontre **WhatsApp** na lista de produtos e clique em **Configurar**.  
  A Meta cria automaticamente uma **Conta do WhatsApp Business (WABA)** e disponibiliza um **número de teste gratuito** para você experimentar antes de entrar em produção. Referência: [Cloud API — Começar](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started).
  ::

  ::step{title="Envie uma mensagem de teste"}
  Abra o painel **Configuração da API**. Nele você encontra o número de teste, um **token de acesso temporário** (válido por 24 horas) e um campo para adicionar destinatários.  
  Adicione o seu próprio número como destinatário e envie o modelo de exemplo **`hello_world`** para confirmar que tudo está funcionando.
  ::

  ::step{title="Adicione o número da sua empresa"}
  Ainda no painel, escolha **Adicionar número de telefone** e cadastre a linha que seus clientes verão.  
  Defina o **nome de exibição**, confirme a posse com o código que a Meta envia por **SMS ou chamada** e crie um **PIN de verificação em duas etapas**. Referência: [Adicionar um número de telefone](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/add-a-phone-number).
  ::

  ::step{title="Verifique a sua empresa"}
  Para remover os limites de envio e sair da fase de teste, conclua a **Verificação Empresarial** nas configurações do seu Portfólio Empresarial.  
  A Meta solicitará documentos que comprovem que sua empresa é legítima; a aprovação pode levar alguns dias. Referências: [Verificação Empresarial](https://developers.facebook.com/docs/development/release/business-verification) e a [Central de Ajuda para Empresas](https://www.facebook.com/business/help/2058515294227817).
  ::

  ::step{title="Reúna suas credenciais"}
  Anote o **Phone Number ID** (ID do número) e o **WABA ID** (ID da Conta do WhatsApp Business).  
  Para produção, gere um **token de acesso permanente**: crie um [Usuário do Sistema](https://business.facebook.com/settings/system-users) nas configurações da empresa e conceda a ele as permissões `whatsapp_business_messaging` e `whatsapp_business_management`. Referência: [Business Management API — Começar](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started).
  ::
:::

::warning{icon="triangle-exclamation"}
Nunca compartilhe seu token de acesso publicamente. Trate-o como uma senha — qualquer pessoa que o tenha pode enviar mensagens em seu nome.
::

---

## Conecte o webhook ao Pingo Notify

A Meta entrega cada mensagem recebida e cada atualização de status por meio de um **webhook**. Em vez de criar e hospedar o seu próprio receptor, você aponta a Meta diretamente para o **Pingo Notify**, que cuida da validação e encaminha cada evento para você. Para entender o mecanismo por trás disso, veja o guia [Configurar Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks) da Meta.

:::columns{cols=2}
  ::card{title="1. Crie uma conexão oficial" icon="plus" to="https://pingonotify.com/dashboard/connections"}
  No Pingo Notify, crie uma nova conexão do tipo **API Oficial do WhatsApp**.
  O Pingo Notify gera a **URL do Webhook** e o **Token de Verificação** que você vai precisar.
  ::

  ::card{title="2. Informe a Callback URL na Meta" icon="link"}
  No App da Meta, abra **WhatsApp → Configuração → Webhooks** e clique em **Editar**.
  Cole a **Callback URL** e o **Token de Verificação** fornecidos pelo Pingo Notify e confirme.
  ::

  ::card{title="3. Assine os eventos" icon="list-check"}
  Na mesma tela, assine o campo **messages** para que a Meta encaminhe as mensagens recebidas e as atualizações de status ao Pingo Notify.
  ::

  ::card{title="4. Conclua a conexão" icon="plug" to="https://pingonotify.com/dashboard/connections"}
  De volta ao Pingo Notify, informe o seu **Phone Number ID**, o **WABA ID** e o **token de acesso**.
  Salve para validar as credenciais e ativar a conexão.
  ::
:::

::info
Fluxo de eventos com a API oficial:  
**WhatsApp → Meta → Webhook → Pingo Notify → Sua aplicação**
::

Quando a conexão estiver ativa, ela se comporta como qualquer outra conexão no Pingo Notify — você pode vinculá-la a [Webhooks](/pt-BR/webhooks), [Integrações](/pt-BR/integrations) e à API de mensagens.

---

## Bom saber

::callout{icon="circle-info"}
- O número de teste só envia para destinatários que você adiciona manualmente — use-o para validação, não para produção  
- O número oficial não pode ser usado no aplicativo comum do WhatsApp ao mesmo tempo  
- Limites de envio maiores dependem da Verificação Empresarial e da sua nota de qualidade  
- [Modelos de mensagem](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates) de marketing e de notificação precisam ser aprovados pela Meta antes do envio  
::

---

## Referências

Documentação oficial da Meta utilizada neste guia:

- [Plataforma do WhatsApp Business — Começar](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started)
- [Cloud API — Começar](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Criar um App](https://developers.facebook.com/docs/development/create-an-app) · [Painel de Apps](https://developers.facebook.com/apps/)
- [Adicionar um número de telefone](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/add-a-phone-number)
- [Configurar Webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks)
- [Verificação Empresarial](https://developers.facebook.com/docs/development/release/business-verification)
- [Business Management API — Começar](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started) · [Modelos de Mensagem](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [Meta Business Suite](https://business.facebook.com/) · [Usuários do Sistema](https://business.facebook.com/settings/system-users)

Pingo Notify:

- [Painel do Pingo Notify](https://pingonotify.com/dashboard) · [Conexões](https://pingonotify.com/dashboard/connections)
- Documentação: [Conexões](/pt-BR/connections) · [Webhooks](/pt-BR/webhooks) · [Integrações](/pt-BR/integrations)

---

## Resumo

::info
- A API Oficial do WhatsApp roda na infraestrutura da Meta e é configurada no Meta for Developers  
- Você cria um App da Meta, adiciona o produto WhatsApp e verifica um número dedicado  
- O webhook aponta para o Pingo Notify, que recebe e entrega cada evento  
- Depois de conectado, o número oficial funciona como qualquer outra conexão do Pingo Notify  
::

Com a conexão ativa, você está pronto para enviar modelos e receber mensagens em escala pelo canal oficial.
