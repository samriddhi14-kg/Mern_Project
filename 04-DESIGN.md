# UI and visual design guide

## 1. Visual direction
Use a dark, warm, food-focused interface. Avoid pastel colours, pale backgrounds, washed-out gradients, and generic "AI dashboard" styling. The interface should feel like a real local food business: bold photography, strong typography, clear prices, and obvious actions.

## 2. Colour tokens
| Token | Hex | Use |
|---|---|---|
| Background | `#11100F` | Main page background |
| Surface | `#1B1917` | Cards, nav, panels |
| Raised surface | `#25211E` | Inputs, hover surfaces |
| Primary accent | `#F05A28` | Main buttons, active states |
| Accent hover | `#D9471B` | Button hover |
| Text | `#F7F2EC` | Main text |
| Muted text | `#B6AAA0` | Secondary text |
| Border | `#3A332E` | Dividers and card borders |
| Success | `#3E9B68` | Delivered / success |
| Warning | `#D99A35` | Preparing / attention |
| Danger | `#D94A42` | Cancelled / destructive |

Use accent colour sparingly. Do not make every element orange. Maintain readable contrast.

## 3. Typography
Use a strong sans-serif family available locally or a common system stack:
`Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
Use large bold headings, medium-weight card titles, and tabular numerals for prices where possible. Do not depend on a remote font to render the site.

## 4. Customer pages
### Home/menu
- Dark navigation bar with text logo.
- Hero section with a strong food photograph and concise headline.
- Category chips with clear active state.
- Search field.
- Responsive food grid (1 column mobile, 2 tablet, 3–4 desktop).
- Food card: local image, name, short description, price in NPR, availability, Add button.
- Cart count visible in navigation.

### Food detail
- Large food image, title, description, price, quantity selector, Add to Cart button.
- Show unavailable state clearly.

### Cart and checkout
- Cart rows show thumbnail, item name, unit price, quantity controls, line total, remove action.
- Checkout shows delivery name, phone, full address, optional instructions.
- Order summary displays subtotal, delivery fee, total.
- State COD clearly; no fake online payment UI.

### My orders
- Each order shows order number, placed date, total, and current status.
- Detail page shows a simple vertical timeline of status history with timestamps.
- Status text should be understandable: Placed, Confirmed, Preparing, Packed, Out for delivery, Delivered, Cancelled.

## 5. Admin panel
- Separate admin layout with left sidebar on desktop and compact menu on mobile.
- Dashboard summary cards: Users, Foods, New Orders, In Progress.
- Tables for foods, users, and orders; on mobile use stacked cards or horizontal scrolling.
- Order detail page should make customer phone/address and order contents easy to scan.
- Status action buttons should show only valid next actions. Ask for confirmation before cancellation.
- Use clear empty states, pagination, loading indicators, and success/error messages.

## 6. Shared component behaviour
- Buttons have default, hover, focus, disabled, and loading states.
- Forms have visible labels and inline validation messages.
- Images use consistent aspect ratios and `object-fit: cover`.
- Use a skeleton or spinner during loading.
- Do not rely on colour alone to communicate order status; always show status text.

## 7. Responsive breakpoints
- Mobile: up to 640px.
- Tablet: 641–1024px.
- Desktop: above 1024px.
- Keep tap targets comfortable and prevent horizontal overflow.
