---
title: Get started
description: WordPress plugin that connects events from your site to Pingo Notify for automatic notification delivery.
icon: "wordpress"
---

## Overview

[![Pingo Notify WordPress Plugin Banner](https://ps.w.org/infixs-pingo-notify/assets/banner-1544x500.png?rev=3407499)](https://wordpress.org/plugins/infixs-pingo-notify/)

This **[WordPress plugin](https://wordpress.org/plugins/infixs-pingo-notify/)** integrates your site with **Pingo Notify**, allowing you to send automatic notifications triggered by WordPress events.

---

## What the plugin does

- Connects WordPress to Pingo Notify  
- Captures site events (e.g., WooCommerce)  
- Sends these events to Pingo Notify  
- Allows integration settings directly in the WordPress dashboard  

---

## Required dependency

::warning
For the plugin to work, you need to have an account on **Pingo Notify**.
::

Pingo Notify is the service responsible for processing and sending the messages.

---

## How the plugin works

::info
Basic flow:  
**WordPress → Plugin → Pingo Notify → Message sent**
::

The plugin detects the event in WordPress and sends the information to Pingo Notify, which performs the delivery.

---

## Installation

:::steps
  ::step{title="Install the plugin"}
  Plugins → Add New → Search for **Pingo Notify** → Install and activate
  ::

  ::step{title="Create a Pingo Notify account"}
  Create an account on the Pingo Notify website and choose a plan (you can start with the free one)
  ::

  ::step{title="Connect the plugin"}
  Enter the Pingo Notify credentials in the WordPress dashboard
  ::

  ::step{title="Configure events"}
  Define which site events will generate notifications
  ::
:::

---

## WooCommerce integration

The plugin can capture events such as:

- New order  
- Status change  
- Order completed  

::info
WooCommerce generates the event →  
the plugin sends it to Pingo Notify →  
Pingo Notify triggers the message.
::

---

## Without WooCommerce

It also works on any WordPress site:

- Corporate websites  
- Blogs  
- Landing pages  

Useful for administrative alerts and internal events.

---

## Summary

::info
- The plugin handles the integration  
- Pingo Notify handles the delivery  
- You can start with a free plan
::

With both configured, your site sends notifications automatically.
