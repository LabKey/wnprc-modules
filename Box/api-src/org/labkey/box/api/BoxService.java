package org.labkey.box.api;


/**
 * Created by jon on 1/5/17.
 */
public abstract class BoxService {
    static private BoxService _service;

    static public BoxService get() {
        return _service;
    }

    static public void set(BoxService service) {
        _service = service;
    }
}
