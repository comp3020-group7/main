# main

## Contributors Group 7
Jian Yang (yangj18@myumanitoba.ca)
YaWen Huang (huangyw@myumanitoba.ca)
Rayan Kashif (kashifm@myumanitoba.ca)
Anna Pavlova (sholokh1@myumnaitoba.ca)
Syed Abraham Ahmed (ahmeda16@myumanitoba.ca)

## Project Structure

### Folder structure
There are only 3 places for files currently,
- root folder for the README.md .gitignore and the html files
- css folder where the css style files are along with the palette.css and a swatch of Coastal Terrain
- images folder for any images that we might need throughout the website .pngs are easier to insert since they have transparent backgrounds

### html file layout
The files are one per page, any time a button that takes a user to a diffirent page is clicked a diffirent html file is loaded
The scripts for each page will likely be unique, if that changes we can create a scripts folder but fornow they are inside of each individual html file at the bottom of <body> 

### css file layout
To keep colouring consistent accross the website we should use the palette.css file to reference colours we use, only thing it needs is 
```
@import url("palette.css");
```
at the top of the css file you are using the pallete in and 
```
var(--colour-text);
```
when ever you reference a variable, the names have these weird -- infront, it breaks without it :(

### transfering data between pages
So far session storage has been the best for between page transfers, its basically a json file, theres a small demo on the login page for when clicking into dashboard.
localstorage can be used for saving data when operating within just one html file, be careful to back data up into session storage if you want it to be persistent between pages.
