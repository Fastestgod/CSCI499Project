# CSCI499Project: PriceWatch

As time moves forward, the world of online shopping continues to grow with more and more people transitioning to the internet as their primary source of procuring their most wanted items. It’s much easier to click a few buttons and have a package go straight to your doorstep rather than physically traveling to a store to get it. At the same time however, businesses and companies have exploited this fact by deliberately increasing prices of popular items in an attempt to get more money than they usually would in-person. Prices that are marked on sale are likely to be the same regular retail price, and only a few people out of the masses can actually tell when they’re being scammed. 

PriceWatch aims to address this problem by gathering the price of an item through multiple different storefronts and displaying the best price available to the user. With PriceWatch, the user will be able to input whatever item they’re interested in through a search bar and the app will display prices that are regularly updated through set intervals in real-time. 

## Price Retrieval 

PriceWatch keeps track of a product's price with the simple click of a button. After entering your URL, it will be entered into a list that you can access. Upon clicking your item, you will be able to see it with it's price updating in real-time at a set interval. 

Current websites supported:

* Amazon
* Best Buy
* Nike
* Home Depot
* Walgreens
* Sam's Club*
  
IMPORTANT: In order for the app to properly generate the product page and scrape the details, you MUST ensure that the urls entered for the supported sites are product page urls. To know if you're on the product page, for all the supported sites you can see the image on the left side, the title next to it and the price below it. 

*Sam's Club product page urls will not work if shipping is not available. We made this decision because PriceWatch is first and foremost an 'Online' price tracker. 

## URL Tracking 

With each url you enter, PriceWatch will save your query to a local backend database that's accessible through the "Tracked Products" link in the navigation bar. You are able to delete entries using the delete button and sort them with 4 different sorting options. There is also a search bar that will dynamically filter the tracked products in the list in real-time depending on the user input. 

## Price History and Display

Every product entered, including those entered with the "Add Store" button on the product page, are updated through a set-interval. Each update is documented in a visible list and below the list there is a price chart rendered that provides an easy to see display of the updated prices generated in the price history.

## UI Design

PriceWatch has a very friendly UI design so even the most technologically illerate people can use the website with ease. There is also a dark mode toggle button at the right of the navigation bar that you can turn on at anytime to provide an easier viewing experience on your eyes if you want that option.

## How to Run and Start the Server

1. Clone this repo
2. Navigate to its directory 
3. Install dependendies if needed:
   * `npm i express`
   * `npm i node-cron`
   * `npm i ejs`
4. Start server using command `node app.js`
5. Access the website in your browser at `http://localhost:3000`
