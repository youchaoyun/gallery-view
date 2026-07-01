# @youchaoyun/plugin-gallery-view

English | [简体中文](./README.zh-CN.md)

</div>

`@youchaoyun/plugin-gallery-view` is a NocoBase gallery view block plugin used to display multiple data records as image card carousels. It is suitable for product showcases, case studies, portfolio browsing, image-text content navigation, and similar scenarios.

The current version supports three display modes: `Effect cover flow`, `Thumbs`, and `Vertical`, and supports opening a record detail popup after clicking an item.

## Features

- Supports three gallery layout modes
  - `Effect cover flow`
  - `Thumbs`
  - `Vertical`
- Supports field mapping for cover, title, and description
- Supports attachment fields as cover image sources
- Supports automatically appending query `appends` for relation-based cover fields
- Supports appearance configuration
  - Card gap
  - Display count
  - Image fit
  - Carousel interval
- Supports restoring default appearance settings
- Supports automatically switching to compact layout when the container size becomes smaller
  - Automatically hides descriptions
  - Automatically adjusts visible card count and spacing
  - Placeholder text is automatically hidden in smaller sizes
- Supports opening the detail popup through `openView` after clicking an item
- Supports using built-in mock data preview when no data source is configured
- Supports other plugins extending field interfaces available for `Cover field`

## Applicable Scenarios

- Product gallery display
- Portfolio carousel browsing
- Image-text case list display
- Carousel-style content navigation
- Multi-record visual display with cover images

## Block Description

The plugin registers one block:

- Block name: `Gallery view`
- Chinese label: `画廊视图`

This block is used to display multiple data records and renders gallery content based on the current query result of the selected data source.

## Configuration

The gallery view block mainly includes the following configuration groups.

### 1. Field mapping

Used to specify the field sources required for gallery display.

Basic fields:

- `Cover field`
  - Used to display the cover image of each record
  - Supports attachment fields by default
  - When the field is a relation field, the required resource query `appends` are automatically added
- `Title field`
  - Used to display the gallery title
- `Description field`
  - Used to display the gallery description content

Notes:

- Field mapping supports variable expressions in the `ctx.collection.xxx` format
- Cover field values support reading image addresses from arrays, objects, or strings
- When no cover image is found, a placeholder image is displayed

### 2. Appearance

Used to control the visual style and carousel behavior of the gallery.

- `Layout mode`
  - Controls the gallery layout mode
  - Available values:
    - `Effect cover flow`
    - `Thumbs`
    - `Vertical`
- `Card gap`
  - Controls the spacing between cards
- `Display count`
  - Controls the default number of visible items
  - When the block is too narrow or too short, the plugin prioritizes image presentation, so the actual value may not strictly match this setting
- `Image fit`
  - Controls how the image fills the card
  - Available values:
    - `cover`
    - `contain`
    - `fill`
    - `none`
- `Carousel interval`
  - Controls the autoplay interval
  - `0` means autoplay is disabled
- `Restore default`
  - Restores the default appearance settings with one click

Default appearance settings:

```ts
{
  layoutMode: 'effectCoverFlow',
  cardGap: 16,
  displayCount: 4,
  imageFit: 'cover',
  carouselInterval: 3000,
}
```

## Layout Mode Description

### Effect cover flow

This mode uses a cover flow effect to display the current gallery content and is suitable for scenarios that emphasize the central visual item.

Current behavior:

- The center card is highlighted
- Supports autoplay
- Supports clicking the image-text information area below to open the detail popup
- Automatically switches to compact mode when the block height becomes smaller
  - Reduces the number of visible cards
  - Shrinks card spacing
  - Hides description content

### Thumbs

This mode consists of a main image area and a bottom thumbnail area, and is suitable for scenarios where users need to switch images quickly while browsing.

Current behavior:

- The main image supports carousel switching
- The bottom thumbnails support linked positioning
- The main image overlays title and description information
- Clicking the main image card opens the detail popup

### Vertical

This mode displays multiple records as vertically scrolling carousel cards and is suitable for continuous browsing in taller areas.

Current behavior:

- Vertical scrolling carousel
- Supports mouse wheel switching
- Title and description are overlaid on the card cover image
- Clicking the card opens the detail popup
- Automatically switches to compact layout when the height becomes smaller

## Item Click Interaction

The plugin registers an item click event:

- Event name: `itemClick`

By default, a built-in `popupSettings` flow is provided, and `openView` is used to open the detail popup when an item is clicked.

Notes:

- When a gallery item is clicked, `filterByTk` is generated based on the current record primary key
- Route navigation is disabled in the popup by default to avoid failing to trigger the popup event again on repeated entry

## Preview

### Effect cover flow Example

![Effect cover flow Example](docs/image.png)

### Thumbs Example

![Thumbs Example](docs/image-1.png)

### Vertical Example

![Vertical Example](docs/image-2.png)

### Gallery Settings Example

![Gallery Settings Example](docs/image-3.png)

## Preview Without a Data Source

If the block has not been configured with a data source yet, the plugin uses built-in mock data for display so the style can be previewed in design mode.

The default mock data includes:

- `title`
- `description`
- `cover`

## Extensibility

By default, the plugin only treats `attachment` as an available field interface for `Cover field`.

If other plugins need to extend the interface types that can be used as cover fields, they can call the client plugin instance:

```typescript
// In client/plugin.tsx, multipleEntryModesAttachment is the type to register.
  const galleryViewPlugin = this.app.pm.get<any>('@youchaoyun/plugin-gallery-view');
  galleryViewPlugin?.registerGalleryCoverFieldInterfaces?.(['multipleEntryModesAttachment']);
```

Notes:

- Duplicate registrations are removed automatically internally
- Registered interfaces participate in the available selection range of `Cover field`

## Dependency Requirements

The plugin declares the following dependency:

- `swiper`

The plugin declares the following `peerDependencies`:

- `@nocobase/client: 2.x`
- `@nocobase/server: 2.x`
- `@nocobase/test: 2.x`

`dependencies`：

- `swiper: ^12.1.3`

## Summary of Implemented Capabilities

The capabilities implemented and reflected in this README include:

- Gallery view block registration
- Field mapping for cover, title, and description
- Switching between three layout modes
- Autoplay configuration
- Image fit configuration
- Compact layout adaptation
- Adaptive hiding of placeholder text
- Automatic query appending for relation-based cover fields
- Item click popup
- Preview without a data source
- Cover field interface extension registration

## Notes

- `Cover field` supports attachment fields by default; other field interfaces need to be registered separately
- When the cover field is mapped to a relation field, the plugin automatically appends resource query fields and refreshes the resource
- `Display count` is automatically adjusted based on container size in compact layout, and may not strictly follow the configured value
- When the block height or width becomes smaller, the plugin automatically hides part of the description to prioritize image presentation
- `Carousel interval` set to `0` disables autoplay

## Community And Documentation

### Noco Plugin Community

You are welcome to scan the QR code to join the Noco plugin community for discussions about NocoBase plugin development, plugin usage, and enterprise extension practices.

![Noco Plugin Community](docs/wxchat.png)

If the QR code has expired, you can use the "More Plugins" page below to contact us for the latest community entry.

## More Plugins

Youchao Digital Intelligence continues to build enterprise-grade NocoBase plugins and extension capabilities. For more plugins, please see:

[More NocoBase Plugin Extensions](https://docs.youchaoyun.com/cn/infrastructure/nocobase_plugin_extension/)
