
# Pingo Notify Trigger Extension Guide

This guide is for plugin developers (or AI agents) who want to:

- create new triggers
- register them in Pingo Notify
- modify existing triggers using public hooks

It intentionally focuses only on the extension surface you need.

## 1. Register custom triggers

Pingo Notify exposes this filter to register trigger classes:

- `infixs_pingo_notify_trigger_classes`

Use it from your plugin after plugins are loaded.

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

## 2. Add your trigger group in UI

To show your own category in the trigger selector, use:

- `infixs_pingo_notify_trigger_groups`

```php
add_filter( 'infixs_pingo_notify_trigger_groups', function ( $groups ) {
	$groups[] = [
		'id' => 'myplugin',
		'name' => 'My Plugin',
	];

	return $groups;
} );
```

## 3. Create a trigger class

Create a class that extends `Infixs\PingoNotify\Triggers\Trigger`.

Required fields to set in `__construct()`:

- `$id`: unique ID (used by notifications)
- `$name`: label shown in UI
- `$description`: short description
- `$group_id`: group ID (example: `myplugin`)
- `$type`: `wp_action` or `wp_filter`
- `$hook`: WordPress hook name to listen to
- `$hook_args`: number of hook args
- `$hook_priority`: optional (default is 10)

Minimum methods to implement:

- `transform(...$args)` to build the data payload
- `placeholders()` to expose template variables

Optional methods:

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

## 4. Modify existing triggers with hooks

For any trigger ID, you can hook into these extension points:

- `infixs_pingo_notify_trigger_{trigger_id}_validate`
- `infixs_pingo_notify_trigger_{trigger_id}_transform`
- `infixs_pingo_notify_trigger_{trigger_id}_placeholders`
- `infixs_pingo_notify_trigger_{trigger_id}_form_fields`
- `infixs_pingo_notify_trigger_{trigger_id}_notifications_query`
- `infixs_pingo_notify_trigger_{trigger_id}_notifications`

You can also listen to fired triggers globally:

- `infixs_pingo_notify_trigger_fired`

### Example: change payload of an existing trigger

```php
add_filter( 'infixs_pingo_notify_trigger_woocommerce_new_order_transform', function ( $data, $args ) {
	$data['custom'] = [
		'source' => 'my-plugin',
		'timestamp' => time(),
	];

	return $data;
}, 10, 2 );
```

### Example: add placeholders to an existing trigger

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

### Example: restrict which notifications can fire

```php
add_filter( 'infixs_pingo_notify_trigger_woocommerce_new_order_notifications_query', function ( $query, $args ) {
	// Example: only active notifications already filtered by core query.
	// Add your own conditions here.
	return $query;
}, 10, 2 );
```

## 5. Naming and compatibility recommendations

- Keep trigger IDs stable forever once released.
- Use a plugin prefix in IDs, for example: `myplugin_*`.
- Return an empty array from `transform()` if input is invalid.
- Use `isAvailable()` when your trigger depends on another plugin.
- If your trigger type is `wp_filter`, always preserve expected original filter behavior.

## 6. Quick checklist

- Trigger class extends `Trigger`
- Unique `$id` is defined
- Correct `$hook`, `$hook_args`, and `$type`
- `transform()` and `placeholders()` implemented
- Trigger registered via `infixs_pingo_notify_trigger_classes`
- Optional group added via `infixs_pingo_notify_trigger_groups`
- Existing trigger customizations added via `infixs_pingo_notify_trigger_{id}_*` hooks
