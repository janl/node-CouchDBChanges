var fs = require("fs"); // for persistent since

module.exports = CouchDBChanges;
function CouchDBChanges(server) {
  this._server = server;
}

CouchDBChanges.prototype.follow = function(
    database,
    change_cb,
    follow_options,
    changes_options) {

  follow_options = follow_options || {};
  changes_options = changes_options || {};

  var since = 0;
  var newSince = 0;

  if(follow_options.persistent_since) {
    since = this._readSince();
  }

  var follow = require("follow");
  var url = this._server + "/" + database;
  var that = this;

  changes_options.db = url;
  changes_options.since = since;
  follow(changes_options, function(error, change) {
    if(change === null) { return; }
    change_cb(error, change);
    if(follow_options.persistent_since) {
      // successfully processed the change, record the seq and get out.
      that._writeSince(change.seq);
    }
  });
};

CouchDBChanges.prototype._readSince = function() {
  // this is atomic, because node is single threaded and we use a Sync method.
  var since;
  try {
    since = fs.readFileSync("since", "utf8");
  } catch(e) {
    since = 0;
  }
  return since;
}

CouchDBChanges.prototype._writeSince = function(value) {
  // this is atomic, because node is single threaded and we use a Sync method.
  fs.writeFileSync("since", value, "utf8");
}
