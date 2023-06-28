> This text is aligned to version 2023-06-035.

XeTune is an experimental visualiser and basic editor for multiple microtonal tunings. It runs in a web browser and doesn't need a server. You can use it at [https://johnvalentine.co.uk/app/xetune/app.html](https://johnvalentine.co.uk/app/xetune/app.html)

With XeTune, you can:
- Create new tunings:
  - Equal division tunings within any ratio.
  - Ratios within integer limits.
  - Compose from selected notes in other tunings.
- View many tunings together, over a range of up to four octaves, including an octave of subharmonics.
  - Duplicate tunings.
  - Remove tunings (from the view) and remove notes from tunings.
  - Edit in detail in the JSON Configuration (we don't recommend this, but you can).
  - Select notes among tunings, and:
    - View their intervals, as cents and relative errors to ratios.
    - Copy notes into a new tuning.
- Import .scl (Scala format) files as a tuning, via drag-and-drop.
- Export tunings as .scl files, via download.

# Feature requests and feedback

I'm open to [feature requests](https://github.com/j5v/xetune/labels/enhancement), and most of the backlog is written up as [issues](https://github.com/j5v/xetune/issues).

# Dependencies and data use

XeTune is a client-side web browser app, which has no external code dependencies other than standard browser APIs, no server dependency.

It has the ability to read files that you drop in, interpreting them as `.scl` (Scala) files, and can export `.scl` files as downloads.

The XeTune app does not transmit nor collect your data, but it stores configuration data to localStorage, which can include user-entered data in tunings. Be aware that proprietary browsers, and browser plugins/extensions might read or transmit this data.

# For developers

I structured this prototype project as a monolith closure with published UI methods. Internally, code is grouped by functionalies like reference data, utilities, rendering, tuning calculations, and UI events. Concerns are not as separated as they should be, and I'm aware that there are better ways to organize a project.

The project needs no preprocessing to run, so there is no build process.

The UI is composed using render functions, and is often rendered wholesale to reflect updated state. So far, this is efficient enough to be responsive to large and small changes.