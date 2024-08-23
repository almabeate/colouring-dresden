import React, { FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label, Cell, LabelList } from 'recharts';
import './sust_report.css';
import {
    EmailIcon, FacebookMessengerIcon,
    TelegramIcon, WhatsappIcon,
    EmailShareButton, FacebookShareButton,
    TelegramShareButton, WhatsappShareButton
} from "react-share";


//Please install recharts!
interface SustReportProps {
    selectedBuildingId: number;
    ownGas: number;
    ownElectricity: number;
    living_area: number;
    averageGas: number;
    averageElectricity: number;
    count_contributors: number;
    count_district: number;
    name_district: string;
    place_district_ranking: number;
    username?: string;
    co2effect_min: number;
    co2effect_max: number;
    destination_near: string;
    destination_far: string;
}

export const SustReport: FC<SustReportProps> = ({
    ownElectricity,
    ownGas,
    living_area,
    averageElectricity,
    averageGas,
    count_contributors,
    co2effect_min,
    co2effect_max,
    count_district,
    name_district,
    place_district_ranking,
}) => {
    const shareUrl = 'https://colouring.dresden.ioer.de/view/sustainability';
    const shareUrl_current_window = window.location.href;
    const ownE_m2 = Math.round(ownElectricity*100 / living_area)/100;
    const ownG_m2 = Math.round(ownGas*100/ living_area)/100;
    const totalOwnEnergy = ownGas + ownElectricity;
    const totalOwnEnergy_m2 = Math.round(totalOwnEnergy*100 / living_area)/100;
    const totalAverageEnergy = averageGas + averageElectricity;
    const energyUse_s = [
        {
            name: 'Strom',
            Ihr_Verbrauch: ownE_m2,
            Durchschnitt: averageElectricity,
            fillColor: ownE_m2 > averageElectricity ? '#ff6161' : '#8bc800',
        },
    ];
    const energyUse_g = [
        {
            name: 'Gas',
            Ihr_Verbrauch: ownG_m2,
            Durchschnitt: averageGas,
            fillColor: ownG_m2 > averageGas ? '#ff6161' : '#8bc800',
        }
    ];
    const co2gas =
        3679
        ;
    const co2stom_eco = 119;
    const co2strom_convent = 1859;
    const co2_impact = [
        { art: 'Erneuerbare Energie', gas: co2gas, strom: co2stom_eco },
        { art: 'Konventionelle Energie', gas: co2gas, strom: co2strom_convent },
    ];
    const districtData = [
        { Bezirk: 'Innere Altstadt', Contributors: 13, Durchschnittsverbrauch: 80 }, //Energie pro m2
        { Bezirk: 'Wilsdruffer Vorstadt', Contributors: 9, Durchschnittsverbrauch: 110 },
        { Bezirk: 'Johannstadt', Contributors: 4, Durchschnittsverbrauch: 145 },
        { Bezirk: 'Innere Neustadt', Contributors: 3, Durchschnittsverbrauch: 75 },
    ];


    //für eine bessere Lesbarkeit der Legende
    const renderLegend = (value: string) => <span style={{ color: 'black' }}>{value}</span>;

    return (
        <article>
            <section>
                <h1>
                    Ihr Energieverbrauch im Vergleich
                </h1>
                <h4>Ihr Verbrauch pro Quadratmeter:</h4>
                <p>
                    {totalOwnEnergy_m2 > totalAverageEnergy ?
                        <img className="smiley" src={require('../../../../public/images/smiley_frowning.png')} alt="Smiley" />
                        : <img className="smiley" src={require('../../../../public/images/smiley_happy.png')} alt="Smiley" />}

                    In Ihrem Haushalt wurde pro Quadratmeter {totalOwnEnergy_m2} kWh Energie verbraucht, Sie liegen damit {totalOwnEnergy_m2 > totalAverageEnergy ? 'über' : 'unter'} dem Durchschnitt von {totalAverageEnergy} kWh/m² in Ihrer unmittelbaren Nachbarschaft.
                </p>

                <div className='withTitle'>
                    <h4>Vergleich des Verbrauchs pro Quadratmeter mit der Nachbarschaft</h4>
                    <div className="chart">
                        <div className='chartSideBySide'>
                            <BarChart width={500} height={250} data={energyUse_s}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis>
                                    <Label
                                        value="Verbrauch in kWh/m²"
                                        angle={-90}
                                        position="insideLeft"
                                        style={{ textAnchor: 'middle' }}
                                    />
                                </YAxis>
                                <Tooltip />
                                {/*<Legend formatter={renderLegend} />
                                */}
                                <Bar dataKey="Ihr_Verbrauch" name="Ihr Wert" >
                                    {energyUse_s.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fillColor} />
                                    ))}
                                </Bar>
                                <Bar dataKey="Durchschnitt" fill="#aaaaaa" name="Durchschnitt" />
                            </BarChart>
                        </div>
                        <div className="chartSideBySide">
                            <BarChart width={500} height={250} data={energyUse_g}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis>
                                    <Label
                                        value="Verbrauch in kWh/m²"
                                        angle={-90}
                                        position="insideLeft"
                                        style={{ textAnchor: 'middle' }}
                                    />
                                </YAxis>
                                <Tooltip />
                                {/*<Legend formatter={renderLegend} />
                                */}
                                <Bar dataKey="Ihr_Verbrauch" name="Ihr Wert" >
                                    {energyUse_g.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fillColor} />
                                    ))} </Bar>
                                <Bar dataKey="Durchschnitt" fill="#aaaaaa" name="Durchschnitt" />

                            </BarChart>
                        </div>
                    </div>
                    <img className="legend" src={require('../../../../public/images/Legende_option2.png')} alt="Legende der ersten beiden Diagramme: Grün bzw rot steht für Ihre Werte, grau für den Durchschnitt der Nachbarschaft" />
                    <p className='anmerkung'>*Wenn Ihr Verbrauch unter dem Durchschnittlichen Verbrauch der Nachbarschaft liegt, ist Ihr Verbrauch in rot dargestellt, wenn Ihr Verbrauch unterdurchschnittlich ist dann ist er grün gekennzeichnet. </p>
                </div>

                <p>
                    <h4>CO2-Emissionen:</h4>
                    <details>
                        <summary>Der Verbrauch Ihres gesamten Haushalts verursacht in etwa {Math.round(co2effect_min / 10) * 10} bis {Math.round(co2effect_max / 10) * 10} Kg CO2. </summary>
                        <div className='withTitle'>
                            <h4>Die CO2-Emissionen je nach Art der Stromgewinnung</h4>
                            <div className="chart">

                                <BarChart width={500} height={250} data={co2_impact} layout="vertical" >
                                    <XAxis type="number" />
                                    <YAxis dataKey="art" type="category" tickMargin={100} />
                                    <Tooltip />
                                    <Legend formatter={renderLegend} />
                                    <Bar dataKey="gas" fill="#ab8fb0" stackId="a" name="CO2 Emissionen durch Gas-Verbrauch in kg" >
                                        <LabelList dataKey="art" position="insideLeft" fill='black' />
                                    </Bar>
                                    <Bar dataKey="strom" fill="#ffe14c" stackId="a" name="CO2 Emissionen durch Strom-Verbrauch in kg" />
                                </BarChart>

                            </div>
                        </div>
                        <p>
                        <img className="big_icon" src={require('../../../../public/images/save_energy.png')} alt="Symbol fürs Energiesparen" />
                            <a href="https://www.co2online.de/energie-sparen/" target="_blank" rel="noopener noreferrer">Hier Energiespartipps erhalten</a> 
                        </p>
                    </details>
                </p>

                <p>
                    <h4>Vergleich der Stadtteile:</h4>
                    <details>
                        <summary>In Ihrer Nachbarschaft haben {count_contributors} Haushalte teilgenommen. </summary>
                        <div className='withTitle'>
                            <h4>Das Stadtteilranking
                            <img className="big_icon" src={require('../../../../public/images/Ranking_pokal.png')} alt="Symbol für einen Wettbewerb" />
                            </h4>
                            <div className="chart">
                                <div className="chartSideBySide">
                                    <BarChart width={500} height={250} data={districtData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <YAxis dataKey="Bezirk" type="category" tickMargin={100} />
                                        <XAxis type="number" />
                                        <Tooltip />
                                        <Legend formatter={renderLegend} />
                                        <Bar dataKey="Durchschnittsverbrauch" fill="#6bb1e3" name="Durchschnittlicher Verbrauch in kWh/m² pro Jahr"  >
                                            <LabelList dataKey="Bezirk" position="insideLeft" fill='black' />
                                        </Bar>
                                    </BarChart>

                                </div>
                                <div className='chartSideBySide'>

                                    <BarChart width={500} height={250} data={districtData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <YAxis dataKey="Bezirk" type="category" tickMargin={100} />
                                        <XAxis type="number" />
                                        <Tooltip />
                                        <Legend formatter={renderLegend} />
                                        <Bar dataKey="Contributors" fill="#6bb1e3" name="Anzahl der Contributors" >
                                            <LabelList dataKey="Bezirk" position="insideLeft" fill='black' />
                                        </Bar>
                                    </BarChart>

                                </div>

                            </div>
                        </div>
                    </details>
                </p>
                {/*<p>
                    <FacebookShareButton url={shareUrl}>
                        <FacebookMessengerIcon size={32} round={true} />
                    </FacebookShareButton>

                </p>*/}
                <p>
                <img className="share_img" src={require('../../../../public/images/share_icon.png')} alt="Symbol fürs Teilen der Website" />
                <a href={shareUrl}>Hier können Sie Ihre Nachbar*innen einladen auch mitzumachen. </a>
            
                </p>
                <p>
                    <details className="rightSided">
                        <summary>Quellen und weitere Informationen </summary>
                        <p>Berechnungen: ... </p>
                        <p>Quellen: <a href='#'>Links</a>  </p>
                    </details>
                </p>
            </section>
        </article>
    );
}
