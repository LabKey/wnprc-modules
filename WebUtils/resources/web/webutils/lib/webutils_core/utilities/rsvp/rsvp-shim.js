if (Promise) {
    Promise.prototype["finally"] = RSVP.Promise.prototype["finally"];
}
else {
    var Promise = RSVP.Promise;
}