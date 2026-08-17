---
title: 'Convenções'
description: 'Paginação, erros, ids e datas — as regras que todo endpoint da v3 segue.'
icon: 'list-check'
---

## Paginação

Vários endpoints de listagem paginada recebem estes parâmetros de query e devolvem o mesmo envelope.

```bash
curl "https://api.pingonotify.com/v3/helpdesk/contacts?page=2&per_page=50&s=ana" \
  -H "apikey: sk_live_..."
```

| Parâmetro | Padrão | Observações |
|---|---|---|
| `page` | `1` | Começa em 1. |
| `per_page` | `10` | O intervalo permitido depende do endpoint. |
| `s` | — | Busca em texto livre. O que é buscado depende do recurso. |

::warning
Os nomes na requisição são **`per_page`** e **`s`** — em snake_case e abreviado. Enviar `perPage` ou `search` não gera erro; é silenciosamente ignorado e você recebe os valores padrão de volta. Isso pega muita gente, então confira os nomes dos parâmetros na página do endpoint.
::

Quando a paginação por página é usada, o envelope tem este formato:

```json
{
  "data": [ ... ],
  "total": 137,
  "totalPages": 3,
  "currentPage": 2,
  "perPage": 50
}
```

### A exceção: mensagens

`GET /v3/helpdesk/conversations/{id}/messages` é paginado por **cursor**, porque uma conversa cresce por baixo enquanto você a lê e os números de página se deslocariam sob os seus pés.

Ele devolve um **array puro**, não um envelope, ordenado **da mais antiga para a mais nova**. Para caminhar para trás no histórico, passe o id da mensagem mais antiga que você já tem:

```bash
curl "https://api.pingonotify.com/v3/helpdesk/conversations/{id}/messages?limit=30&cursor={idDaMensagemMaisAntiga}" \
  -H "apikey: sk_live_..."
```

Você chegou ao começo da conversa quando receber menos mensagens do que pediu.

## Erros

Existem dois formatos comuns de erro, e qual deles você recebe depende de onde a falha aconteceu.

**Falhas de validação e de permissão** usam o formato padrão:

```json
{
  "statusCode": 400,
  "message": ["name must be a string"],
  "error": "Bad Request"
}
```

Repare que `message` é um **array** em falhas de validação — uma entrada por regra quebrada — e uma string simples nos demais casos.

Muitas **falhas de negócio** usam um formato com código, com um código legível por máquina e uma mensagem localizada:

```json
{
  "message": "CONNECTION_NOT_FOUND",
  "hint": "Conexão não encontrada."
}
```

Quando `message` for um código documentado, faça a lógica em cima dele, não de `hint` — o hint é escrito para humanos e sua redação pode mudar. Algumas falhas de negócio usam o formato padrão; confira o que cada endpoint documenta.

### Códigos de status

| Código | O que significa |
|---|---|
| `200` | Sucesso. |
| `201` | Criado. Este é o padrão de `POST`, salvo indicação contrária. |
| `204` | Sucesso, sem corpo. Só presuma esse status quando o endpoint o documentar. |
| `400` | Sua requisição estava malformada, ou uma regra de negócio a rejeitou. |
| `401` | Seu `apikey` está ausente, errado ou revogado. |
| `403` | Seu papel não permite isso, ou seu plano não inclui. |
| `404` | Não existe — **ou você não pode vê-lo**. Veja abaixo. |
| `409` | Colide com algo que já existe. |
| `422` | A requisição é válida, mas o estado atual do recurso impede o processamento — por exemplo, janela do WhatsApp fechada ou IA não configurada. |

### Por que você recebe 404 em vez de 403

Quando um Agent pede uma conversa em uma caixa da qual não é membro, a API responde **404**, não 403.

Isso é proposital. Um 403 confirmaria que a conversa existe, o que vaza informação para quem não deveria saber. A mesma regra vale para recursos do helpdesk protegidos pela visibilidade da caixa de entrada.

Ou seja, um 404 significa *"não visível para você"*, uma afirmação um pouco mais ampla do que *"não existe"*.

## Ids

Ids de recursos gerados pelo Pingo são **UUIDs**. A maioria é UUID v7, então eles ordenam cronologicamente — mas não dependa disso; trate-os como strings opacas. Ids de provedores e sistemas externos, como os ids de mensagens do WhatsApp, são strings opacas e podem usar outros formatos.

Uma conversa também tem um **`displayId`**: um inteiro pequeno, sequencial por workspace, que existe para que os seus agentes possam dizer "chamado 214" em voz alta. Ele não é aceito como parâmetro de caminho em lugar nenhum.

## Datas

Todo timestamp, de entrada e de saída, é **ISO 8601 em UTC**:

```
2026-07-14T12:34:56.000Z
```

Intervalos de relatório são inclusivos nas duas pontas. Onde um relatório agrupa por dia, os dias são dias UTC.

O único lugar em que o fuso importa é uma **caixa de entrada**: o `timezone` dela (um nome IANA como `America/Sao_Paulo`) é a referência do horário de funcionamento, das respostas de fora do expediente e dos SLAs em horário comercial.

## Limites de taxa e medição

Não há limite de requisições por segundo na API.

O que **é** medido são **mensagens**. Cada mensagem enviada consome um crédito do seu plano, e campanhas reservam os créditos de toda a audiência antecipadamente — se o seu plano não cobre todos os destinatários, a campanha não é criada. Cancelar uma campanha devolve os créditos dos destinatários que nunca foram enviados.

Veja a sua folga com `GET /v3/summary`.
