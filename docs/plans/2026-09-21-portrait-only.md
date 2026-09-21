# Fixed portrait interface on phones

The user explicitly rejected rotation notices, overlays and blocked gameplay. Keep the existing portrait interface visually fixed when a touch-first phone rotates, without messages, new controls, reloads or state changes. No itch.io package or upload.

Use a portrait-sized stage (swap viewport width/height in landscape) rotated to compensate for the device orientation. Handle both landscape directions using screen.orientation.angle / legacy window.orientation; CSS provides a default while orientation events settle. Rotate the existing native test dialog too. Keep logical layout breakpoints and continuation scroll measurements consistent with the portrait stage. Desktop mouse-first windows remain unchanged. Native OS rotation lock cannot be required across mobile browsers; do not force fullscreen.

Tests: Chromium/Pixel and WebKit/iPhone; both rotation directions, normal and test entry, same logical card geometry/state/resources/history, actual touches, dialog open during rotation, continuation/Padel text fitting, Back and return to portrait. No orientation overlay may exist. Then focused regressions, hashes, review, handoff and existing GitHub Pages publication only.

Direction reference: https://www.w3.org/TR/screen-orientation/#concepts — device angle is counter-clockwise from natural, while positive CSS angles are clockwise. Therefore angle 90 maps to CSS −90, and 270 to +90. Tests must enforce this independently of layout-fit checks.
