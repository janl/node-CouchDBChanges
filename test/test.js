var fs = require("fs");
var assert = require("assert");
var CouchDBChanges = require("../CouchDBChanges");

var change1 = {
	seq: 1,
	id: "asd",
	changes: [{"rev":"1-cdef"}]
}

var change2 = {
	seq: 2,
	id: "asd",
	changes: [{"rev":"2-ghij"}]
}

describe("CouchDBChanges", function() {
	it("should call the callback", function() {
		CouchDBChanges.prototype.cb = function(e, c) {
			assert.ifError(e);
			assert(true);
		}
		CouchDBChanges.prototype.config = {
			persistent_since: false
		};
		CouchDBChanges.prototype.changesCallback(null, change1);
	});

	it("should not call the callback on null change", function() {
		CouchDBChanges.prototype.cb = function(e, c) {
			throw "error";
		}
		CouchDBChanges.prototype.config = {
			persistent_since: false
		};
		assert.doesNotThrow(function() {
			CouchDBChanges.prototype.changesCallback(null, null);
		});
	});

	it("should record the sequence", function() {
		CouchDBChanges.prototype.cb = function(e, c) {
			assert.ifError(e);
			assert(true);
		}
		CouchDBChanges.prototype.config = {
			persistent_since: true
		};
		CouchDBChanges.prototype.changesCallback(null, change1);
		var result = fs.readFileSync("since", "utf8");
		assert.equal(1, result);
		CouchDBChanges.prototype.changesCallback(null, change2);
		var result = fs.readFileSync("since", "utf8");
		assert.equal(2, result);
	});

	it("should default the sequence number to 0 if persistence is off", function() {
		fs.writeFileSync("since", 1, "utf8");
		CouchDBChanges.prototype.config = {
			persistent_since: false
		};
		CouchDBChanges.prototype.readSince();
		assert.equal(0, CouchDBChanges.prototype.config.since);
	});

	it("should read the sequence number from the since file", function() {
		fs.writeFileSync("since", 1, "utf8");
		CouchDBChanges.prototype.config = {
			persistent_since: true
		};
		CouchDBChanges.prototype.readSince();
		assert.equal(1, CouchDBChanges.prototype.config.since);
	});

	it("should default the secuence to 0 if the file does not exist", function() {
		fs.writeFileSync("since", 1, "utf8");
		CouchDBChanges.prototype.config = {
			persistent_since: true
		};
		CouchDBChanges.prototype.readSince();
		assert.equal(1, CouchDBChanges.prototype.config.since);

		fs.unlinkSync("since");
		CouchDBChanges.prototype.readSince();
		assert.equal(0, CouchDBChanges.prototype.config.since);
	});

});
