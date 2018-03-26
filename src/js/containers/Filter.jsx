import React from 'react';
import querystring from 'querystring';

import * as SFMUNI_CONST from './../utils/Constants.js';
import Label from './../components/Label.jsx';

export default class Filter extends React.Component {
    constructor(props) {
        super(props);

        this.toggleActive = this.toggleActive.bind(this);
        this.updateVisible = this.updateVisible.bind(this);
        this.state = {
            routes: []
        }
    }

    componentDidMount() {
        let params = {
            a: SFMUNI_CONST.AGENCY,
            command: SFMUNI_CONST.ROUTE_LIST
        }
        let url = SFMUNI_CONST.URL;
        url += querystring.stringify(params);
        fetch(url)
            .then(response => { 
                return response.json();
            })
            .then(response => {
                let routes = [];
                response.route.forEach(route => {
                    routes.push({
                        tag: route.tag,
                        title: route.title,
                        active: true
                    });
                });

                this.setState((prevState, props) => ({
                    routes: routes
                }));

                this.updateVisible();
            });
    }

    toggleActive(toggleRoute) {
        if (toggleRoute) {
            let currentRoutes = this.state.routes;
            currentRoutes.some(route => {
                if (route.tag === toggleRoute) {
                    route.active = !route.active;
                    return;
                }
            });
    
            this.setState((prevState, props) => ({
                routes: currentRoutes
            }));
        }
        this.updateVisible();
    }

    updateVisible() {
        let visibleRoutes = []
        this.state.routes.forEach(route => {
            if (route.active) {
                visibleRoutes.push(route.tag)
            }
        })
        this.props.onClick(visibleRoutes);
    }

    render() {
        let routeList = this.state.routes.map(route =>
            <Label key={route.tag} route={route} onClick={() => this.toggleActive(route.tag)}/>
        );
        return(
            <div>
                <p>Routes:</p>
                <div id="filter">{routeList}</div>
            </div>
        );
    }
}