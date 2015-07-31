var fs = require('fs');
var Promise = require('bluebird');

function getData(page) {
  console.log('getData: ',page);
  var numPerPage = 3;
  page = page || 1;
  return new Promise(function(resolve,reject) {

    // delay response for 1 second
    setTimeout(function() {
      fs.readFile('data.txt', function(err, data) {
        if (err) reject(err);
        else {
          lines = data.toString().trim().split('\n');

          // calculate total number of pages in our data
          var numpages;
          if (lines.length == 0) numpages = 0;
          else numpages = Math.ceil(lines.length / numPerPage);

          // return numPerPage lines of data, and the total number of pages
          resolve({data: lines.slice((page-1)*numPerPage, page*numPerPage), numpages: numpages});
        }
      });
    },1000);
  });
};

// check if this is being run from the command line
if (require.main === module) {
  getData(process.argv[2]).then(console.log);
}

// export our getData function
module.exports = {
  getData: getData
};
