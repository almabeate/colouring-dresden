import React, { Fragment, useState } from 'react';
import { NavLink, Redirect } from 'react-router-dom';
import Confetti from 'canvas-confetti';
import _ from 'lodash';

import { apiPost, apiGet } from '../apiHelpers';
import { sendBuildingUpdate } from '../api-data/building-update';
import ErrorBox from '../components/error-box';
import InfoBox from '../components/info-box';
import { compareObjects } from '../helpers';
import { Building, BuildingEdits, BuildingUserAttributes, UserVerified } from '../models/building';
import { BuildingMapTileset } from '../config/tileserver-config';
import { User } from '../models/user';

import ContainerHeader from './container-header';
import { CategoryViewProps, CopyProps } from './data-containers/category-view-props';
import { CopyControl } from './header-buttons/copy-control';
import { ViewEditControl } from './header-buttons/view-edit-control';

import './data-container.css';
import { dataFields } from '../config/data-fields-config'

import { EditHistoryLatest } from './edit-history/edit-history-latest';

import { InfoIconSimple } from '../components/icons';

import SurveyModal from '../components/survey-modal';
//import SusPopup from '../components/sus-output-modal';


import { CCConfig } from '../../cc-config';
let config: CCConfig = require('../../cc-config.json')



interface DataContainerProps {
    title: string;
    cat: string;
    intro: string;
    help: string;
    inactive?: boolean;

    user?: User;
    mode: 'view' | 'edit';
    building?: Building;
    user_verified?: any;
    onBuildingUpdate: (buildingId: number, updatedData: Building) => void;
    onUserVerifiedUpdate: (buildingId: number, updatedData: UserVerified) => void;

    mapColourScale: BuildingMapTileset;
    onMapColourScale: (x: BuildingMapTileset) => void;
}

interface DataContainerState {
    error: string;
    copying: boolean;
    keys_to_copy: {[key: string]: boolean};
    currentBuildingId: number;
    currentBuildingRevisionId: number;
    buildingEdits: BuildingEdits;
    mapColourScale: BuildingMapTileset;
    onMapColourScale: (x: BuildingMapTileset) => void;
    setShowSurveyModal: boolean;
}

export type DataContainerType = React.ComponentType<DataContainerProps>;

/**
 * Shared functionality for view/edit forms
 *
 * See React Higher-order-component docs for the pattern
 * - https://reactjs.org/docs/higher-order-components.html
 *
 * @param WrappedComponent
 */
