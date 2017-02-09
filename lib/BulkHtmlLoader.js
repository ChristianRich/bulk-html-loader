const async = require('async')
	, request = require('request')
	, cheerio = require('cheerio')
	, _ = require('lodash')
	, LoaderItem = require('./LoaderItem')
	, uaStrings = require('./util/uaStrings')
	, http = require('http')
    , events = require('events');

/**
 * Creates a new BulkHtmlLoader instance
 * @param {boolean=} verbose
 * @returns {BulkHtmlLoader}
 * @constructor
 */
const BulkHtmlLoader = function(verbose){
    this._verbose = verbose === true; // Enable detailed logging for debug purposes
	this._maxConcurrentConnections = 10;
    this._reduceConnectionsOnError = false;
	this._httpTimeout = 5000;
    this._increaseHttpTimeoutOnError = 1000;
	this._maxRetries = 3;
	this._queueLen = 0;
	this._completedUUID = [];
	this._errorCallback = null;
	this._warningCallback = null;
	this._itemLoadCompleteCallback = null;
    this._onChange = null;
    this._queue = [];

    // Stats
    this._numOpenConnections = 0;
    this._numProcessed = 0;
    this._numSuccess = 0;
    this._numWarnings = 0;
    this._numErrors = 0;

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

        if(!_.isArray(queue)){
            throw new Error('Array expected for parameter queue');
        }

        if(!_.isFunction(callback)){
            throw new Error('Function expected for parameter callback');
        }

        const that = this;

		if(that._queueLen > 0){
            throw new Error('Load can only be called once per instance. To load more queues create a new BulkHtmlLoader instance');
		}

        _.each(queue, function(loaderItem){

            let idx, url;

            if(!loaderItem){
                throw new Error('LoaderItem or String url expected');
            }

            // Queue accepts string urls and LoaderItem instance
            // If a string url is received, convert it to a LoaderItem
            if(!(loaderItem instanceof LoaderItem)){
                idx = queue.indexOf(loaderItem);
                url = loaderItem;
                loaderItem = new LoaderItem(url);
                queue[idx] = loaderItem;
            }

            loaderItem.setHttpTimeout(that._httpTimeout);
            loaderItem.setMaxRetries(that._maxRetries);
        });

        // Throttle should not be larger than the queue
        if(queue.length < this._maxConcurrentConnections){
            this._maxConcurrentConnections = queue.length;
        }

        that._queueLen = queue.length;
        that._queue = queue;

        const q = async.queue(function(loaderItem, callback) {

            that._numOpenConnections++;

            that._loadItem(loaderItem, function(loaderItem){

                that._numOpenConnections--;

                if(!(loaderItem instanceof LoaderItem)){
                    throw new Error('LoaderItem instance expected in callback as first argument');
                }

                if(that._completedUUID.indexOf(loaderItem._uuid) !== -1){
                    throw new Error('LoaderItem callback for ' + loaderItem.getUrl() + ' called twice');
                }

                that._completedUUID.push(loaderItem._uuid);
                that._numProcessed++;
                q.concurrency = that._maxConcurrentConnections;
                callback();
            });
        });

        q.concurrency = that._maxConcurrentConnections;

        // Final callback when queue completes
        q.drain = function() {
            callback(null, that._queue);
        };

        q.push(queue);
        return that;
	},

    /**
     * @param val DEPRECATED use setMaxConcurrentConnections
     * @returns {BulkHtmlLoader}
     */
	setHttpThrottle: function(val){
        console.warn('setHttpThrottle is deprecated. Use setMaxConcurrentConnections instead');
        this._maxConcurrentConnections = val;
        return this;
	},

    /**
     * @param val
     * @returns {BulkHtmlLoader}
     */
    setMaxConcurrentConnections: function(val){
        this._maxConcurrentConnections = val;
        events.EventEmitter.defaultMaxListeners = val;
        this._log('events.EventEmitter.defaultMaxListeners = ' + val);
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
		this._maxRetries = val;
        return this;
	},

	/**
	 * Fired when a single item has successfully loaded
	 * @param {function} callback
	 * @returns {BulkHtmlLoader}
	 */
	onItemLoadComplete: function(callback){
	
		if(_.isFunction(callback)){
            this._itemLoadCompleteCallback = callback;
		}

		return this;
	},

	/**
	 * Fired when a single item retries loading after it has failed, but more attempt are available
	 * @param {function} callback
	 * @returns {BulkHtmlLoader}
	 */
	onWarning: function(callback){
	
		if(_.isFunction(callback)){
            this._warningCallback = callback;
		}

		return this;
	},
	
	/**
	 * Fired when a single item has finally failed loading and no more attempt are available
	 * @param {function} callback
	 * @returns {BulkHtmlLoader}
	 */
	onError: function(callback){
	
		if(_.isFunction(callback)){
            this._errorCallback = callback;
		}

		return this;
	},

    /**
     * Fires when the loader receives an internal callback - no matter what the result is
     * @param callback
     * @returns {BulkHtmlLoader}
     */
    onChange: function(callback){

        if(_.isFunction(callback)){
            this._onChange = callback;
        }

        return this;
    },

    /**
     * Return the progress
     * @returns {object}
     */
	getProgress: function(){
		return {
            loaded: this._numProcessed,
            total: this._queueLen
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

        const p = (this.getProgress().loaded / this.getProgress().total) * 100;
        return Math.floor(p * 100) / 100;
    },

    /**
     * Returns a String representation of a BulkHtmlLoader instance
     * @returns {string}
     */
	toString: function(){
        return '[BulkHtmlLoader] progress: ' + this._numProcessed + '/' + this._queueLen + ', success: ' + this._numSuccess + ', warnings: ' + this._numWarnings + ', errors: ' + this._numErrors + ', open conn: ' + this._numOpenConnections + ', max conn: ' + this._maxConcurrentConnections;
	},

	/**
	 * @private
	 */
	_loadItem: function(loaderItem, finalCallback){

		let callbackInvoked;
        const that = this;

        /**
         * Handles the internal callback, sets loader status to either error, warning or success and invokes any custom callbacks before finally invoking the parent callback
         * @param loaderItem
         * @returns {*}
         */
		const internalCallback = function(loaderItem){

			if(!(loaderItem instanceof LoaderItem)){
				throw Error('Expected instance of LoaderItem in callback');
			}

			if(callbackInvoked === true){
                throw new Error('Callback invoked twice for ' + loaderItem.toString());
			}

            callbackInvoked = true;

            /**
             * Change loader item status
             */
            if(loaderItem.getError()){

                // More retries left, flag as warning. Load will be re-attempted.
                if(loaderItem.hasMoreAttempts()){
                    loaderItem.setStatus(LoaderItem.WARNING);
                } else{
                    loaderItem.setStatus(LoaderItem.ERROR);
                }
            } else{
                loaderItem.setStatus(LoaderItem.COMPLETE);
            }

            /**
             * If set, fire on any change in status (error, warning or complete)
             */
            if(that._onChange){
                that._onChange.call(that, loaderItem);
            }

			if(loaderItem.getError()){

                if(loaderItem.hasMoreAttempts()){
                    that._numWarnings++;
                    that._log('Callback ' + loaderItem.toString());

                    if(that._warningCallback){
                        return that._warningCallback.call(that, loaderItem, function(loaderItem){
                            loadWithRetry(loaderItem, internalCallback);
                        });
                    }

                    return loadWithRetry(loaderItem, internalCallback);
                }

                // Reduce http throttle on failed requests
                if(that._reduceConnectionsOnError === true && that._maxConcurrentConnections > 1){
                    that._maxConcurrentConnections--;
                    that._log('Reduce throttle to ' + that._maxConcurrentConnections);
                }

                that._numErrors++;
                that._log('Callback ' + loaderItem.toString());

				if(that._errorCallback){
					return that._errorCallback.call(that, loaderItem, finalCallback);
				}

				return finalCallback(loaderItem);
			}

            // Past this point loads are flagged as successful
            that._numSuccess++;
            that._log('Callback ' + loaderItem.toString());

            if(that._itemLoadCompleteCallback){
                return that._itemLoadCompleteCallback.call(that, loaderItem, finalCallback);
			}

            finalCallback(loaderItem);
		};

        /**
         * Handles a single http request
         * @param {LoaderItem} loaderItem
         * @param {function} internalCallback
         */
		const loadWithRetry = function(loaderItem, internalCallback){
			
			callbackInvoked = false;
			let hasTimedOut = false;

			const options = {
				url: loaderItem.getUrl(),

                // Attaches a random user agent string to the http request header mimicking a user request from a browser (some hosts will reject requests without a user agent string)
				headers: {
                    'User-Agent': uaStrings.getRandom()
				}
			};

            const timeOutHandler = function(){
                hasTimedOut = true;

                loaderItem.setError({
                    code: 408,
                    errno: http.STATUS_CODES[408]
                });

                loaderItem.increaseHttpTimeout(that._increaseHttpTimeoutOnError);
                return internalCallback(loaderItem);
            };

            const id = setTimeout(timeOutHandler, loaderItem.getHttpTimeout());

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
					return internalCallback(loaderItem);
				}

                // Any http status code above 400 is treated as an error
				if(response && response.statusCode && response.statusCode > 399){
					
					loaderItem.setError({
						code: response.statusCode,
						errno: http.STATUS_CODES[response.statusCode] || ''
					});
					
					return internalCallback(loaderItem);
				}

				const $cheerio = cheerio.load(body || '', {
                    normalizeWhitespace: true
				});

                // Removing anything else but HTML
				$cheerio('html').find('script').remove().find('noscript').remove().find('iframe').remove();

				loaderItem.setResult($cheerio);
				internalCallback(loaderItem);
			});
		};
		
		loadWithRetry(loaderItem, internalCallback);
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
