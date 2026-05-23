/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
if (Promise) {
    Promise.prototype["finally"] = RSVP.Promise.prototype["finally"];
}
else {
    var Promise = RSVP.Promise;
}