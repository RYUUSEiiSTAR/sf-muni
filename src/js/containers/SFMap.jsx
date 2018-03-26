import React from 'react';
import querystring from 'querystring';
import * as d3 from 'd3';
import GeoJSON from 'geojson';

import * as SFMUNI_CONST from './../utils/Constants.js';
import vehicleSvg from './../../vehicle.svg';

import neighbourhoods from './../../sfmaps/neighborhoods.json';
import freeways from './../../sfmaps/freeways.json';
import arteries from './../../sfmaps/arteries.json';
import streets from './../../sfmaps/streets.json';

export default class Map extends React.Component {
    constructor(props) {
        super(props);
        this.fetchData = this.fetchData.bind(this);
        this.updateVehicles = this.updateVehicles.bind(this);
        this.SFMap = this.SFMap.bind(this);
        this.state = {
            transit: [],
            epochTime: 0
        }
    }

    componentDidMount() {
        this.SFMap();
        this.fetchData();

        d3.interval(() => {this.fetchData()}, SFMUNI_CONST.REFRESH_RATE);
    }

    componentDidUpdate() {
        this.updateVehicles();
    }

    fetchData() {
        let params = {
            a: SFMUNI_CONST.AGENCY,
            command: SFMUNI_CONST.VEHICLE_LOCATIONS,
            t: this.state.epochTime
        }
        let url = SFMUNI_CONST.URL
        url += querystring.stringify(params);
        fetch(url)
            .then(response => { 
                return response.json();
            })
            .then(response => {
                if (response.vehicle) {
                    let vehicles = [];
                    response.vehicle instanceof Array ? vehicles = response.vehicle : vehicles.push(response.vehicle);

                    let newTransit = [];
                    vehicles.forEach(v => {
                        newTransit.push({
                            id: v.id,
                            tag: v.routeTag,
                            lat: v.lat,
                            lon: v.lon,
                            dir: v.heading
                        });
                    });
    
                    let updTransit = this.state.transit;
                    for(let i=0; i<newTransit.length; i++) {
                        let exists = false;
                        for(let j=0; j<updTransit.length; j++) {
                            if(newTransit[i].id === updTransit[j].id) {
                                updTransit[j].lat = newTransit[i].lat;
                                updTransit[j].lon = newTransit[i].lon;
                                exists = true;
                                break;
                            }
                        }
    
                        if (!exists) {
                            updTransit.push({
                                id: newTransit[i].id,
                                tag: newTransit[i].tag,
                                lat: newTransit[i].lat,
                                lon: newTransit[i].lon,
                                dir: newTransit[i].dir
                            })
                        }
                    }
            
                    this.setState((prevState, props) => ({
                        transit: updTransit,
                        epochTime: new Date().getTime()
                    }));


                }
            });
    }
    
    updateVehicles() {
        let vehicleFeatures = this.state.transit.filter(vehicle => {
            if (this.props.visible.includes(vehicle.tag)) {
                return vehicle;
            }
        })
        d3.json(neighbourhoods, (error, neighbourhoods) => {
            if (error) {
                throw error;
            } else {
                let projection = d3.geoMercator();
                let path = d3.geoPath(projection);
                projection.fitSize([SFMUNI_CONST.MAP_WIDTH, SFMUNI_CONST.MAP_HEIGHT], neighbourhoods);

                let vehicles = d3
                    .selectAll("#vehicles")
                    .selectAll(".vehicle")
                    .data(vehicleFeatures, v => { return v.id });
        
                vehicles
                    .exit()
                    .transition().duration(SFMUNI_CONST.MAP_VEHICLE_SPEED)
                    .remove();
                    
                vehicles
                    .transition().duration(SFMUNI_CONST.MAP_VEHICLE_SPEED)
                    .attr("transform", v => {
                        return `translate(${projection([v.lon, v.lat]).join(',')})`;
                    });

                let newVehicles = vehicles.enter().append("g")
                    .attr("class", "vehicle");

                newVehicles.append("image")
                    .attr("xlink:href", vehicleSvg)
                    .attr("x", -10) // half the width of the svg
                    .attr("y", -10) // half the height of the svg
                    .attr("transform", v => {
                        return `rotate(${v.dir})`;
                    });
                
                let popup = newVehicles.append("g")
                    .attr("class", "popup-text");

                popup.append("rect")
                    .attr("x", -35) // position of popup box
                    .attr("y", -33) // position of popup box
                
                popup.append("text")
                    .attr("text-anchor", "middle")
                    .text(v => {
                        return v.tag;
                    })
                    .attr("dy", -15) // just more than half the height of the vehicle svg

                newVehicles
                    .attr("transform", v => {
                        return `translate(${projection([v.lon, v.lat]).join(',')})`;
                    })
            }
        });
    }

    SFMap() {
        let svg = d3.select('#sfmap')
                    .append("svg")
                    .attr("width", SFMUNI_CONST.MAP_WIDTH)
                    .attr("height", SFMUNI_CONST.MAP_HEIGHT)
        svg.append("g").attr("id", "neighbourhoods");
        svg.append("g").attr("id", "streets");
        svg.append("g").attr("id", "arteries");
        svg.append("g").attr("id", "freeways");
        svg.append("g").attr("id", "vehicles");

        d3.queue()
            .defer(d3.json, neighbourhoods)
            .defer(d3.json, streets)
            .defer(d3.json, arteries)
            .defer(d3.json, freeways)
            .await((error, neighbourhoods, streets, arteries, freeways) => {
                if (error) {
                    throw error;
                } else {
                    let projection = d3.geoMercator();
                    let path = d3.geoPath(projection);
                    projection.fitSize([SFMUNI_CONST.MAP_WIDTH, SFMUNI_CONST.MAP_HEIGHT], neighbourhoods)
                    
                    d3.select("#neighbourhoods")
                        .selectAll("path")
                        .data(neighbourhoods.features)
                        .enter()
                        .append("path")
                        .attr("d", path)

                    d3.select("#streets")
                        .selectAll("path")
                        .data(streets.features)
                        .enter()
                        .append("path")
                        .attr("d", path)

                    d3.select("#arteries")
                        .selectAll("path")
                        .data(arteries.features)
                        .enter()
                        .append("path")
                        .attr("d", path)

                    d3.select("#freeways")
                        .selectAll("path")
                        .data(freeways.features)
                        .enter()
                        .append("path")
                        .attr("d", path)
                }
            });
    }

    render() {
        return(
            <div id="sfmap" />
        )
    }
}