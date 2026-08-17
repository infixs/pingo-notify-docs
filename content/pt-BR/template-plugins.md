---
title: Guia de Templates
description: Aprenda a criar mensagens dinâmicas personalizadas.
icon: square-envelope
---

## Criando Notificações Customizadas

O Pingo Notify transforma eventos do WordPress, WooCommerce e muitos outros plugins em notificações automáticas personalizadas.

::image-frame{caption="O editor de notificações: o preview à esquerda, o conteúdo da mensagem no centro e o trigger, a conexão e o destinatário à direita."}
![Interface do Editor de Templates](/images/pt-BR/pingo-notify-wordpress-plugin-notification-base-example.png)
::

## 1. Configuração de Notificação

Antes de escrever a mensagem, defina na barra lateral:

### Trigger e Destino
1.  **Trigger (Gatilho):** O evento que dispara a notificação. Veja alguns exemplos:
    *   **Order Status Change:** Quando algum pedido do WooCommerce muda o status. Esse Trigger exige escolher um status específico ou a opção "Qualquer Status".
    *   **New Order:** Quando um novo pedido do WooCommerce é criado.
    *   **New Comment:** Quando um novo comentário é feito no site.
    *   **Post Published:** Quando um novo post é publicado.
2.  **Conexão:** Qual conexão/número de WhatsApp enviará essa notificação.
3.  **Destinatário:** Quem recebe a mensagem:
    *   Variáveis dinâmicas (ex: `{{ order.shipping.phone }}`).
    *   Números fixos (ex: `5511999999999`).
    *   Múltiplos números separando por vírgula (ex: `{{ order.shipping.phone }}, 5511999999999`).
    
    ::info
    **Recomendação:** Utilize `{{ order.full_phone }}`. Esta variável garante que o número tenha o código do país, ao contrário de `{{ order.billing.phone }}` que utiliza o campo exatamente como o preenchido pelo usuário.
    ::

    ::warning
    **Formato do Número:** Use sempre o formato completo internacional (DDI + DDD + Número), apenas números e sem símbolos. O sinal de `+` no início é opcional (ex: `5511999999999` ou `+5511999999999`).
    ::


**Adicionando e Editando Mensagens (Preview)**
Você pode configurar uma sequência de mensagens para o mesmo evento. Interaja diretamente com o **Preview**:
*   **Adicionar Mensagem:** Clique no botão **+** flutuante para adicionar um novo balão de mensagem à sequência.
*   **Editar Conteúdo:** Clique diretamente em qualquer **balão de mensagem** no preview para selecioná-lo e editar seu texto no painel à esquerda.

### Rules (Regras Condicionais)

::image-frame{caption="O diálogo Rules: uma condição por linha — campo, operador e valor."}
![Interface do Editor de Templates para regras](/images/en/pingo-notify-plugin-wordpress-notification-rules-form.png)
::

As **Rules** (Regras) permitem adicionar inteligência aos seus envios, definindo critérios específicos para que uma mensagem seja disparada.

**Aplicação por Mensagem**
As regras são aplicadas individualmente a cada mensagem gerada. Isso significa que você pode filtrar envios com base nos dados específicos daquele evento (ex: valor do pedido, status do pagamento, cidade de entrega, etc).

*   **Exemplo Prático**: Imagine uma regra para enviar apenas se o `order.total` for maior que **R$ 100**.
    *   Se um pedido de R$ 50 entrar, **o envio dessa mensagem (onde a regra foi aplicada) será ignorado**.
    *   Se um pedido de R$ 150 entrar, **o envio é realizado**.

**Validando a Regra (Simulação Visual)**
Para garantir que sua lógica está correta, use o **Preview** no editor:
1.  Troque o **Exemplo de Dados** (no topo esquerdo) para diferentes pedidos.
2.  Observe o comportamento do preview:
    *   🖼️ **Totalmente Visível:** Regra **Verdadeira** (a mensagem seria enviada).
    *   👻 **Opacidade Baixa (Transparente):** Regra **Falsa** (o envio seria ignorado).

::image-frame{center caption="Trocar o exemplo de dados reavalia todas as regras: o balão esmaecido não seria enviado, o opaco sim."}
![Preview mostrando uma mensagem esmaecida porque sua regra foi avaliada como falsa e outra totalmente visível porque sua regra foi avaliada como verdadeira](/images/pt-BR/pingo-notify-plugin-wordpress-message-opacity-preview.png)
::

---

## 2. Editor de Mensagens

### Exemplo de Dados
No canto superior esquerdo, selecione um pedido real (ex: "Order #761"). Isso ativará o **Autocomplete** e mostrará dados reais nos testes.

### Barra de Ferramentas
*   **Attach:** Envie imagens, PDFs ou áudios junto com o texto.
*   **Enviar Teste:** Use o botão **Send Test** para enviar a mensagem ao seu número pessoal antes de ativar (`Active`).

---

### Variáveis

Variáveis são os espaços reservados que serão substituídos pelos dados reais do cliente ou pedido no momento do envio.

