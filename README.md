# DIVEIN

## What is this?

* DIVEIN is a **Toggle-Based** Note-Taking App.
* You don't need to think about formatting your notes anymore.
* You can write notes intuitively and stay focused on what you want to think.

## How to use it?

Access the [Github Pages](https://tamaki-uno.github.io/divein/) to use this.

### Controls

#### Mouse Controls

* Click on **a toggle icon** to *toggle* the visibility of the children of the line.
  * Click on ▶ to *expand* the line.
  * Click on ▼ to *collapse* the line.
* Right-click on **a toggle icon** to show options for the line.
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
  * Click on **Filter** to filter the children of the current line.
  * 
* Drag and drop **a toggle icon** to move the line.
  * You can drag and drop a line to change its position and hierarchy.
* Click on text in a line to edit it.

#### Keyboard Controls

* Use **Tab** to make current line a child of line above.
  * Use **Shift + Tab** to undo this and make current line a sibling of line above.
* Use **Enter** to create a new sibling line below the current line.

## Structure

* **index.html**: The main HTML
* **404.html**: The HTML for redirecting to the index.html with query parameter. ("?page={the path accessed}" )
* **style.css**: The main CSS
* **script.js**: The main JavaScript
* **scripts/**: Contains additional JavaScript files.
* **icons/**: Contains icons used in the app.
  * **add.svg**: **+** icon. ![add.svg](icons/add.svg)
  * **close.svg**: **X** icon <img src="icons/close.svg" alt="close.svg" width="16" height="16">
  * **closed.svg**: **▼** icon
  * 
* **manifest.webmanifest**: The web manifest for the app to be used as a PWA.
* **README.md**: This file.
* **LICENSE**: The license file.

## How to contribute?

You can contribute by opening issues or pull requests on the [GitHub repository](https://github.com/tamaki-uno/divein).
Any contributions are welcome, whether it's fixing bugs, improving documentation, or adding new features.

## License

This project is licensed under the MPL-2.0 License - see the [LICENSE](LICENSE) file for details.

## Contact
