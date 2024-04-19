# Changelog

## not released

## v0.4.2 (2024-04-19)

- Fix: Display HTML entities in preview #21
- Fix: Images with mime type `image/jpg` are not displayed #22
- Fix: `homepage_url` for Joplin manage plugins

## v0.4.1 (2024-02-17)

- Fix: Increase thumbnail size for better previews, the Joplin zoom level is also taken into account #18
- Add: Option to mark notes as confidential #17

## v0.4.0 (2024-01-25)

> Severeal breaking changes, marked with ⚠️

- Fix: homepage_url for README.md for Manage your plugins in Joplin
- Add: #7 Option to use squared thumbnails
- Add: Additional layout ( [Deatils](README.md#layouts) )
- Add: Option to configure note text line ⚠️
- Add: `{{todoDate}}` added as additional variable
- Removed: CSS overwride settings (Use `userchrome.css` for customization) ⚠️
- Fix: Create a thumbnail for jpeg and png only #13

## v0.3.2 (2024-01-10)

- Optimize: Remove note title from logs
- Fix: #10 Previews are not loaded (white field) if the resource file has not been downloaded

## v0.3.1 (2024-01-09)

- Fix: Path for Plugin discovery website

## v0.3.0 (2024-01-02)

- Fix: #4 Incorrect excerpt on new lines
- Fix: Sometimes the first image was not used for the preview
- Add: Additional variables added, `{{url}}`, `{{createdTime}}` and `{{updatedTime}}` #6
- Improved: Some css changes
- Improved: Regenerate thumbnail on resource change #5

## v0.2.0 (2023-12-28)

- Add: Option for a thumbnail

## v0.1.0 (2023-12-28)

- Add: Info to restart Joplin on settings change
- Add: #2 Display external editing (isWatched) status
- Add: #1 Display and edit ToDos
- Add: Option to overwrite CSS style in plugin settings

## v0.0.2 (2023-12-27)

- Rename plugin

## v0.0.1 (2023-12-27)

- First release
