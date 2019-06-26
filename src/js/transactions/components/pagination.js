import React from 'react';
import {connect} from 'react-redux';
import {startRequest} from '../actions';

class Pagination extends React.PureComponent {
    render() {
        const {page, has_prev, has_next, goPrev, goNext} = this.props;

        return <ul className="pagination text-center">
            {has_prev ?
                <li className="pagination-previous"><a href="#" onClick={goPrev}>Previous</a></li>
                : null}
            <li className="current">{page}</li>
            {has_next
                ? <li className="pagination-next"><a href="#" onClick={goNext}>Next</a></li>
                : null}
        </ul>
    }
}

export default connect(
    state => {
        const count = state.get('count');
        const page = state.get('page');
        const per_page = state.getIn(['filters', 'per_page']);

        const has_prev = (page - 1) * per_page > 0;
        const has_next = count - (page * per_page) > 0;

        return {
            page,
            has_prev,
            has_next,
            filters: state.get('filters').toJS()
        }
    },
    {
        startRequest
    },
    (stateProps, {startRequest}) => {
        const {page, has_prev, has_next, filters} = stateProps;

        return {
            ...stateProps,
            goPrev: () => has_prev ? startRequest(filters, page - 1) : null,
            goNext: () => has_next ? startRequest(filters, page + 1) : null,
        }
    }
)(Pagination);