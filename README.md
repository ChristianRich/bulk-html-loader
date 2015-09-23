# Bulk HTML Loader

Scrape HTML from thousands of web pages in a single go.

Supports:

  - Queueing
  - Multiple retries
  - Graceful error handling
  - Continous loading on errors (don't stop the queue just because some urls fail) 
  - Set the maximum number of concurrent HTTP requests (default is 10)
  - Set the maximum number of retries (default is 3)
  - Set the maximum timeout per load (default is 1500 ms)
  - On http timeout errors, increase the timeout and try again
  
# Example

```js
// Each http request is encapsulated in a LoaderItem instance
var queue = [
    new Loader.LoaderItem('http://google.com'),
    new Loader.LoaderItem('https://www.google.com/#q=hello'),
    new Loader.LoaderItem('https://www.google.com/#q=nodejs')
];

// Create a BulkHtmlLoader instance and start the queue
new Loader()
    .onError(function(loaderItem, proceed){
        console.log(loaderItem.getStatus() + ' ' + loaderItem.getError().code + ' ' + loaderItem.getError().errno + ' ' + loaderItem.getUrl());
        proceed(loaderItem);
    })
    .onWarning(function(loaderItem, proceed){
        console.log(loaderItem.getStatus() + ' ' + loaderItem.getError().code + ' ' + loaderItem.getError().errno + ' ' + loaderItem.getUrl());
        proceed(loaderItem);
    })
    .load(queue, function(err, loaderItems){

        if(err){
            throw err;
        }

        _.each(loaderItems, function(loaderItem){

            var htmlRes;

            if(loaderItem.getResult()) {
                var cheerio = loaderItem.getResult();
                console.log(cheerio.html())
            }
        });
    });
};
```
### Example extracting all links from 3 websites

```js
var queue = [
    new Loader.LoaderItem('http://google.com'),
    new Loader.LoaderItem('http://stackoverflow.com'),
    new Loader.LoaderItem('http://www.techrepublic.com')
];

new Loader()
    .onError(function(loaderItem, proceed){
        console.log(loaderItem.getStatus() + ' ' + loaderItem.getError().code + ' ' + loaderItem.getError().errno + ' ' + loaderItem.getUrl());
        proceed(loaderItem);
    })
    .onWarning(function(loaderItem, proceed){
        console.log(loaderItem.getStatus() + ' ' + loaderItem.getError().code + ' ' + loaderItem.getError().errno + ' ' + loaderItem.getUrl());
        proceed(loaderItem);
    })
    .onItemLoadComplete(function(loaderItem, proceed){
        // Do some processing here, like Mongo DB saving or any other async task
        proceed(loaderItem);
    })
    .load(queue, function(err, loaderItems){

        if(err){
            throw err;
        }

        _.each(loaderItems, function(loaderItem){

            var $cheerio = loaderItem.getResult();
            // Print out the anchor text for all links on the loaded page
            if($cheerio){
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

### Installation

```sh
$ npm install bulk-html-loader --save
```

License
----

MIT
