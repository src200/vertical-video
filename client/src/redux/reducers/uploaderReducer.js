import { BEFORE_UPLOAD, AFTER_UPLOAD } from '../actionTypes';

const defaultState = {
    currentVideoSrc: ''
};

export default (state = defaultState, action) => {
    switch (action.type) {
        case BEFORE_UPLOAD: 
            return {
                ...state,
            }
        case AFTER_UPLOAD:
            return {
                ...state,
            }
    }
}