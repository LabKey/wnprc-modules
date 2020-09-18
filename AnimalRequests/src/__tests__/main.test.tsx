import {
    overrideAFieldValue
} from '../client/query/helpers'


it('overrideAFieldValue: should replace val1 with val2', () => {
    const initialValues = {};
    initialValues['val1'] = 0;
    initialValues['val2'] = 1;

    const expectedValues = {};
    expectedValues['val1'] = 1;
    expectedValues['val2'] = 1;

    expect(overrideAFieldValue(initialValues,'val2','val1')).toEqual(expectedValues);
});

//TODO check that we can get the right content using mock data object
