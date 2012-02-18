# Write CouchDB Changes Listeners. Easy.

    var changes = require("CouchDBChanges");
    changes.follow("database", function(change) {
       // do whatever you want with the change.
    });

Wow, easy!

CouchDB, The Definitive Guide has
[a chapter on the Changes feed](http://guide.couchdb.org/draft/notifications.html).


## Wha?

CouchDB has this amazing feature called the “Changes Feed”. Think of
`git log` for your database. There’s all sorts of awesome you can do
with this. For example, have a database called `outbox` and connect
a CouchDB changes listener to it and whenever your application creates
a new document, say

    {
        "from": "me@example.com",
        "to": "you@example.com",
        "subject": "Hey there!",
        "body": "I think you get the idea"
    }

the changes listener then gets notified right when the document gets
created, but asynchronously from your application and send the email
that is described. When the email is sent, it can write back a new field

    "status": "sent"

or, if anything went wrong:

    "status": "error",
    "error_message": "that email address is bogus you twat!"

So yeah, quick example, but there’s tons of things you can do with this.
We should collect nice examples, but for now you can check out
<https://github.com/janl/couchdb-external-CreateUserDatabase>.

## API

`follow(database, change_cb, follow_options, changes_options)`

 * `database`: (string) name of the database
 * `change_cb`: (callable) function to call for each change
 * `follow_options`: (object) configurations for following {
     persistent_since: (bool) false whether or not to persist the latest
     `seq_id` from the server. This allows us to avoid processing a
     change more than once.
 }
 * `changes_options`:  (object) parameters for CouchDB’s `_changes` API.
   See <http://wiki.apache.org/couchdb/HTTP_database_API#Changes>.


## Next?

* Make `persistent_since` storage configurable.


## Thanks

This is just a very thin wrapper around Jason Smith’s / Iris Couch’s
excellent [`follow` library](https://github.com/iriscouch/follow).

Thanks Jason!


## License & Copyright

(c) 2012 Jan Lehnardt <jan@apache.org>  
Licensed under the Apache License 2.0.
