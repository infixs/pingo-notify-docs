---
title: Conexões
description: Conexões representam sessões do WhatsApp vinculadas ao Pingo Notify, usadas para envio, recebimento e integrações.
icon: qrcode
---

## O que é uma conexão?

Uma **conexão** é uma **sessão ativa do WhatsApp** vinculada ao Pingo Notify, semelhante ao WhatsApp Web.

::info
É uma sessão escaneada por QR Code,  
porém **nomeada**, **gerenciável** e com **controles avançados**.
::

Cada conexão corresponde a um WhatsApp conectado.

---

## Para que servem?

As conexões são a base de tudo no Pingo Notify.  
Elas permitem:

- Enviar e receber mensagens  
- Processar eventos  
- Usar plugins, webhooks e APIs  
- Controlar o comportamento da sessão  

Sem uma conexão ativa, nenhuma integração funciona.

---

## O que posso fazer com uma conexão?

- Vincular um WhatsApp via QR Code  
- Nomear a sessão  
- Usar a mesma conexão em múltiplas integrações  
- Configurar webhooks  
- Ajustar regras de leitura, presença e chamadas  

Cada conexão é independente.

---

## Editar conexão

A tela **Editar conexão** define **como a sessão do WhatsApp se comporta**.

::info
As alterações afetam apenas a conexão selecionada.
::

### Nome da conexão

Nome interno para identificação.

- Apenas organizacional  
- Não altera o WhatsApp  

**Exemplos:** `Suporte`, `Vendas`, `Financeiro`

---

## Configurações da conexão

Essas opções controlam o comportamento da sessão conectada.

:::columns{cols=2}
  ::card{title="Ler mensagens recebidas" icon="check-double"}
  Marca mensagens como lidas automaticamente.

  - Ativo: leitura imediata
  - Inativo: leitura manual
  ::

  ::card{title="Sempre online" icon="circle-dot"}
  Mantém a sessão ativa e aparecendo como online.

  - Indicado para bots
  - Evite em atendimento humano
  ::

  ::card{title="Ignorar mensagens de grupos" icon="users-slash"}
  Não processa mensagens vindas de grupos.

  - Eventos ignorados
  - Webhooks não recebem
  ::

  ::card{title="Sincronizar histórico completo" icon="clock-rotate-left"}
  Importa conversas antigas ao conectar.

  - Ative se precisar de histórico
  - Desative para iniciar do zero
  ::

  ::card{title="Rejeitar chamadas" icon="phone-slash"}
  Rejeita automaticamente ligações.

  - Canal focado em mensagens
  ::

  ::card{title="Ler atualizações de status" icon="eye-slash"}
  Marca status como visualizados.

  - Evita acúmulo de status
  - Opcional para privacidade
  ::
:::

---

## Importante saber

::callout{icon="circle-info"}
- Conexão = sessão do WhatsApp  
- Cada conexão tem suas próprias regras  
- Integrações sempre usam uma conexão ativa  
::

---

## Resumo

::info
- Funciona como um WhatsApp Web gerenciado  
- É a base para mensagens e integrações  
- Revisar as configurações evita problemas  
::

Antes de usar plugins, webhooks ou APIs, configure corretamente sua conexão.
