# Bulk HTML Loader

Scrape HTML from thousands of web pages in a single go.

Features:

  - Queueing
  - Automatic retries
  - Graceful error handling
  - Continuous loading on errors
  - Configure maximum number of concurrent HTTP requests, retries and load timeout
  - Automatically reduce the number of concurrent HTTP requests on errors
  - Random user agent string in each HTTP request (lower risk of the remote server rejecting the request)
  - Event driven so you can handle individual warnings, errors and completed loads before the queue completes
  
### Installation
```sh
$ npm install bulk-html-loader --save
```

# Examples

### Basic

```js
   const Loader = require('bulk-html-loader');
   
   // Build the queue
   const queue = [
       'http://google.com',
       'https://www.bing.com',
       'https://www.yahoo.com'
   ];
   
   // Create a BulkHtmlLoader instance
   new Loader()
   
       /**
        * Custom warning callback (optional)
        */
       .onWarning(function(loaderItem, next){
           console.log(this.getProgressString() + ' ' + loaderItem.toString()); // [Object LoaderItem] Warning {code} {description} {url}
           next(loaderItem);
       })
   
       /**
        * Custom error callback (optional)
        */
       .onError(function(loaderItem, next){
           console.log(this.getProgressString() + ' ' + loaderItem.toString()); // [Object LoaderItem] Error {code} {description} {url}
           next(loaderItem);
       })
       
       /**
        * Final callback once the queue completes
        * The result array consists of LoaderItems objects
        */
       .load(queue, function(err, loaderItems){
   
           if(err) throw err;
   
           loaderItems.forEach(function(loaderItem){
               if(loaderItem.getResult()){
                   console.log(loaderItem.toString() + '\nHtml = ' + loaderItem.getResult().html());
               }
           });
       });
```

### Extracting all links from 3 websites

```js
   const Loader = require('bulk-html-loader')
       , _ = require('lodash');
   
   // Build the queue
   const queue = [
       'http://google.com',
       'http://stackoverflow.com',
       'http://www.techrepublic.com'
   ];
   
   // Create a BulkHtmlLoader instance
   new Loader()
   
       /**
        * Custom warning callback (optional)
        */
       .onWarning(function(loaderItem, next){
           console.log(this.getProgressPercent() + '% ' + loaderItem.toString()); // [Object LoaderItem] Error {code} {description} {url}
           next(loaderItem);
       })
   
       /**
        * Custom error callback (optional)
        */
       .onError(function(loaderItem, next){
           console.log(this.getProgressPercent() + '% ' + loaderItem.toString()); // [Object LoaderItem] Error {code} {description} {url}
           next(loaderItem);
       })
   
       /**
        * Individual url load complete callback (optional)
        * Here you can save the result to a database, process the result etc.
        * Or you can just wait the the entire queue to finish and handle all the items in the final callback
        */
       .onItemLoadComplete(function(loaderItem, next){
           console.log(this.getProgressPercent() + '% ' + loaderItem.toString()); // [Object LoaderItem] Error {code} {description} {url}
           next(loaderItem);
       })
   
       /**
        * Final callback once the queue completes
        */
       .load(queue, function(err, loaderItems){
   
           if(err){
               throw err;
           }
   
           _.each(loaderItems, function(loaderItem){
   
               // Only process successful LoaderItems
               if(loaderItem.getStatus() === Loader.LoaderItem.COMPLETE){
   
                   // Results are essentially jQuery objects
                   var $cheerio = loaderItem.getResult();
   
                   // Print out the anchor text for all links on the loaded page
                   $cheerio('a').filter(function() {
                       var text = $cheerio(this).text().trim();
   
                       if(text.length){
                           console.log(text);
                       }
                   });
               }
           });
       });
```

### Get the raw HTML from a LoaderItem

LoaderItem results are cheerio / jQuery objects. This is how you get the raw HTML string:
```js
    loaderItem.getResult().html();
```

### Attach a custom object to each load

In some cases you want to attach specific information to each load.
In below example we are setting a country variable which will be accessible once the load completes.

```js

   var Loader = require('bulk-html-loader')
       , _ = require('lodash');
   
   // Build a queue with arbitrary data objects that is attached to LoaderItem instances
   var queue = [
       new Loader.LoaderItem('http://smh.com.au', {
           country: 'Australia'
       }),
   
       new Loader.LoaderItem('http://google.com', {
           country: 'USA'
       }),
   
       new Loader.LoaderItem('http://techrepublic.com', {
           country: 'USA'
       }),
   
       new Loader.LoaderItem('http://cbs.com', {
           country: 'USA'
       }),
   
       new Loader.LoaderItem('http://thesun.co.uk', {
           country: 'United Kingdom'
       })
   ];
   
   // Create a BulkHtmlLoader instance
   new Loader()
       .load(queue, function(err, loaderItems){
   
           if(err){
               throw err;
           }
   
           // Sort the results after country
           var uk = _.filter(loaderItems, function(loaderItem){
               return loaderItem.getData().country === 'United Kingdom';
           });
   
           var us = _.filter(loaderItems, function(loaderItem){
               return loaderItem.getData().country === 'USA';
           });
   
           var au = _.filter(loaderItems, function(loaderItem){
               return loaderItem.getData().country === 'Australia';
           });
   
           console.log(uk);
           console.log(us);
           console.log(au);
       });
```

