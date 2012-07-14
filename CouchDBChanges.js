
// # CouchDBChanges


// ## Usage:

//     var CouchDBChanges = require("CouchDBChanges");
//     var config = {
//       url: "http://127.0.0.1:5984/mydb",
//       filter: "pommes",
//       persistent_since: true
//     };

//     var changes = new CouchDBChanges(config, function(error, change) {
//       // do dat change!
//     });

// ## TODO

//  - tests
//  - per-instance-persistent-since-file-name

// ## Dependencies
//
//  - follow (npm install follow)
//  - fs (bult-in)
var follow = require("follow");
var fs = require("fs");

// ## The Public API
//
// The public module name is `CouchDBChanges`
// Get an instance by doing:
//     var changes = new CouchDBChanges({}, function(error, change) {});
//
module.exports = CouchDBChanges;
function CouchDBChanges(config, cb)
{
  this.config = config;
  this.cb = cb;

  this.readSince();

  follow(config, CouchDBChanges.prototype.changesCallback.bind(this));
};

// ### The Change Callback
//
// This function gets called for every change in the database.
// The change may be null, and we ignore that for now.
// The `change` argument is of the format:
//
//     {
//         seq: 1,
//         id: "dca94a422db82506091d789d06b1300a",
//         changes: [{"rev":"1-ee9f6703bfe4e714f2ba378919fa2a2c"}]
//     }
//
// We pass the `error` and `change` arguments to the user-provided
// callback.
// When that’s done, we record the current sequence so we don’t
// process this change twice.
CouchDBChanges.prototype.changesCallback = function(error, change)
{
    if(change === null) { return; }
    this.cb(error, change);
    /* successfully processed the change,
       we can now record the seq */
    this.writeSince(change.seq);
}

// ## Internals

// ### ReadSince
//
// This method checks whether the configuration states
// that the sequence id should be recorded. If yes,
// it reads and returns the current numner using the
// `doReadSince()` method.
// Otherwise, it returns `0` (zero).
CouchDBChanges.prototype.readSince = function()
{
  if(this.config.persistent_since) {
    this.config.since = this.doReadSince();
  } else {
    this.config.since = 0;
  }
}

// ### WriteSince
//
// This method mirrors `readSince()`. It checks whether
// the configuration requires to record the sequence number.
// If yes, it writes out the passed in sequence number using
// the `doWriteSince()` method.
CouchDBChanges.prototype.writeSince = function(seq)
{
  if(this.config.persistent_since) {
    this.doWriteSince(seq);
  }
}

// ### doWriteSince
//
// This method handles the reading from the file of the
// recorded sequence number. It uses `fs.readFileSync()`
// to do the read operation. Due to the fact that Node.js
// operates single-threaded and this read operation is
// synchronous, we know we will read the full file’s
// contents in one go and don’t end up with any
// intermediate garbage. This is a good thing.
//
// When processing *a lot* of changes and having
// *a lot* of sequence numbers persisted, this should
// be swapped out for an asynchrnous version.
CouchDBChanges.prototype.doReadSince = function()
{
  var since;
  try {
    since = fs.readFileSync("since", "utf8");
  } catch(e) {
    since = 0;
  }
  return since;
}

// ### doWriteSince
//
// This method mirrors the `doReadSince()` method. It handles
// the writing to the file of the recorded sequence number.
//
// See `doReadSince` for a discussion on safe reads and
// performance under high load.
CouchDBChanges.prototype.doWriteSince = function(value)
{
  fs.writeFileSync("since", value, "utf8");
}

// ## Future Work
// the file where we record the change sequence number
// needs to be chosen carefully:
//  - multiple changes handler might run within a single Node.js process
//  - multiple Node.js processes might run on a single server
//  - A Node.js process might restart, we need it to find the right
//    file for each changes handler.

// Currently, the file is called `since` and runs in the CWD of the Node.js process. Clearly this isn't sufficient.

// On environments like Heroku where no file system access is permitted, the change sequence number needs to be stored in a database (current state of research, TBD: look for alternatives).
