var async = require('async')
	, request = require('request')
	, cheerio = require('cheerio')
	, _ = require('lodash')
	, LoaderItem = require('./LoaderItem')
	, uaStrings = require('./util/uaStrings')
	, http = require('http');

var HtmlLoader = function(){
	this.throttle = 10;
	this.httpTimeout = 1500;
	this.numRetries = 3;
	this.numErrors = 0;
	this.loaded = 0;
	this.total = 0;
	this.completedUUID = [];
	this.errorCallback = null;
	this.warningCallback = null;
	this.itemLoadCompleteCallback = null;
    return this;
};

HtmlLoader.prototype = {

	/**
	 * Starts loading the queue
	 * @param {array} queue of LoaderItems
	 * @param {function} callback
	 */
	load: function(queue, callback) {

		if(this.total){
			throw new Error('Load can only be called once per instance. To load more urls create a new HtmlLoader instance');
		}

		if(!_.isArray(queue)){
			throw new Error('Array expected for parameter queue');
		}

		if(!queue.length){
			return callback(null, []);
		}
		
		_.each(queue, function(o){
			if(!(o instanceof LoaderItem)){
				throw new Error('Instance of LoaderItem expected in queue');
			}
		});
		
		if(!_.isFunction(callback)){
			throw new Error('Funtion expected for parameter callback');
		}

		this.total = queue.length;
		var that = this;
		
		async.mapLimit(queue, this.throttle, function(loaderItem, callback) {
			
			that._loadItem(loaderItem, function(loaderItem){

				if(!(loaderItem instanceof LoaderItem)){
					throw new Error('LoaderItem instance expected in callback as first argument');
				}
				
				if(that.completedUUID.indexOf(loaderItem._uuid) !== -1){
					throw new Error('LoaderItem callback for ' + loaderItem.getUrl() + ' called twice');
				}

				that.completedUUID.push(loaderItem._uuid);
				
				if(loaderItem.getError()){
					that.numErrors++;
					
					// Reduce throttle on errors
					if(that.numErrors > 5 && throttle > 1){
						that.throttle--;
					}
				}
				
				// Errors are encapsulated in each LoaderItem instance (if any)
				callback(null, loaderItem);
			});

		}, function(err, results) {
			callback(null, _.flatten(results));
		});

        return this;
	},
	
	setHttpThrottle: function(val){
		this.throttle = val;
        return this;
	},
	
	setHttpTimeout: function(val){
		this.httpTimeout = val;
        return this;
	},
	
	setNumRetries: function(val){
		this.numRetries = val;
        return this;
	},

    /**
     * Returns a new LoaderItem. Same as new HtmlLoader.LoaderItem()
     * @param url
     * @param data
     * @returns {LoaderItem|exports|module.exports}
     */
    getLoaderItem: function(url, data){
        return new LoaderItem(url, data);
    },

	/**
	 * Fired when a single item has successfully loaded
	 * @param {function} callback
	 * @returns {HtmlLoader}
	 */
	onItemLoadComplete: function(callback){
	
		if(!_.isFunction(callback)){
			throw new Error('Function expected for parameter callback');
		}
	
		this.itemLoadCompleteCallback = callback;
		return this;
	},
	
	/**
	 * Fired when a single item retries loading after it has failed, but more attempt are available
	 * @param {function} callback
	 * @returns {HtmlLoader}
	 */
	onWarning: function(callback){
	
		if(!_.isFunction(callback)){
			throw new Error('Function expected for parameter callback');
		}
	
		this.warningCallback = callback;
		return this;
	},
	
	/**
	 * Fired when a single item has finally failed loading and no more attempt are available
	 * @param {function} callback
	 * @returns {HtmlLoader}
	 */
	onError: function(callback){
	
		if(!_.isFunction(callback)){
			throw new Error('Function expected for parameter callback');
		}
	
		this.errorCallback = callback;
		return this;
	},
	
	getProgress: function(){
		return {
			loaded: this.loaded,
			total: this.total
		}
	},
	
	toString: function(){
		return '[Object HtmlLoader]';
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

			if(arguments.length > 1){
				throw Error('Expected only a single argument in callback');
			}

			if(callbackInvoked === true){
				throw new Error('Callback invoked twice');
			}

			callbackInvoked = true;

			if(loaderItem.getError()){

				internalLoadErrors++;

				if(internalLoadErrors < that.numRetries + 1){

					loaderItem.setStatus(LoaderItem.WARNING);
					
					if(that.warningCallback){
						return that.warningCallback.call(that, loaderItem, function(loaderItem){
							return loadWithRetry(loaderItem, retryCallback);
						});
					}

					return loadWithRetry(loaderItem, retryCallback);
				}
				
				loaderItem.setStatus(LoaderItem.ERROR);

				if(that.errorCallback){
					return that.errorCallback.call(that, loaderItem, finalCallback);
				}

				return finalCallback(loaderItem);
			}

			loaderItem.setStatus(LoaderItem.COMPLETE);
            that.loaded++;

			if(that.itemLoadCompleteCallback){
                return that.itemLoadCompleteCallback.call(that, loaderItem, finalCallback);
			}

			finalCallback(loaderItem);
		};
		
		var loadWithRetry = function(loaderItem, retryCallback){
			
			callbackInvoked = false;

			var skipped = false;

			var options = {
				url: loaderItem.getUrl(),
				headers: {
					'User-Agent': uaStrings.getRandom()
				}
			};
			
			var id = setTimeout(function(){
				skipped = true;
				
				loaderItem.setError({
					code: 408,
					errno: http.STATUS_CODES[408]
				});
				
				return retryCallback(loaderItem);
				
			}, that.httpTimeout);
			
			request(options, function(error, response, body) {

				if(skipped){
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

				$cheerio('html').find('script').remove().find('noscript').remove().find('iframe').remove();
				
				loaderItem.setError(null);
				loaderItem.setResult($cheerio);
				retryCallback(loaderItem);
			});
		};
		
		loadWithRetry(loaderItem, retryCallback);
	}
};

HtmlLoader.LoaderItem = LoaderItem;
module.exports = HtmlLoader;
