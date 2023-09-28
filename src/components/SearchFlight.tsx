import { useState, useEffect } from "react";
import styled from "styled-components";
import { Address, toNano } from "ton";
import { useTonConnect } from "../hooks/useTonConnect";
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import { Slider } from '@mui/material';

export function SearchFlight() {
  const { sender, connected } = useTonConnect();

  //let placesSuggestion: any = [];
  const [placesSuggestion, setPlacesSuggestion] = useState([]);
  const [place0, setPlace0] = useState("");

  const [cityDeparture, setCityDeparture] = useState("");
  const [cityDepartureVal, setCityDepartureVal] = useState("");
  const [city1, setCity1] = useState("");
  const [city2, setCity2] = useState("");
  const [cityDays, setcityDays] = useState("1");
  const [adults, setAdults] = useState("1");

  const [sliderValue, setSliderValue] = useState(1);

  const [departureDate, setDepartureDate] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsCity1, setSuggestionsCity1] = useState<Suggestion[]>([]);
  const [suggestionClicked, setSuggestionClicked] = useState(false);
  const [responses, setResponses] = useState(null);
  const [responsesLink, setResponsesLink] = useState(null);



  const getCurrentDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  interface Suggestion {
    entityId: string;
    iataCode: string;
    parentId: string;
    name: string;
    countryId: string;
    countryName: string;
    cityName: string;
    location: string;
    hierarchy: string;
    type: string;
    highlighting: number[][];
  }

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
      let bestFlight = [];
      let bestFlight2 = [];

      for (let i = 0; i < 10; i++) {
        try {
          bestFlight = await buscarVuelo(cityDeparture, city1, city2, cityDays, departureDate, adults);
          bestFlight2 = await buscarVuelo(cityDeparture, city2, city1, cityDays, departureDate, adults);
          break;
        } catch (error) {
          console.error(`Error fetching flight data. Retrying... (${i + 1}/10)`);
          await delay(15000);

        }
      }

      if (bestFlight[0] > bestFlight2[0]) {
        bestFlight = bestFlight2;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function buscarVuelo(cityDeparture: string, city1: string, city2: string, cityDays: string, departureDate: string, adults: string) {
    let flightData = [];

    const departure = departureDate.split("-");
    let date = new Date(parseInt(departure[0]), parseInt(departure[1]), parseInt(departure[2]));
    console.log(departure[0])
    console.log(date)

    //cityDays = parseInt(cityDays);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    console.log(date + " date1")
    date.setDate(day + parseInt(cityDays));
    const day2 = date.getDate();
    const month2 = date.getMonth() + 1;
    const year2 = date.getFullYear();
    console.log(date + " date2")
    date.setDate(day2 + parseInt(cityDays));
    const day3 = date.getDate();
    const month3 = date.getMonth() + 1;
    const year3 = date.getFullYear();
    console.log(date + " date3")

    const url = "https://corsproxy2.armsves.workers.dev/corsproxy/";
    const headers = {};
    //const url = "https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/create/";
    //const headers = { " x-api-key" : "sh428739766321522266746152871799" };
    //url = 'https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/create'
    /*const headers = {
        'x-api-key': 'prtl6749387986743898559646983194',
        'Content-Type': 'application/json'
    }*/

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
        body: JSON.stringify(data),
        //mode: 'no-cors'
      });

      if (response.ok) {
        const vuelosFinal = await response.json();


        const jsonObject = vuelosFinal['content']['results']['itineraries'];
        const jsonArray: any = Object.values(jsonObject);
        console.log(jsonObject)

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

  function fetchSuggestions(inputField: string) {
    if (inputField.length > 2) {
      const url = 'https://corsautosuggest.armsves.workers.dev/corsproxy/';
      //const searchTerm = inputField.value;
      const data = {
        query: {
          market: 'UK',
          locale: 'en-GB',
          searchTerm: inputField,
          includedEntityTypes: ['PLACE_TYPE_CITY', 'PLACE_TYPE_COUNTRY', 'PLACE_TYPE_AIRPORT']
        },
        limit: 5,
        isDestination: true
      };

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then((data: { places: Suggestion[] }) => {
          setSuggestions(data.places); // Set the suggestions in state
        })
        .catch(error => console.error('Error:', error));
    }
  }

  function boldenMatch(text: string, highlighting: string) {
    let boldenedText = text;

    if (highlighting && highlighting.length > 0) {
      const start = highlighting[0][0];
      const end = highlighting[0][1];
      //boldenedText = text.substring(0, start) + '<strong>' + text.substring(start, end) + '</strong>' + text.substring(end);
    }
    return boldenedText;
  }

  useEffect(() => {
    if (cityDeparture.length >= 2 && !suggestionClicked) {
      fetchSuggestions(cityDeparture);
    } else {
      setSuggestions([]);
    }
  }, [cityDeparture]);

  useEffect(() => {
    if (city1.length >= 2 && !suggestionClicked) {
      fetchSuggestions(city1);
    } else {
      setSuggestions([]);
    }
  }, [city1]);

  // Function to handle suggestion click
  function handleSuggestionClick(place: Suggestion) {
    // Update the input field with name and country name
    const newValue = `${place.cityName}, ${place.countryName} (${place.iataCode})`;
    setCityDeparture(newValue);
    setCityDepartureVal(`${place.iataCode}`);
    setSuggestionClicked(true);

  }

  //******* */

  return (
    <Card>
      <FlexBoxCol>
        <h3>Search Flight</h3>
        <FlexBoxRow>
          <label>Departure City: </label>
          <Input style={{ width: '150px' }} value={cityDeparture} onChange={(e) => { setCityDeparture(e.target.value); setSuggestionClicked(false); }} ></Input>
          <div>
            {suggestions.map((place: Suggestion, index) => (
              <p key={index} onClick={() => handleSuggestionClick(place)} style={{ cursor: 'pointer' }}>
                {`${place.cityName}, ${place.countryName} (${place.iataCode})`}
              </p>
            ))}
          </div>
        </FlexBoxRow>

        <FlexBoxRow>
          <label>City 1: </label>
          <Input style={{ width: '150px' }} value={city1} onChange={(e) => setCity1(e.target.value)} ></Input>
          <div>
            {suggestionsCity1.map((place: Suggestion, index) => (
              <p key={index} onClick={() => handleSuggestionClick(place)} style={{ cursor: 'pointer' }}>
                {`${place.cityName}, ${place.countryName} (${place.iataCode})`}
              </p>
            ))}
          </div>
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

        <Button style={{
          marginTop: 18,
          background: 'linear-gradient(45deg, #572785, #ec1e79, #28abe2, #f15a24, #fbb03b)',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '45px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          cursor: 'pointer',
          textDecoration: 'none',
          textShadow: '0 0 2px black',
        }}
          onClick={async () => { buscarVuelo(cityDepartureVal, city1, city2, cityDays, departureDate, adults); }}
        >Search</Button>
      </FlexBoxCol>
      <FlexBoxCol>
        {responses ? (
          <div>
            <h3>The Best price is: €{JSON.stringify(responses, null, 2)}</h3>
            <p><a style={{
                  background: 'linear-gradient(45deg, #572785, #ec1e79, #28abe2, #f15a24, #fbb03b)',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '45px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  textShadow: '0 0 2px black',
            }}
            href={responsesLink ? (responsesLink) : ("")} target="_blank">Buy Tickets</a></p>
          </div>
        ) : (
          <></>
        )}
      </FlexBoxCol>
    </Card>
  );
}
