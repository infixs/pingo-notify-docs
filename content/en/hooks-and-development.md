---
title: Hooks and Development
description: Extend the Pingo Notify WordPress plugin with custom triggers, groups, and hooks.
icon: code
---

This guide is for plugin developers who want to extend the Pingo Notify WordPress plugin.

You can use it to:

- Create new triggers
- Register your triggers in Pingo Notify
- Modify existing triggers through public hooks

---

## Register custom triggers

Use the `infixs_pingo_notify_trigger_classes` filter to register your trigger classes.

Load the registration after WordPress plugins are ready.

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

## Add a custom trigger group

If you want your triggers to appear under a dedicated category in the UI, use the `infixs_pingo_notify_trigger_groups` filter.

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

## Create a trigger class

Create a class that extends `Infixs\PingoNotify\Triggers\Trigger`.

### Required properties

Set these properties in `__construct()`:

- `$id`: unique trigger ID used by notifications
- `$name`: label shown in the interface
- `$description`: short description of the trigger
- `$group_id`: group ID such as `myplugin`
- `$type`: `wp_action` or `wp_filter`
- `$hook`: WordPress hook name to listen to
- `$hook_args`: number of hook arguments
- `$hook_priority`: optional priority, default is `10`

### Required methods

- `transform(...$args)`: builds the payload sent to Pingo Notify
- `placeholders()`: returns the available template variables

### Optional methods

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

## Modify existing triggers with hooks

For any trigger ID, Pingo Notify exposes these extension points:

- `infixs_pingo_notify_trigger_{trigger_id}_validate`
- `infixs_pingo_notify_trigger_{trigger_id}_transform`
- `infixs_pingo_notify_trigger_{trigger_id}_placeholders`
- `infixs_pingo_notify_trigger_{trigger_id}_form_fields`
- `infixs_pingo_notify_trigger_{trigger_id}_notifications_query`
- `infixs_pingo_notify_trigger_{trigger_id}_notifications`

You can also listen globally when any trigger is fired:

- `infixs_pingo_notify_trigger_fired`

### Example: change the payload of an existing trigger

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
	return $query;
}, 10, 2 );
```

---

## Recommendations

- Keep trigger IDs stable after release
- Use a plugin prefix in your IDs, such as `myplugin_*`
- Return an empty array from `transform()` when the input is invalid
- Use `isAvailable()` when your trigger depends on another plugin
- If your trigger type is `wp_filter`, preserve the original filter behavior

---

## Quick checklist

- Your trigger class extends `Trigger`
- A unique `$id` is defined
- `$hook`, `$hook_args`, and `$type` are correct
- `transform()` and `placeholders()` are implemented
- The trigger is registered with `infixs_pingo_notify_trigger_classes`
- The custom group is registered with `infixs_pingo_notify_trigger_groups` when needed
- Existing trigger customizations use `infixs_pingo_notify_trigger_{id}_*` hooks
