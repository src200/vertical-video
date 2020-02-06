import { combineReducers } from 'redux';


const rootReducer = combineReducers({
    articlesState: articleReducer,
    searchState: searchReducer,
});

export default rootReducer;