# CSCI499Project: PriceWatch

As time moves forward, the world of online shopping continues to grow with more and more people transitioning to the internet as their primary source of procuring their most wanted items. It’s much easier to click a few buttons and have a package go straight to your doorstep rather than physically traveling to a store to get it. At the same time however, businesses and companies have exploited this fact by deliberately increasing prices of popular items in an attempt to get more money than they usually would in-person. Prices that are marked on sale are likely to be the same regular retail price, and only a few people out of the masses can actually tell when they’re being scammed. 

PriceWatch aims to address this problem by gathering the price of an item through multiple different storefronts and displaying the best price available to the user. With PriceWatch, the user will be able to input whatever item they’re interested in through a search bar and the app will display prices that are regularly updated through set intervals in real-time. 

## Price Retrieval 

PriceWatch keeps track of a product's price with the simple click of a button. After entering your URL, it will be entered into a list that you can access. Upon clicking your item, you will be able to see it with it's price updating in real-time at a set interval. 

Current websites supported:

* Amazon

## How to Run and Start the Server

1. Clone this repo
2. Navigate to its directory 
3. Install dependendies if needed:
   * `npm i express`
   * `npm i node-cron`
   * `npm i ejs`
4. Start server using command `node index.js`
5. Access the website in your browser at `http://localhost:3000`