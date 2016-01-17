import superagent from 'superagent'
import { normalize } from 'normalizr';
import get from 'lodash/get';

import * as actionTypes from '../constants/action-types';

export const requestStart = (url) => {
    return {
        type: actionTypes.REQUEST_START,
        url,
    };
};

export const requestSuccess = (url, status, entities) => {
    return {
        type: actionTypes.REQUEST_SUCCCESS,
        url,
        status,
        entities,
        time: Date.now(),
    };
};

export const requestFailure = (url, status) => {
    return {
        type: actionTypes.REQUEST_SUCCCESS,
        url,
        status,
        time: Date.now(),
    };
};

export const requestAsync = (url, schema, requestsSelector, force) => (dispatch, getState) => {
    const state = getState();
    const requests = requestsSelector(state);
    const request = requests[url];
    const isPending = get(request, ['isPending'], false);
    const status = get(request, ['status']);
    const hasSucceeded = status >= 200 && status < 300;

    if (force || (!isPending && !hasSucceeded)) {
        dispatch(requestStart(url));

        superagent.get(url)
            .end((err, response) => {
                if (err) {
                    dispatch(requestFailure(url, response.status));
                } else {
                    const normalized = normalize(response.body, schema);
                    dispatch(requestSuccess(url, response.status, normalized.entities));
                }
            });
    }
};
