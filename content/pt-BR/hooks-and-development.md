---
title: Hooks e Desenvolvimento
description: Estenda o plugin WordPress do Pingo Notify com gatilhos, grupos e hooks personalizados.
icon: code
---

Este guia foi feito para desenvolvedores de plugins que querem estender o plugin WordPress do Pingo Notify.

Você pode usar esta página para:

- Criar novos gatilhos
- Registrar gatilhos no Pingo Notify
- Modificar gatilhos existentes por meio de hooks públicos

---

## Registrar gatilhos personalizados

Use o filtro `infixs_pingo_notify_trigger_classes` para registrar suas classes de gatilho.

Faça esse carregamento depois que os plugins do WordPress estiverem prontos.

```php
<?php

namespace Vendor\MyPlugin\Pingo;

defined( 'ABSPATH' ) || exit;

use Vendor\MyPlugin\Pingo\Triggers\MyOrderPaidTrigger;

class PingoNotifyExtension {
	public function __construct() {
		add_action( 'plugins_loaded', [ $this, 'boot' ] );
	}

	public function boot() {
		add_filter( 'infixs_pingo_notify_trigger_classes', [ $this, 'registerTriggers' ] );
	}

	public function registerTriggers( $triggers ) {
		$triggers[] = new MyOrderPaidTrigger();
		return $triggers;
	}
}
```

---

## Adicionar um grupo personalizado de gatilhos

Se você quiser exibir seus gatilhos em uma categoria própria na interface, use o filtro `infixs_pingo_notify_trigger_groups`.

```php
add_filter( 'infixs_pingo_notify_trigger_groups', function ( $groups ) {
	$groups[] = [
		'id' => 'myplugin',
		'name' => 'My Plugin',
	];

	return $groups;
} );
```

---

## Criar uma classe de gatilho

Crie uma classe que estenda `Infixs\PingoNotify\Triggers\Trigger`.

### Propriedades obrigatórias

Defina estas propriedades no `__construct()`:

- `$id`: identificador único do gatilho usado pelas notificações
- `$name`: rótulo exibido na interface
- `$description`: descrição curta do gatilho
- `$group_id`: identificador do grupo, como `myplugin`
- `$type`: `wp_action` ou `wp_filter`
- `$hook`: nome do hook do WordPress que será ouvido
- `$hook_args`: número de argumentos do hook
- `$hook_priority`: prioridade opcional, com padrão `10`

### Métodos obrigatórios

- `transform(...$args)`: monta o payload enviado ao Pingo Notify
- `placeholders()`: retorna as variáveis disponíveis no template

### Métodos opcionais

- `validate(...$args)`
- `formFields()`
- `examples()`
- `isAvailable()`
- `notificationsQueryBuilder(...$args)`

```php
<?php

namespace Vendor\MyPlugin\Pingo\Triggers;

use Infixs\PingoNotify\Triggers\Trigger;

defined( 'ABSPATH' ) || exit;

class MyOrderPaidTrigger extends Trigger {
	public function __construct() {
		$this->id = 'myplugin_order_paid';
		$this->name = __( 'Order Paid', 'my-plugin' );
		$this->description = __( 'Fires when an order is paid in My Plugin.', 'my-plugin' );
		$this->group_id = 'myplugin';
		$this->type = 'wp_action';
		$this->hook = 'myplugin_order_paid';
		$this->hook_args = 2;
	}

	protected function validate( ...$args ) {
		$order_id = $args[0] ?? 0;
		return ! empty( $order_id );
	}

	protected function transform( ...$args ) {
		$order_id = $args[0] ?? 0;
		$customer = $args[1] ?? [];

		return [
			'order' => [
				'id' => (int) $order_id,
			],
			'customer' => [
				'name' => $customer['name'] ?? '',
				'phone' => $customer['phone'] ?? '',
			],
		];
	}

	protected function placeholders() {
		return [
			[ 'path' => 'order.id', 'name' => 'Order ID', 'type' => 'number', 'description' => 'Order identifier' ],
			[ 'path' => 'customer.name', 'name' => 'Customer Name', 'type' => 'string', 'description' => 'Customer full name' ],
			[ 'path' => 'customer.phone', 'name' => 'Customer Phone', 'type' => 'string', 'description' => 'Customer phone number' ],
		];
	}
}
```

---

## Modificar gatilhos existentes com hooks

Para qualquer ID de gatilho, o Pingo Notify expõe estes pontos de extensão:

- `infixs_pingo_notify_trigger_{trigger_id}_validate`
- `infixs_pingo_notify_trigger_{trigger_id}_transform`
- `infixs_pingo_notify_trigger_{trigger_id}_placeholders`
- `infixs_pingo_notify_trigger_{trigger_id}_form_fields`
- `infixs_pingo_notify_trigger_{trigger_id}_notifications_query`
- `infixs_pingo_notify_trigger_{trigger_id}_notifications`

Você também pode escutar globalmente quando qualquer gatilho for disparado:

- `infixs_pingo_notify_trigger_fired`

### Exemplo: alterar o payload de um gatilho existente

```php
add_filter( 'infixs_pingo_notify_trigger_woocommerce_new_order_transform', function ( $data, $args ) {
	$data['custom'] = [
		'source' => 'my-plugin',
		'timestamp' => time(),
	];

	return $data;
}, 10, 2 );
```

### Exemplo: adicionar placeholders a um gatilho existente

```php
add_filter( 'infixs_pingo_notify_trigger_woocommerce_new_order_placeholders', function ( $placeholders ) {
	$placeholders[] = [
		'path' => 'custom.source',
		'name' => 'Custom Source',
		'type' => 'string',
		'description' => 'Data injected by My Plugin',
	];

	return $placeholders;
} );
```

### Exemplo: restringir quais notificações podem ser disparadas

```php
add_filter( 'infixs_pingo_notify_trigger_woocommerce_new_order_notifications_query', function ( $query, $args ) {
	return $query;
}, 10, 2 );
```

---

## Recomendações

- Mantenha os IDs dos gatilhos estáveis depois do release
- Use um prefixo do plugin nos IDs, como `myplugin_*`
- Retorne um array vazio em `transform()` quando a entrada for inválida
- Use `isAvailable()` quando seu gatilho depender de outro plugin
- Se o tipo do gatilho for `wp_filter`, preserve o comportamento original do filtro

---

## Checklist rápido

- Sua classe de gatilho estende `Trigger`
- Um `$id` único foi definido
- `$hook`, `$hook_args` e `$type` estão corretos
- `transform()` e `placeholders()` foram implementados
- O gatilho foi registrado com `infixs_pingo_notify_trigger_classes`
- O grupo personalizado foi registrado com `infixs_pingo_notify_trigger_groups`, quando necessário
- Customizações de gatilhos existentes usam hooks `infixs_pingo_notify_trigger_{id}_*`
