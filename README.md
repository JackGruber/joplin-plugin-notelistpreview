<!-- markdownlint-disable MD033 -->
<!-- markdownlint-disable MD028 -->
<!-- markdownlint-disable MD007 -->
<!-- markdownlint-disable MD045 -->

# Joplin note list preview

A plugin to add a previw to the note list.

<img src=img/main.png>

<!-- prettier-ignore-start -->

<!-- TOC depthfrom:2 orderedlist:false -->

- [Installation](#installation)
    - [Automatic](#automatic)
    - [Manual](#manual)
- [Usage](#usage)
- [Plugin options](#plugin-options)
- [Examples with settings](#examples-with-settings)
    - [Date and Tags](#date-and-tags)
    - [Thumbnail right](#thumbnail-right)
- [Changelog](#changelog)

<!-- /TOC -->

<!-- prettier-ignore-end -->

## Installation

### Automatic

- Go to `Tools > Options > Plugins`
- Search for `Note list (Preview)`
- Click Install plugin
- Restart Joplin to enable the plugin

### Manual

- Download the latest released JPL package (`io.github.jackgruber.notelistpreview.jpl`) from [here](https://github.com/JackGruber/joplin-plugin-notelistpreview/releases/latest)
- Close Joplin
- Copy the downloaded JPL package in your profile `plugins` folder
- Start Joplin

## Usage

The new note list view can be activated under `View > Note list style > Preview`.
<img src=img/enable.png>

## Plugin options

Settings for the plugin, accessible at `Tools > Options > Note overview`.
Joplin must be restarted after changing settings!

## Examples with settings

### Date and Tags

<img src=img/example_tag.png>

| Setting | Value |
| ------- | ----- |
| Note excerpt | 115 |
| Last line | {{tags}} |

### Thumbnail right

<img src=img/example_thumbnail_right.png>

| Setting | Value |
| ------- | ----- |
| Thumbnail | Right |
| Note excerpt | 100 |

## Changelog

See [Changelog](CHANGELOG.md)
