# SpiderOakMobileClient

## Design documentation

### Default design and icons:
- [Icons](./icons.md)
- [Less variables](./less_variables.md)
- [Less Variables for screens](./less_variables_for_screen.md)

### Changes without brand:

#### How to change an icon?
When you want change a icon, copy the new icon file in **www/img/**.

Check default icons and paths for icon in: [icons list](./icons.md)

#### How to change an less variable?
- First, change variable value in **www/css/less/lib.less**,
- Second, when this variable has difference in platforms change variable value in **www/css/less/themes/<platform>.less**

Check default less variables and platform less variables in: [less variables](./less_variables.md)

### Changes with brand:

#### Available brands
- ONE
- Groups

#### How to create a brand?
- Add folder with brand name in **custom/brands/<new_brand>**
- In this folder you can copy some files for edit and replace default configuration, this possible changes are described in this file: **[elements.json](/custom/elements.json)**
- For example:
  ```json
    {
      "SourceFileName": "menu_hive.png",
      "TargetFolder": "../www/img/spideroak-icons/menu",
      "Format": "80 x 80 PNG image",
      "Purpose": "Hive menu logo",
      "Platforms": ["iOS"]
    }
  ```
  This setting in **[elements.json](/custom/elements.json)** describe this: 'When exists **menu_hive.png** file in **custom/brands/<new_brand>/** with the format **80 x 80 PNG image**, copy this file to **../www/img/spideroak-icons/menu** in **iOS** plataform'
  Check all **[elements.json](/custom/elements.json)** rules in this list: [elements rules](./elements.md)
- When you want change a template html file, copy this file in **custom/brands/<new_brand>/tpl/<template_to_replace>**.
- When you want change icons for a platform, copy the icons in **custom/brands/<new_brand>/res/icon/<platform>/** and **custom/brands/<new_brand>/res/screen/<platform>/**.

#### How to change a brand?
When you have a created brand in brands folder, can run this command: `grunt brand:<brand_name>`
