Use `grunt xliff:*` commands to convert between localization source JSON
files and XLIFF versions in this directory. The XLIFF versions are for
interchange with translation providers.

Usage:

* `grunt xliff:from_json`: overwrite XLIFF files with conversions of the JSON source files in `www/locales`. The resulting XLIFF files are in the same dir as this README.md.
* `grunt xliff:to_json`: conversely, overwrite JSON source files with conversions of XLIFF files. The JSON files are the app l10n sources, in `www/locales`.

Essential notes:

* Keep in mind that all conversions overwrite the target files. Be sure to commit the current targets before invoking a conversion, so all changes can be thoroughly tracked.
* Though the Gruntfile xliff configuration entries are supposed to specify the language targets (e.g., `languages: ["en-US", "en-GB", "es-ES"]`), as of the `grunt-xliff` revision we're currently using (`79d632671a`), that doesn't make a difference - all languages matching the `files` specs are processed. (This is actually suits our needs.)
  * In order to incorporate new languages in the app, `www/i18n.json` needs to be adjusted to include the appropriate JSON target.
