const _ = require('lodash');

module.exports = {

    /**
     * Returns system memory usage formatted as MB and percentage used
     * @param {number=} level - detail level for mem usage. 0 for simple, 1 for detailed
     * @param {boolean=} csv - when true returns values as a comma separated string (for log readability)
     * @return {object|string}
     */
    getMemUsage: function(level, csv){

        if(!_.isNumber(level)){
            level = 0;
        }

        const memoryUsage = {},
            that = this;

        if(process && _.isFunction(process.memoryUsage)){

            let mem = process.memoryUsage();

            if(level === 1){
                _.forIn(process.memoryUsage(), function(val, key){
                    if(_.isNumber(val)){
                        memoryUsage[key] = that.formatBytes(val);
                    }
                });
            }

            if(_.isNumber(mem.heapTotal) && _.isNumber(mem.heapUsed)){
                memoryUsage.heapFree = that.formatBytes(mem.heapTotal - mem.heapUsed);
                memoryUsage.heapUsedPct = ((mem.heapUsed / mem.heapTotal) * 100).toFixed(2) + '%';
                memoryUsage.heapFreePct = (100 - (mem.heapUsed / mem.heapTotal) * 100).toFixed(2) + '%';
            }
        }

        let str = 'memUsage: ';

        if(csv === true){

            _.forIn(memoryUsage, function(val, key){
                str += key + ': ' + val + ', ';
            });

            str = str.substr(0, str.length - 2);

            return str;
        }

        return memoryUsage;
    },

    /**
     * Format bytes
     * @param {number} bytes
     * @param {number=} decimals
     * @return {string}
     */
    formatBytes: function(bytes, decimals){

        if(!_.isNumber(decimals)){
            decimals = 1;
        }

        if(!_.isNumber(bytes) || bytes < 0){
            bytes = 0;
        }

        if(bytes === 0){
            return '0 Byte';
        }

        const k = 1000, // or 1024 for binary
            dm = decimals + 1 || 3,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
};