**Como usar**

Toda variável deve estar entre chaves duplas `{{ }}`.

```handlebars
Olá {{ order.billing.first_name }}, recebemos seu pedido!
```

Para acessar dados que estão dentro de outros objetos (como detalhes do endereço dentro do pedido), usamos o ponto `.`.

```handlebars
Seu pedido será enviado para: {{ order.shipping.city }} - {{ order.shipping.state }}
```

**Regras para Variáveis**

Ao escrever variáveis manualmente, atente-se ao que é permitido:

:::card-group{cols=2}
  ::card{title="Válido" icon="circle-check" color="green"}
  *   `{{ order.id }}` (Ponto para navegar em objetos)
  *   `{{ customer_name }}` (Underlines são aceitos)
  *   `{{ total }}` (Nomes simples e minúsculos)
  ::

  ::card{title="Inválido" icon="circle-exclamation" color="red"}
  *   `{{ order id }}` (Não use espaços)
  *   `{{ Order.ID }}` (Evite letras maiúsculas, prefira minúsculas)
  *   `{{ $valor-total }}` (Evite caracteres especiais ou hifens no início)
  ::
:::

### Lógica de Controle (`If`, `Else`, `Each`)

Torne suas mensagens "inteligentes". Com a lógica de controle, o próprio template decide quais informações mostrar (ou esconder) dependendo da situação de cada pedido.

#### 1. Condicionais (`if` / `else`)
O bloco `if` funciona como uma **pergunta** que o sistema faz aos dados antes de enviar a mensagem.

**Exemplo: Verificar se uma informação existe**
Imagine que você queira enviar o código de rastreio, mas nem todos os pedidos possuem um ainda.
Se usarmos o `if`, o sistema pergunta: *"Existe um código de rastreio preenchido?"*
*   **Sim:** Ele mostra o código.
*   **Não:** Ele ignora e não mostra nada (evitando enviar um espaço em branco).

```handlebars
Seu pedido foi enviado! 🚚
{{ #if order.tracking_code }}
Código de rastreio: {{ order.tracking_code }}
{{ /if }}
```

**Exemplo: Comparar Valores ("É igual a...")**
Você pode querer mudar o texto dependendo da forma de pagamento. Aqui, o sistema pergunta: *"O método de pagamento é igual a 'pix'?"*

```handlebars
Obrigado pela compra!

{{ #if order.payment_method "pix" }}
ℹ️ Seu pagamento via PIX foi confirmado instantaneamente.
{{ else }}
🕒 Estamos processando a validação do seu cartão.
{{ /if }}
```
*Note que usamos o `else` (senão) para dar uma alternativa caso a resposta seja "Não".*

**Exemplo: Comparação Negativa ("É diferente de...")**
Às vezes, queremos saber se algo **NÃO** aconteceu. No exemplo abaixo, verificamos se o pedido é diferente de cancelado.

```handlebars
{{ #if order.status "!=" "cancelled" }}
✅ Seu pedido segue ativo!
{{ /if }}
```

#### 2. Listas de Itens (`each`)
Seu cliente comprou 5 produtos diferentes. Você não vai escrever 5 vezes o código, certo?
O bloco `each` (cada) serve para **repetir** um pedaço do template para cada item encontrando na lista do pedido.

```handlebars
Resumo do Pedido #{{ order.id }}:

{{ #each order.items }}
📦 {{ name }}
   Qtd: {{ quantity }} x R$ {{ price }}
{{ /each }}

Total: R$ {{ order.total }}
```

::info
**Como funciona a "mágica" do contexto:**
Repare que dentro do bloco `{{ #each order.items }}` nós escrevemos apenas `{{ name }}` e não `{{ order.items.name }}`.
Isso acontece porque, dentro do loop, o sistema "foca" apenas no item da vez. Ele já sabe que estamos falando dos detalhes daquele produto específico.
::

### Formatadores Especiais

Dados brutos de computador geralmente vêm sem formatação (ex: `1250.00`). Para transformá-los em algo legível para humanos, usamos formatadores.

Observe o uso da palavra `money` antes da variável de preço. Isso avisa ao sistema: *"Formate este número como dinheiro"*.

```handlebars
Valor total: {{ money order.total }}
```
*Resultado:* `R$ 1.250,00`

---

## Exemplo Completo

Template de **Pedido Concluído** com variáveis, loop de itens e condicional de parcelamento.

```handlebars
Olá {{ order.billing.first_name }}! Tudo bem? 

Seu pedido #{{ order.id }} foi concluído!
Resumo da compra: 
{{ #each order.items }} 
• {{ name }}  {{ quantity }}x {{ money total }}
{{ /each }}

Método de pagamento: {{ order.payment_method_title }}
Método de entrega: {{ order.shipping_method_title }}

{{ #if order.payment_method_id "pix" }}
Seu PIX foi recebido com sucesso!
{{ /if }}

Total: {{ money order.total }}
Equipe {{ store.name }}
```
