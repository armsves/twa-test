import { useState, useEffect } from "react";
import styled from "styled-components";
import { Address, toNano } from "ton";
import { useTonConnect } from "../hooks/useTonConnect";
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import { Slider } from '@mui/material';

export function SearchFlight() {
  const { sender, connected } = useTonConnect();

  const [cityDeparture, setCityDeparture] = useState("");
  const [city1, setCity1] = useState("");
  const [city2, setCity2] = useState("");
  const [cityDays, setcityDays] = useState("1");
  const [adults, setAdults] = useState("1");

  const [sliderValue, setSliderValue] = useState(1);

  const [departureDate, setDepartureDate] = useState("");

  const getCurrentDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const value = 0;

  const handleSliderChange = () => {
    setSliderValue(value);
  };

  //**************** */

  async function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async function displayData(cityDeparture: string, city1: string, city2: string, cityDays: string, departureDate: string, adults: string) {
    try {
      const loadingAnimation = document.getElementById('loadingAnimation');
      //loadingAnimation.style.display = 'block';
      let bestFlight = [];
      let bestFlight2 = [];

      for (let i = 0; i < 10; i++) {
        try {
          bestFlight = await buscarVuelo(cityDeparture, city1, city2, cityDays, departureDate, adults);
          bestFlight2 = await buscarVuelo(cityDeparture, city2, city1, cityDays, departureDate, adults);
          break;
        } catch (error) {
          console.error(`Error fetching flight data. Retrying... (${i + 1}/10)`);
          await delay(1500);
        }
      }

      if (bestFlight[0] > bestFlight2[0]) {
        bestFlight = bestFlight2;
      }

      //const link = document.getElementById("link");
      //const precio = document.getElementById("precio");
      //const agents = document.getElementById("agents");
      //precio.innerHTML = bestFlight[0] / 1000;
      //agents.innerHTML = bestFlight[1];
      //link.setAttribute("href", bestFlight[2]);
      //loadingAnimation.style.display = 'none';
      //const results = document.getElementById('results');
      //results.style.display = 'block';
    } catch (error) {
      console.error(error);
    }
  }

  async function buscarVuelo(cityDeparture: string, city1: string, city2: string, cityDays: string, departureDate: string, adults: string) {
    let flightData = [];
    const url = "https://corsproxy.armsves.workers.dev/corsproxy/";

    console.log(departureDate)
    const departure = departureDate.split("-");
    let date = new Date(parseInt(departure[0]), parseInt(departure[1]), parseInt(departure[2]));
    console.log(departure[0])
    console.log(date)

    //cityDays = parseInt(cityDays);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    console.log(date)
    date.setDate(parseInt(day + cityDays));
    const day2 = date.getDate();
    const month2 = date.getMonth() + 1;
    const year2 = date.getFullYear();
    console.log(date)
    date.setDate(parseInt(day2 + cityDays));
    const day3 = date.getDate();
    const month3 = date.getMonth() + 1;
    const year3 = date.getFullYear();
    console.log(day3)


    const headers = {};
    const data = {
      "query": {
        "market": "US",
        "locale": "en-US",
        "currency": "EUR",
        "query_legs": [
          {
            "origin_place_id": { "iata": cityDeparture },
            "destination_place_id": { "iata": city1 },
            "date": { "year": year, "month": month, "day": day }
          },
          {
            "origin_place_id": { "iata": city1 },
            "destination_place_id": { "iata": city2 },
            "date": { "year": year2, "month": month2, "day": day2 }
          },
          {
            "origin_place_id": { "iata": city2 },
            "destination_place_id": { "iata": cityDeparture },
            "date": { "year": year3, "month": month3, "day": day3 }
          }
        ],
        "adults": 1,
        "cabin_class": "CABIN_CLASS_ECONOMY",
        "nearbyAirports": false
      }
    };
    console.log(data)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const vuelosFinal = await response.json();


        const jsonObject = vuelosFinal['content']['results']['itineraries'];
        const jsonArray: any = Object.values(jsonObject);
        //const jsonArray = jsonObject.values;

        jsonArray.sort((a: any, b: any) => {
          console.log(a["pricingOptions"][0]["price"]["amount"] + " /n")
          const amountA = parseInt(a["pricingOptions"][0]["price"]["amount"]);
          const amountB = parseInt(b["pricingOptions"][0]["price"]["amount"]);
          if (amountA < amountB) { return -1; } else if (amountA > amountB) { return 1; } else { return 0; }
        });
        const flightData = [jsonArray[0]["pricingOptions"][0]["price"]["amount"] / 1000, jsonArray[0]["pricingOptions"][0]["agentIds"][0], jsonArray[0]["pricingOptions"][0]["items"][0]["deepLink"]];

        if (flightData != null) { jsonArray[0]["pricingOptions"][0]["price"]["amount"] / 1000; }
        setResponses(flightData[0]);
        setResponsesLink(flightData[2]);
        console.log(flightData[0]);
        console.log(flightData[2]);
        return flightData;
      } else {
        console.log('Request failed with status code:', response.status);
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      throw error;
    }
  }

  //***************** */
  const [responses, setResponses] = useState(null);
  const [responsesLink, setResponsesLink] = useState(null);

  async function fetchData() {
    try {
      const response = await fetch("https://pokeapi.co/api/v2/ability/3");
      if (response.ok) {
        const data = await response.json();
        setResponses(data);
      } else {
        console.error('API request failed with status code:', response.status);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  //**********

  //
  //<Input style={{ marginRight: 8 }} type="number" value={tonAmount} onChange={(e) => setTonAmount(e.target.value)}></Input>
  //<Input type="number" value={cityDeparture} onChange={(e) => setCityDeparture(e.target.value)} >
  //<Slider aria-label="Columns" value={sliderValue} onChange={handleSliderChange} min={1} max={6} step={1} />
  //<Input type="number" min="1" value={cityDays} onChange={(e) => setcityDays(e.target.value)} ></Input>
  //<Input value={cityDeparture} onChange={(e) => setCityDeparture(e.target.value)} ></Input>
  //  <Slider aria-label="Columns" value={sliderValue} onChange={handleSliderChange} min={1} max={6} step={1} />
  return (
    <Card>
      <FlexBoxCol>
        <h3>Search Flight</h3>
        <FlexBoxRow>
          <label>Departure City: </label>
          <Input style={{ width: '150px' }} value={cityDeparture} onChange={(e) => setCityDeparture(e.target.value)} ></Input>
        </FlexBoxRow>

        <FlexBoxRow>
          <label>City 1: </label>
          <Input style={{ width: '150px' }} value={city1} onChange={(e) => setCity1(e.target.value)} ></Input>
        </FlexBoxRow>

        <FlexBoxRow>
          <label>City 2: </label>
          <Input style={{ width: '150px' }} value={city2} onChange={(e) => setCity2(e.target.value)} ></Input>
        </FlexBoxRow>

        <FlexBoxRow>
          <label>Days in each city: </label>
          <Input style={{ width: '50px' }} type="number" min="1" value={cityDays} onChange={(e) => setcityDays(e.target.value)} ></Input>

          <label>How many adults: </label>
          <Input style={{ width: '50px' }} type="number" min="1" value={adults} onChange={(e) => setAdults(e.target.value)} ></Input>
          </FlexBoxRow>

        <FlexBoxRow>
          <label>Date of departure: </label>
          <Input style={{ width: '100px' }} type="date" value={departureDate} min={getCurrentDate()} onChange={(e) => setDepartureDate(e.target.value)} ></Input>

        </FlexBoxRow>

        <Button style={{ marginTop: 18 }}
          onClick={async () => { buscarVuelo(cityDeparture, city1, city2, cityDays, departureDate, adults); }}
        >Search</Button>
      </FlexBoxCol>
      <FlexBoxCol>
        {responses ? (
          <div>
            <h3>The Best price is: €{JSON.stringify(responses, null, 2)}</h3>
            <p><a href={responsesLink ? (responsesLink) : ("")} target="_blank">Buy Tickets</a></p>
          </div>
        ) : (
          <></>
        )}
      </FlexBoxCol>
    </Card>
  );
}