const withCopyEdit: (wc: React.ComponentType<CategoryViewProps>) => DataContainerType = (WrappedComponent: React.ComponentType<CategoryViewProps>) => {
    return class DataContainer extends React.Component<DataContainerProps, DataContainerState> {
        constructor(props) {
            super(props);

            this.state = {
                error: undefined,
                copying: false,
                keys_to_copy: {},
                buildingEdits: {},
                currentBuildingId: undefined,
                currentBuildingRevisionId: undefined,
                mapColourScale: undefined,
                onMapColourScale: undefined,
                setShowSurveyModal: false
            };

            this.handleChange = this.handleChange.bind(this);
            this.handleReset = this.handleReset.bind(this);
            this.handleSubmit = this.handleSubmit.bind(this);
            this.handleVerify = this.handleVerify.bind(this);
            this.handleSaveAdd = this.handleSaveAdd.bind(this);
            this.handleSaveChange = this.handleSaveChange.bind(this);

            this.toggleCopying = this.toggleCopying.bind(this);
            this.toggleCopyAttribute = this.toggleCopyAttribute.bind(this);
        }

        static getDerivedStateFromProps(props, state): DataContainerState {
            const newBuildingId = props.building == undefined ? undefined : props.building.building_id;
            const newBuildingRevisionId = props.building == undefined ? undefined : props.building.revision_id;

            const categoryKeys = {};
            const blackListedKeys = ['current_landuse_order',
                                     'current_landuse_verified',
                                     'planning_list_grade',
                                     'likes_total',
                                     'community_type_worth_keeping_total',
                                     'community_local_significance_total',
                                     'community_expected_planning_application_total',
                                     'thermal_stress_objective',
                                     'thermal_stress_subjective',
                                     'direction_of_windows',
                                     'heat_adaption_measure',
                                     'rain_flood_preventive_measures1',
                                     'rain_flood_preventive_measures2',
                                     'rain_flood_preventive_measures3',
                                     'rain_flood_historic_incidents',
                                     'size_height_apex',
                                     'location_number',
                                     'location_street',
                                     'location_town',
                                     'location_postcode',
                                     'ref_toid',
                                     'ref_osm_id',
                                     'ref_osm_type',
                                     'ref_land_parcel',
                                     'location_latitude',
                                     'location_longitude',
                                     'planning_data'
                                    ]
            for (let key in dataFields) {  
                let fieldName = props.building == undefined ? undefined : props.building[key];    
                if (dataFields[key].category == props.cat && fieldName != null && !blackListedKeys.includes(key)){
                    categoryKeys[key] = true;
                }
                if (props.cat == 'team' && key == 'date_year' && fieldName != null && !blackListedKeys.includes(key)){
                    categoryKeys[key] = true;
                }
            }
            if(newBuildingId !== state.currentBuildingId || newBuildingRevisionId > state.currentBuildingRevisionId) {
                return {
                    error: undefined,
                    copying: false,
                    keys_to_copy: categoryKeys,
                    buildingEdits: {},
                    currentBuildingId: newBuildingId,
                    currentBuildingRevisionId: newBuildingRevisionId,
                    mapColourScale: props.mapColourScale,
                    onMapColourScale: props.onMapColourScale, 
                    setShowSurveyModal: false
                };
            }

            return null;
        }

        /**
         * Enter or exit "copying" state - allow user to select attributes to copy
         */
        toggleCopying() {
            this.setState({
                copying: !this.state.copying
            });
        }

        /**
         * Keep track of data to copy (accumulate while in "copying" state)
         *
         * @param {string} key
         */
        toggleCopyAttribute(key: string) {
            const keys = {...this.state.keys_to_copy};
            if(this.state.keys_to_copy[key]){
                delete keys[key];
            } else {
                keys[key] = true;
            }
            this.setState({
                keys_to_copy: keys
            });
        }

        isEdited() {
            // check if the edits object has any fields
            return !_.isEmpty(this.state.buildingEdits);
        }

        clearEdits() {
            this.setState({
                buildingEdits: {}
            });
        }

        getEditedBuilding() {
            if(this.isEdited()) {
                return Object.assign({}, this.props.building, this.state.buildingEdits);
            } else {
                return {...this.props.building};
            }
        }

        updateBuildingState(key: string, value: any) {
            const newBuilding = this.getEditedBuilding();
            newBuilding[key] = value;
            const [forwardPatch] = compareObjects(this.props.building, newBuilding);

            this.setState({
                buildingEdits: forwardPatch
            });
        }

        /**
         * Handle update directly
         * - e.g. as callback from MultiTextInput where we set a list of strings
         *
         * @param {String} name
         * @param {*} value
         */
        handleChange(name: string, value: any) {
            this.updateBuildingState(name, value);
        }

        handleReset() {
            this.clearEdits();
        }





        async getSurveyPopUpStatus(): Promise<void> {
            /* depending on value in config file, API including SQL function will be triggered or not */
            if (config.enable_survey_popup == true){
                try {
                    const user = await apiGet('/api/users/get_survey_popup_status');
                    if (user.error) {

                        this.setState({
                            setShowSurveyModal: false
                        });
            
                    } else {
                        /* setUser(user); */
                        console.log(user[0].value);
                        /* convert API JSON response into boolean */
                        var bool_value = false
                        if ((user[0].value == "first") || (user[0].value == "second")){
                            bool_value = true;
                        }
                        /* var bool_value = user[0].value == "true" ? true : false; */
                        
                        /* console.log(bool_value); */
                        /* console.log(typeof(bool_value)); */
            
                        this.setState({
                            setShowSurveyModal: bool_value
                        });
            
                    }
                } catch(err) {
                    /* setUserError('Error loading user info.'); */
                    this.setState({
                        setShowSurveyModal: false
                    });
            
                }
            }
        };




        async doSubmit(edits: Partial<Building & BuildingUserAttributes>) {
            this.setState({error: undefined});
            
            try {
                const buildingUpdate = await sendBuildingUpdate(this.props.building.building_id, edits);
                const updatedBuilding = Object.assign({}, this.props.building, buildingUpdate);
                this.props.onBuildingUpdate(this.props.building.building_id, updatedBuilding);

                /* trigger modal/popup show after saving changes */
                this.getSurveyPopUpStatus();


            } catch(error) {
                this.setState({ error });
            }
        }

        async handleSubmit(event) {
            event.preventDefault();
            
            this.doSubmit(this.state.buildingEdits);
        }

        async handleSaveAdd(slug: string, newItem: any) {
            if(this.props.building[slug] != undefined && !Array.isArray(this.props.building[slug])) {
                this.setState({error: 'Unexpected error'});
                console.error(`Sie versuchen ein neues Element dem Feld (${slug}) hinzuzufügen, welches keine Liste ist.`);
                return;
            }
            
            if(this.isEdited()) {
                this.setState({error: 'Neuer Eintrag kann nicht gespeichert werden, da noch ungespeicherte Änderungen existieren.'});
                return;
            }
            
            const edits = {
                [slug]: [...(this.props.building[slug] ?? []), newItem]
            };
            
            this.doSubmit(edits);
        }

        async handleSaveChange(slug: string, value: any) {
            if(this.isEdited()) {
                this.setState({ error: 'Wert kann nicht geändert werden, solange es ungesicherte Änderungen gibt. Speichern oder verwerfen Sie die Änderungen zuerst.'});
                return;
            }

            const edits = {
                [slug]: value
            };

            this.doSubmit(edits);
        }

        async handleVerify(slug: string, verify: boolean, x: number, y: number) {
            const verifyPatch = {};
            if (verify) {
                verifyPatch[slug] = this.props.building[slug];
            } else {
                verifyPatch[slug] = null;
            }

            try {
                const data = await apiPost(
                    `/api/buildings/${this.props.building.building_id}/verify.json`,
                    verifyPatch
                );

                if (data.error) {
                    this.setState({error: data.error});
                } else {
                    if (verify) {
                        Confetti({
                            angle: 60,
                            disableForReducedMotion: true,
                            particleCount: 200,
                            ticks: 300,
                            origin: {x, y},
                            zIndex: 2000
                        });
                    }
                    this.props.onUserVerifiedUpdate(this.props.building.building_id, data);
                }
            } catch(err) {
                this.setState({error: err});
            }
            
            if (slug == 'current_landuse_group'){
                const edits = {
                    'current_landuse_verified': true
                };

                this.doSubmit(edits);
            }
            console.log(slug + " verify button clicked")
        }

        render() {
            const currentBuilding = this.getEditedBuilding();

            const values_to_copy = {};
            for (const key of Object.keys(this.state.keys_to_copy)) {
                values_to_copy[key] = currentBuilding[key];
            }
            const data_string = JSON.stringify(values_to_copy);
            const copy: CopyProps = {
                copying: this.state.copying,
                toggleCopying: this.toggleCopying,
                toggleCopyAttribute: this.toggleCopyAttribute,
                copyingKey: (key: string) => this.state.keys_to_copy[key]
            };

            const headerBackLink = `/${this.props.mode}/categories${this.props.building != undefined ? `/${this.props.building.building_id}` : ''}`;
            const edited = this.isEdited();

            return (
                <section
                    id={this.props.cat}
                    className="data-section">



                <SurveyModal
                    show={this.state.setShowSurveyModal}
                    title="Umfrage"
                    description="Wir brauchen deine Rückmeldung! Nur mit dir können wir die Webseite verbessern und Gebäude in Dresden erforschen. Jede Stimme zählt."
                    confirmButtonText="Schließen"
                    confirmButtonClass="btn-secondary"
                    onConfirm={() => this.setState({setShowSurveyModal:false})}
                    onCancel={() => this.setState({setShowSurveyModal:false})}
                />
                {/*Uncomment, when needed for the Sustanability/Output*/}
                {/* <SusPopup
                    show={this.state.setShowSusPopupContent}
                    title="Titel im Data-Container"
                    description="Beschreibung im Data-Conatiner"
                    confirmButtonText="Schließen"
                    confirmButtonClass="btn-secondary"
                    onConfirm={() => this.setState({setShowSusPopupContent:false})}
                    onCancel={() => this.setState({setShowSusPopupContent:false})}
                />*/}

                <ContainerHeader
                    cat={this.props.cat}
                    title={this.props.title}
                >
                {
                    this.props.help && !copy.copying?
                        <a
                            className="icon-button help"
                            title="Mehr erfahren"
                            href={this.props.help}
                            target="_blank">
                            <InfoIconSimple />
                        </a>
                    : null
                }
                {
                    this.props.building != undefined && !this.props.inactive ?
                        <>
                            <CopyControl
                                cat={this.props.cat}
                                data_string={data_string}
                                copying={copy.copying}
                                toggleCopying={copy.toggleCopying}
                            />
                            {
                                !copy.copying ?
                                <>
                                    <NavLink
                                        className="icon-button history"
                                        to={`/${this.props.mode}/${this.props.cat}/${this.props.building.building_id}/history`}
                                    >Historie</NavLink>
                                    <ViewEditControl
                                        cat={this.props.cat}
                                        mode={this.props.mode}
                                        building={this.props.building}
                                    />
                                </>
                                :
                                null
                            }
                        </>
                    : null
                }
                </ContainerHeader>
                <div className="section-body">
                <EditHistoryLatest
                    building={this.props.building}
                />
                {
                    this.props.inactive ?
                        <Fragment>
                            <WrappedComponent
                                intro={this.props.intro}
                                building={this.props.building}
                                mode={this.props.mode}
                                edited={false}
                                copy={copy}
                                onChange={undefined}
                                onVerify={undefined}
                                onSaveAdd={undefined}
                                onSaveChange={undefined}
                                user_verified={[]}
                                mapColourScale={undefined}
                                onMapColourScale={undefined}
                            />
                        </Fragment> :
                        this.props.building != undefined ?
                            <form
                                action={`/edit/${this.props.cat}/${this.props.building.building_id}`}
                                method="POST"
                                onSubmit={this.handleSubmit}>
                                    {/* this disabled button prevents form submission on enter - see https://stackoverflow.com/a/51507806/1478817 */}
                                    <button type="submit" disabled style={{display: 'none'}}></button>
                                {
                                    (this.props.mode === 'edit' && !this.props.inactive) ?
                                        <div className='edit-bar'>
                                            <ErrorBox msg={this.state.error} />
                                            {
                                                this.props.cat !== 'like' && // special-case for likes
                                                    <div className="buttons-container with-space">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary"
                                                            disabled={!edited}
                                                            aria-disabled={!edited}
                                                        >
                                                            Änderungen speichern
                                                        </button>
                                                        {
                                                            edited ?
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-warning"
                                                                    onClick={this.handleReset}
                                                                    >
                                                                    Änderungen verwerfen
                                                                </button> :
                                                                null
                                                        }
                                                    </div>
                                            }
                                        </div>
                                        : null
                                }
                                <WrappedComponent
                                    intro={this.props.intro}
                                    building={currentBuilding}
                                    mode={this.props.mode}
                                    edited={edited}
                                    copy={copy}
                                    onChange={this.handleChange}
                                    onVerify={this.handleVerify}
                                    onSaveAdd={this.handleSaveAdd}
                                    onSaveChange={this.handleSaveChange}
                                    user_verified={this.props.user_verified}
                                    user={this.props.user}
                                    mapColourScale={this.props.mapColourScale}
                                    onMapColourScale={this.props.onMapColourScale}
                                />
                            </form> :
                            <InfoBox msg="Wählen Sie ein Gebäude aus um die Daten zu sehen."></InfoBox>
                }
                </div>







                </section>
            );
        }
    };
};

export default withCopyEdit;
