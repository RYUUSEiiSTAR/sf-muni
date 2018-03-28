import React from 'react';
import ReactDOM from 'react-dom';

import index from './index.html';
import styles from './css/styles.scss';

import Filter from './js/containers/Filter.jsx';
import SFMap from './js/containers/SFMap.jsx';

export default class Root extends React.Component {
    constructor(props) {
        super(props);
        this.updateVisible = this.updateVisible.bind(this);
        this.state = {
            visible: []
        }
    }

    updateVisible(visible) {
        this.setState((prevState, props) => ({
            visible: visible
        }));
    }

    render() {
        return (
            <div>
                <header><h1>SF Muni</h1></header>
                <div id="sfmuni">
                    <p>Hi! If you're not seeing any buses on the map, please run this page over http as the NextBus API service doesn't allow https requests :(</p>
                    <SFMap visible={this.state.visible}/>
                    <Filter onClick={v => this.updateVisible(v)}/>
                </div>
            </div>
        )
    }
}

ReactDOM.render(<Root />, document.getElementById('root'));