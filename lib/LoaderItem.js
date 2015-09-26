var uuid = require('uuid')
	, _ = require('lodash');

/**
 * LoaderItems are injected into a loader instance's queue and represents a single http request
 * Once loaded, the LoaderItem is returned in the result callback and the loaded data can be accessed with the getResult() method
 * @param {string} url      	The url to load
 * @param {object=} data     	Arbitrary data object attached to the LoaderItem instance
 */
var LoaderItem = function(url, data){
	
	if(!url){
		throw new Error('Expected required parameter url');
	}
	
	if(url.indexOf('http') === -1){
		throw new Error('Parameter url must have a protocol http or https');	
	}

    this._url = url;
    this._data = data || {};
	this._status = LoaderItem.PENDING;
	this._result = null;
	this._error = null;
	this._uuid = uuid.v1(); // Sets a unique id for each load. Used to check that callbacks per load are only invoked once
    this._httpTimeOut = 0; // Set when the queue starts
};

LoaderItem.prototype = {

	/**
	 * Set the loader result
	 * @param {*} result
	 */
	setResult: function(result){
		this._result = result;
	},
	
	/**
	 * Returns the loader's result. Will return null until the load has successfully completed
	 * @returns {null|*}
	 */
	getResult: function(){
		return this._result;
	},
	/**
	 * Sets the loader status
	 * @param {string} status [pending, complete, error]
	 */
	setStatus: function(status){
		
		if(status !== LoaderItem.PENDING && status !== LoaderItem.COMPLETE && status !== LoaderItem.ERROR && status !== LoaderItem.WARNING){
			throw new Error('Invalid loader status ' + status);
		}
		
		this._status = status;
	},

    /**
     * Returns the LoaderItem's http timeout setting
     * @returns {number|*}
     */
    getHttpTimeout: function(){
        return this._httpTimeOut;
    },

    /**
     * Set http time out per LoaderItem instance
     * @param val
     */
    setHttpTimeout: function(val){

        if(!_.isNumber(val)){
            throw new Error('Invalid value for httpTimeout ' + val);
        }

        if(val <= 0){
            throw new Error('Http timeout value must be greater than 0');
        }

        this._httpTimeOut = val;
    },

    /**
     * Called internally from BulkHtmlLoader when timeout warnings are caught.
     * For each timeout error an additional 500ms are added to the LoaderItems httpTimeOut threshold before the load is retried
     * @param val
     */
    increaseHttpTimeout: function(val){

        if(!_.isNumber(val)){
            throw new Error('Invalid value for httpTimeout ' + val);
        }

        this._httpTimeOut += val;
    },

	/**
	 * Returns the loader's status (pending, completed, warning or error)
	 * @returns {string|*}
	 */
	getStatus: function(){
		return this._status;
	},

	/**
	 * Returns the loader item's url
	 * @returns {string|*}
	 */
	getUrl: function(){
		return this._url;
	},

	/**
	 * Returns the loader item's arbitrary data (if set)
	 * @returns {Object|{}|*}
	 */
	getData: function(){
		return this._data;	
	},

	/**
	 * Appends a new key or replaces a key in the arbitrary data object 
	 * @param key
	 * @param val
	 */
	appendData: function(key, val){
		this._data[key] = val;	
	},

	/**
	 * Called by the Html loader and sets the current error object (if any)
	 * @param err
	 */
	setError: function(err){
		
		if(!_.isObject(err) && !_.isNull(err)){
			throw new Error('Object or null expected for parameter err')
		}
		
		this._error = err;
	},

	/**
	 * Returns the current error (if any)
	 * @returns {null|*}
	 */
	getError: function(){
		return this._error;
	},

	/**
	 * Returns a String representation of a LoaderItem instance and displays information about it's current status and errors (if any)
	 * @returns {string}
	 */
	toString: function(){

        var status = this.getStatus().charAt(0).toUpperCase() + this.getStatus().slice(1);

        if(this.getError()){
            return '[Object LoaderItem] ' + status + ' ' + this.getError().code + ' ' + this.getError().errno + ' ' + this.getUrl();
        }

        return '[Object LoaderItem] ' + status + ' ' + this.getUrl();
	}
};

// Initial status on instantiation
LoaderItem.PENDING = 'pending';

// Once the load completes successfully
LoaderItem.COMPLETE = 'complete';

// Http errors caught, but there are more retries left
LoaderItem.WARNING = 'warning';

// Load has finally failed
LoaderItem.ERROR = 'error';

module.exports = LoaderItem;
