# DIVEIN

## What is this?

* DIVEIN is a **Toggle-Based** Note-Taking App.
* You don't need to think about formatting your notes anymore.
* You can write notes intuitively and stay focused on what you want to think.

## How to use it?

Access the [DIVEIN](https://tamaki-uno.github.io/divein/) to use this.

### Controls

#### Mouse Controls

* Click on **a toggle icon** to *toggle* the visibility of the children of the line.
  * Click on <img src="icons/closed.svg" alt="▶" width="16" height="16"> to *expand* the line.
  * Click on <img src="icons/open.svg" alt="▼" width="16" height="16"> to *collapse* the line.
* Click on text in a line to edit it.
* Hover on **a toggle icon** or right-click on a line to show options for the line.
  * Click on **Add Child** to add a child line to the current line.
  * Click on **Add Sibling** to add a sibling line below the current line. (You can also use **Enter** key to do this.)
  * Click on **Delete Line** to delete the current line.
  * Click on **Dive In** to *dive in* to the current line. (The line you clicked will be the *top level* of the page.)
  * Click on **Copy** to copy the current line and its children.
  * Select from **Sort by** to sort the children of the current line.
    * **Default**: Children lines are listed in the order you listed them.
    * **Alphabetical**: Sorts children alphabetically.
    * **Creation Date**: Sorts children by creation date.
    * **Modification Date**: Sorts children by modification date.
    * **Random**: Randomly sorts children.
  * Select from **Filter by** to filter the children of the current line.
    * **Match**: Filters children that match the text you enter.
    * **Creation Date**: Filters children by creation date.
    * **Modification Date**: Filters children by modification date.
  * Select from **Style** to change the style of the current line.
    * **Bold**: Makes the text bold (you can also use **Ctrl + B**).
    * **Italic**: Makes the text italic (you can also use **Ctrl + I**).
    * **Underline**: Underlines the text (you can also use **Ctrl + U**).
    * **Strikethrough**: Strikes through the text (you can also use **Ctrl + K**).
* You can *move* a line by clicking and holding on **the toggle icon** of the line, then dragging it to the desired position.

#### Keyboard Controls

* Use **Tab** to make current line a child of line above.
  * Use **Shift + Tab** to undo this and make current line a sibling of line above.
* Use **Enter** to create a new sibling line below the current line and start editing it.
* Use **Ctrl + Enter** to create a new child line below the current line and start editing it.
* Use **Ctrl + F** to search for text in the page. (Browser's search will be used.)
* Use **Ctrl + H** to replace text in the page.
* Use **Ctrl + S** to save and sync the page to the server.
* Use **Ctrl + P** to download the page. 
* Use **Ctrl + Z** to undo the last action.
  * Use **Ctrl + Y** or **Ctrl + Shift + Z** to redo the last undone action.
* Use **Ctrl + B** to toggle bold style of the current line.
* Use **Ctrl + I** to toggle italic style of the current line.
* Use **Ctrl + U** to toggle underline style of the current line.
* Use **Ctrl + K** to toggle strikethrough style of the current line.
* Use **Ctrl + D** to toggle the visibility of the children of the current line.
* Use **Ctrl + Shift + D** to toggle the visibility of all children of the current line.
* Use **Ctrl + Shift + S** to sort the children of the current line.
* Use **Ctrl + Shift + F** to filter the children of the current line.
* Use **Ctrl + Shift + C** to copy the current line and its children.
  * **Ctrl + C** will copy the text of the current line only. This is a function of your browser System.
  * Also **Ctrl + A** and **Ctrl + V** will work as expected.
* Use **Ctrl + ?** to show the help dialog with all the controls.

## Structure

* **index.html**: The main HTML
* **404.html**: The HTML for redirecting to the index.html with query parameter. ("?page={the path accessed}" )
* **style.css**: The main CSS
* **script.js**: The main JavaScript
* **scripts/**: Contains additional JavaScript files.
* **icons/**: Contains icons used in the app.
  * **add.svg**: **+** icon. <img src="icons/add.svg" alt="add.svg" width="16" height="16">
  * **close.svg**: **X** icon <img src="icons/close.svg" alt="close.svg" width="16" height="16">
  * **closed.svg**: **** icon <img src="icons/closed.svg" alt="closed.svg" width="16" height="16">
  * **filter.svg**: **Filter** icon <img src="icons/filter.svg" alt="filter.svg" width="16" height="16">
  * **loading.svg**: **Loading** icon <img src="icons/loading.svg" alt="loading.svg" width="16" height="16">
  * **open.svg**: **** icon <img src="icons/open.svg" alt="open.svg" width="16" height="16">
  * **sort.svg**: **Sort** icon <img src="icons/sort.svg" alt="sort.svg" width="16" height="16">
* **manifest.webmanifest**: The web manifest for the app to be used as a PWA.
* **README.md**: This file.
* **LICENSE**: The license file.

## How to contribute?

You can contribute by opening issues or pull requests on the [GitHub repository](https://github.com/tamaki-uno/divein).
Any contributions are welcome, whether it's fixing bugs, improving documentation, or adding new features.

## License

This project is licensed under the MPL-2.0 License - see the [LICENSE](LICENSE) file for details.

## Contact
