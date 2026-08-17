---
title: Chaves de API
description: Entenda o que são Chaves de API e por que elas são necessárias para usar o Pingo Notify com segurança.
icon: key
---

## O que são Chaves de API?

As **Chaves de API** são **chaves de acesso** que identificam e autorizam aplicações a usar o Pingo Notify.

::info
Pense nas Chaves de API como uma **senha especial para sistemas**,  
não para pessoas.
::

Elas garantem que apenas aplicações autorizadas possam acessar sua conta e enviar mensagens em seu nome.

---

## Para que servem as Chaves de API?

As Chaves de API permitem que uma aplicação:

- Acesse sua conta no Pingo Notify
- Utilize recursos de mensageria
- Consulte informações permitidas
- Execute ações com segurança

Sem uma chave válida, o acesso é bloqueado.

---

## Importante entender

::callout{icon="circle-info"}
- A chave identifica sua conta  
- Quem possui a chave pode usar sua conta  
- Ela deve ser protegida como uma senha  
::

---

## Como funciona na prática

::info
Fluxo simples:  
**Aplicação → Chave de API → Pingo Notify**
::

Sempre que uma aplicação tenta se comunicar com o Pingo Notify, a Chave de API é usada para validar o acesso.

---

## Criação das Chaves de API

As Chaves de API são criadas diretamente no painel do Pingo Notify, ou pela própria API com `POST /v3/api-tokens`.

Pontos importantes:

- A chave é exibida **apenas uma vez**
- Não é possível visualizar a chave novamente
- Caso perca, será necessário gerar uma nova

---

## Usando sua chave

Uma chave sempre começa com `sk_live_`:

```
sk_live_a1b2c3d4e5f6...
```

Envie-a no header **`apikey`** em toda requisição:

```bash
curl https://api.pingonotify.com/v3/connections \
  --header 'apikey: sk_live_a1b2c3d4e5f6...'
```

::warning
É o header **`apikey`** — não `Authorization: Bearer`. A mesma chave funciona em todas as versões da API.
::

---

## Rotação e revogação

Se uma chave vazar, você não precisa excluí-la e refazer a integração. **Rotacione** — o segredo antigo morre no instante em que o novo é emitido, e o substituto volta na resposta:

```bash
curl -X PATCH https://api.pingonotify.com/v3/api-tokens/{id} \
  --header 'apikey: sk_live_...' \
  --header 'Content-Type: application/json' \
  --data '{ "refreshToken": true }'
```

Para revogar uma chave de vez, exclua-a com `DELETE /v3/api-tokens/{id}`. Ela para de funcionar imediatamente.

::info
Uma chave carrega as permissões de quem a criou. Uma chave criada por um **Owner** pode fazer tudo que um Owner pode — inclusive mexer na cobrança. Crie cada chave sob uma conta cujo papel corresponda ao que a integração realmente precisa.
::

---

## Boas práticas de segurança

- Não compartilhe sua Chave de API
- Não publique a chave em locais públicos
- Guarde em local seguro
- Remova chaves que não estão mais em uso

---

## Resumo rápido

::info
- Chaves de API controlam o acesso à sua conta  
- São usadas por aplicações, não por pessoas  
- Devem ser mantidas em segurança  
::

Sempre que uma aplicação precisar acessar o Pingo Notify, ela precisará de uma Chave de API válida.