### Granular control

For each queue you can define the maximum number of concurrent http requests, timeout and number of retries

```js
    const Loader = require('bulk-html-loader');
    
    const queue = [
        'http://google.com',
        'https://www.google.com/#q=hello',
        'https://www.google.com/#q=nodejs'
    ];
    
    new Loader()
        .setHttpThrottle(10) // Process 10 urls at a time
        .setHttpTimeout(2000) // Retry loads that do not complete after 2 seconds
        .setNumRetries(5) // Should any errors occur, retry 5 times. After this the load is flagged as error and will not have a result
        .load(queue, function(err, loaderItems){
            //   
        });

```


### Serial processing
In this example we are processing each successful request before the entire queue completes. The advantage of this is that we still capture the data in the event that the an error occurs and the queue stops.

```js
const Loader = require('bulk-html-loader')
    , _ = require('lodash');

const queue = [
    'http://google.com',
    'http://stackoverflow.com',
    'http://some-invalid-url-that-should-not-stop-the-processing.com', // If an url cannot load after x attempts it is simply skipped
    'http://www.techrepublic.com'
];

/**
 * In this example we are loading web pages in a serial pattern, applying processing and saving to database then proceeding to the next load in the queue
 * @type {BulkHtmlLoader}
 */
const loader = new Loader(false); // Pass true for verbose logging

    loader.setMaxConcurrentConnections(1);

    /**
     * Individual url load complete callback (optional)
     * Here you can save the result to a database, process the result etc.
     * Or you can just wait the the entire queue to finish and handle all the items in the final callback
     */
    loader.onItemLoadComplete(function(loaderItem, next){
        processResult(
            loaderItem,
            next
        );
    })

    /**
     * Log the overall progress and events to console
     */
    .onChange(function(loaderItem){
        console.log(this.toString() + ' ' + loaderItem.toString()); // [Object BulkHtmlLoader] progress: 1/500, success: 1, warnings: 0, errors: 0, current open connections: 24, max concurrent connections: 25
    })

    /**
     * Final callback once the queue completes
     */
    .load(queue, function(err, loaderItems){

        if(err){
            throw err;
        }

        console.log('*** PROCESSING COMPLETE ***');
    });

/**
 * Emulating processing the HTML result (e.g extracting text and links from a website)
 * @param {LoaderItem} loaderItem
 * @param {function} next
 */
const processResult = function(loaderItem, next){

    const url = loaderItem.getUrl(),
        html = loaderItem.getResult().html();

    console.log('Processing result from: ' + loaderItem.getUrl());

    // Emulating an async event
    setTimeout(function(){
        saveToDB(loaderItem, html, next);
    }, 1000);
};

/**
 * Emulating saving a processed result to a database
 * @param {LoaderItem} loaderItem
 * @param {*} result - the data you are saving to DB
 * @param {function} next
 */
const saveToDB = function(loaderItem, result, next){

    console.log('Saving result to database from: ' + loaderItem.getUrl());

    // Emulating an async event (think database call)
    setTimeout(function(){
        next(loaderItem);
    }, 1000);
};

```

### Handling rejected http requests
When loading hundreds or even thousands of pages from the same host eventually the requests are bound to be rejected. This happens for a number of reasons, typically because the host has a maximum number of requests per IP address per time unit.
I've tested the tool and have loaded 20,000+ pages from the same host, but only one request at a time. It took 8 hours but completed without any errors or warnings. Just go easy and set the http throttle to 1:
```js
myLoader.setHttpThrotte(1);
```

### VPN
If you need to load large quantities of pages from the same host I recommend doing so behind a VPN and switch IP from time to time.
If one IP has been blacklisted from the host, you just switch country and start again.

### Database integration
If you're serious about loading large quantities of data from other websites you need some kind of persistent storage to keep track of which loads were successful and which were not.
This way, and if anything goes haywire and the loader stops, you can restart the script from where you left off without any gaps in your data.

If you have this need flick me an email and I can give an example written in MongoDB.

### Unit tests
Check out the repo and run the tests:
```sh
npm test 
```

### Examples
Check out the repo and run the examples:
```sh
node examples/basic
node examples/advanced
node examples/customObject
```

### Limitations
When loading HTML pages anything that is not HTML (scripts, css, iframes, noscript etc) is stripped away.
If this bothers you please create an issue at https://github.com/ChristianRich/bulk-html-loader/issues

### Legalities
I'm a software engineer and don't know the legalities around scraping contents from websites. Just be aware that you might be in violation with the website's terms of use. If you republish the contents you are likely to be in violation with copyright laws as well.
If you do dodgy things with this software and get nasty letters from lawyers don't come knocking on my door! Use responsibly.

### My blog
[http://chrisrich.io](http://chrisrich.io)

License
----

MIT
