var async = require('async')
	, request = require('request')
	, cheerio = require('cheerio')
	, _ = require('lodash')
	, LoaderItem = require('./LoaderItem')
	, uaStrings = require('./util/uaStrings')
	, http = require('http');

/**
 * Creates a new BulkHtmlLoader instance
 * @param {boolean} verbose
 * @returns {BulkHtmlLoader}
 * @constructor
 */
var BulkHtmlLoader = function(verbose){
    this._verbose = verbose === true; // Enable detailed logging for debug purposes
	this._throttle = 10;
	this._httpTimeout = 1500;
    this._increaseHttpTimeoutOnError = 500;
	this._numRetries = 3;
	this._numErrors = 0;
	this._loaded = 0;
	this._total = 0;
	this._completedUUID = [];
	this._errorCallback = null;
	this._warningCallback = null;
	this._itemLoadCompleteCallback = null;
    this._queue = [];
    return this;
};

/**
 * Static method returns a new LoaderItem. Equivalent to new HtmlLoader.LoaderItem()
 * @param url
 * @param data
 * @returns {LoaderItem}
 */
BulkHtmlLoader.getLoaderItem = function(url, data){
    return new LoaderItem(url, data);
};

BulkHtmlLoader.LoaderItem = LoaderItem;

BulkHtmlLoader.prototype = {

	/**
	 * Starts loading the queue
	 * @param {Array} queue of LoaderItems
	 * @param {function} callback
	 */
	load: function(queue, callback) {

		if(this._total > 0){
            throw new Error('Load can only be called once per instance. To load more queues create a new BulkHtmlLoader instance');
		}

		if(!_.isArray(queue)){
			throw new Error('Array expected for parameter queue');
		}

		if(!queue.length){
            return callback(null, []);
		}

        // Throttle should not be larger than the queue
        if(queue.length < this._throttle){
            this._throttle = queue.length;
        }

        var that = this;

        // Validate objects in the queue
		_.each(queue, function(loaderItem){

			if(!(loaderItem instanceof LoaderItem)){
				throw new Error('Instance of LoaderItem expected in queue');
			}

            loaderItem.setHttpTimeout(that._httpTimeout);
		});

		if(!_.isFunction(callback)){
			throw new Error('Function expected for parameter callback');
		}

		this._total = queue.length;
        this._queue = queue;

        var q = async.queue(function(loaderItem, callback) {

            that._loadItem(loaderItem, function(loaderItem){

                if(!(loaderItem instanceof LoaderItem)){
                    throw new Error('LoaderItem instance expected in callback as first argument');
                }

                if(that._completedUUID.indexOf(loaderItem._uuid) !== -1){
                    throw new Error('LoaderItem callback for ' + loaderItem.getUrl() + ' called twice');
                }

                that._completedUUID.push(loaderItem._uuid);
                q.concurrency = that._throttle;
                callback();
            });
        });

        q.concurrency = this._throttle;

        // Final callback when queue completes
        q.drain = function() {
            callback(null, that._queue);
        };

        q.push(queue);
        return this;
	},

    /**
     * @param val
     * @returns {BulkHtmlLoader}
     */
	setHttpThrottle: function(val){
		this._throttle = val;
        return this;
	},

    /**
     * @param val
     * @returns {BulkHtmlLoader}
     */
	setHttpTimeout: function(val){
		this._httpTimeout = val;
        return this;
	},

    /**
     * @param val
     * @returns {BulkHtmlLoader}
     */
	setNumRetries: function(val){
		this._numRetries = val;
        return this;
	},

	/**
	 * Fired when a single item has successfully loaded
	 * @param {function} callback
	 * @returns {BulkHtmlLoader}
	 */
	onItemLoadComplete: function(callback){
	
		if(!_.isFunction(callback)){
			throw new Error('Function expected for parameter callback');
		}
	
		this._itemLoadCompleteCallback = callback;
		return this;
	},
	
	/**
	 * Fired when a single item retries loading after it has failed, but more attempt are available
	 * @param {function} callback
	 * @returns {BulkHtmlLoader}
	 */
	onWarning: function(callback){
	
		if(!_.isFunction(callback)){
			throw new Error('Function expected for parameter callback');
		}
	
		this._warningCallback = callback;
		return this;
	},
	
	/**
	 * Fired when a single item has finally failed loading and no more attempt are available
	 * @param {function} callback
	 * @returns {BulkHtmlLoader}
	 */
	onError: function(callback){
	
		if(!_.isFunction(callback)){
			throw new Error('Function expected for parameter callback');
		}
	
		this._errorCallback = callback;
		return this;
	},

    /**
     * Return the progress
     * @returns {object}
     */
	getProgress: function(){
		return {
            loaded: this._loaded,
            total: this._total
		}
	},

    /**
     * Return the progress as a string total / loaded e.g "21/221"
     * @returns {string}
     */
    getProgressString: function(){
        return this.getProgress().loaded + '/' + this.getProgress().total;
    },

    /**
     * Return the progress as percent, truncated at two decimal places
     * @returns {number}
     */
    getProgressPercent: function(){
        if(this.getProgress().loaded === 0 || this.getProgress().total === 0){
            return 0;
        }

        var p = (this.getProgress().loaded / this.getProgress().total) * 100;
        return Math.floor(p * 100) / 100;
    },

    /**
     * Returns a String representation of a BulkHtmlLoader instance
     * @returns {string}
     */
	toString: function(){
		return '[Object BulkHtmlLoader], total: ' + this._queue.length + ', loaded: ' + this._loaded + ', errors: ' + this._numErrors;
	},

	/**
	 * @private
	 */
	_loadItem: function(loaderItem, finalCallback){

		var internalLoadErrors = 0,
			callbackInvoked,
			that = this;

		var retryCallback = function(loaderItem){

			if(!(loaderItem instanceof LoaderItem)){
				throw Error('Expected instance of LoaderItem in callback');
			}

			if(callbackInvoked === true){
				throw new Error('Callback invoked twice');
			}

			callbackInvoked = true;

			if(loaderItem.getError()){

				internalLoadErrors++;

                // Reduce http throttle on errors
                if(that._throttle > 1){
                    that._throttle--;
                    that._log('Reduce throttle to ' + that._throttle);
                }

				if(internalLoadErrors < that._numRetries + 1){

					loaderItem.setStatus(LoaderItem.WARNING);
                    that._log('Callback ' + loaderItem.toString());

					if(that._warningCallback){
						return that._warningCallback.call(that, loaderItem, function(loaderItem){
                            loadWithRetry(loaderItem, retryCallback);
						});
					}

					return loadWithRetry(loaderItem, retryCallback);
				}

                // Finally ran out of retries. Flag the load as failed
				loaderItem.setStatus(LoaderItem.ERROR);
                that._log('Callback ' + loaderItem.toString());

				if(that._errorCallback){
					return that._errorCallback.call(that, loaderItem, finalCallback);
				}

				return finalCallback(loaderItem);
			}

			loaderItem.setStatus(LoaderItem.COMPLETE);
            that._log('Callback ' + loaderItem.toString());
            that._loaded++;

			if(that._itemLoadCompleteCallback){
                return that._itemLoadCompleteCallback.call(that, loaderItem, finalCallback);
			}

			finalCallback(loaderItem);
		};

        /**xw
         * Handles a single http request
         * @param loaderItem
         * @param retryCallback
         */
		var loadWithRetry = function(loaderItem, retryCallback){
			
			callbackInvoked = false;
			var hasTimedOut = false;

			var options = {
				url: loaderItem.getUrl(),

                // Attaches a random user agent string to the http request header mimicking a user request from a browser (some hosts will reject requests without a user agent string)
				headers: {
                    'User-Agent': uaStrings.getRandom()
				}
			};

            var timeOutHandler = function(){
                hasTimedOut = true;

                loaderItem.setError({
                    code: 408,
                    errno: http.STATUS_CODES[408]
                });

                loaderItem.increaseHttpTimeout(that._increaseHttpTimeoutOnError);
                return retryCallback(loaderItem);
            };

            var id = setTimeout(timeOutHandler, loaderItem.getHttpTimeout());
            loaderItem.setStatus(LoaderItem.OPEN);

            if(loaderItem.getNumErrors() === 0){
                that._log('Request ' + loaderItem.toString());
            } else{
                that._log('Request (retry ' + loaderItem.getNumErrors() + ') ' + loaderItem.toString());
            }

			request(options, function(error, response, body) {

                // If true, callback has already been fired because of 408 time-out
				if(hasTimedOut){
                    return;
				}

				clearTimeout(id);

				if(error){
					loaderItem.setError(error);
					return retryCallback(loaderItem);
				}
				
				if(response && response.statusCode && response.statusCode > 399){
					
					loaderItem.setError({
						code: response.statusCode,
						errno: http.STATUS_CODES[response.statusCode] || ''
					});
					
					return retryCallback(loaderItem);
				}
				
				var $cheerio = cheerio.load(body || '', {
					normalizeWhitespace: true
				});

                // Removing anything else but HTML
				$cheerio('html').find('script').remove().find('noscript').remove().find('iframe').remove();
				
				loaderItem.setError(null);
				loaderItem.setResult($cheerio);
				retryCallback(loaderItem);
			});
		};
		
		loadWithRetry(loaderItem, retryCallback);
	},

    /**
     * Verbose logging for debugging purposes
     * @param message
     * @private
     */
    _log: function(message){
        if(this._verbose){
            console.log(message);
        }
    }
};

module.exports = BulkHtmlLoader;
