import { useState, useEffect } from "react";
import styled from "styled-components";
import { Address, toNano } from "ton";
import { useTonConnect } from "../hooks/useTonConnect";
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import { Slider } from '@mui/material';



export function SearchFlight() {
  const { sender, connected } = useTonConnect();

  const [tonAmount, setTonAmount] = useState("0.01");
  const [cityDeparture, setCityDeparture] = useState("");
  const [city1, setCity1] = useState("");
  const [city2, setCity2] = useState("");
  const [cityDays, setCityDays] = useState("1");
  const [adults, setAdults] = useState("1");

  const [sliderValue, setSliderValue] = useState(1);

  const [departureDate, setDepartureDate] = useState("");

  const [tonRecipient, setTonRecipient] = useState("EQAA");

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

//<Input style={{ marginRight: 8 }} type="number" value={tonAmount} onChange={(e) => setTonAmount(e.target.value)}></Input>
//<Input type="number" value={cityDeparture} onChange={(e) => setCityDeparture(e.target.value)} >
//<Slider aria-label="Columns" value={sliderValue} onChange={handleSliderChange} min={1} max={6} step={1} />
//<Input type="number" min="1" value={cityDays} onChange={(e) => setCityDays(e.target.value)} ></Input>
//<Input value={cityDeparture} onChange={(e) => setCityDeparture(e.target.value)} ></Input>
//  <Slider aria-label="Columns" value={sliderValue} onChange={handleSliderChange} min={1} max={6} step={1} />
  return (
    <Card>
      <FlexBoxCol>
        <h3>Search Flight</h3>
        <FlexBoxRow>
          <label>Departure City: </label>
          <Input value={cityDeparture} onChange={(e) => setCityDeparture(e.target.value)} ></Input>
        </FlexBoxRow>

        <FlexBoxRow>
          <label>City 1: </label>
          <Input value={city1} onChange={(e) => setCity1(e.target.value)} ></Input>
        </FlexBoxRow>

        <FlexBoxRow>
          <label>City 2: </label>
          <Input value={city2} onChange={(e) => setCity2(e.target.value)} ></Input>
        </FlexBoxRow>

        <FlexBoxRow>
          <label>Days in each city: </label>
          <Input type="number" min="1" value={cityDays} onChange={(e) => setCityDays(e.target.value)} ></Input>
        </FlexBoxRow>

        <FlexBoxRow>
          <label>How many adults: </label>
          <Input type="number" min="1" value={adults} onChange={(e) => setAdults(e.target.value)} ></Input>
        </FlexBoxRow>

        <FlexBoxRow>
          <label>Date of departure: </label>
          <Input type="date" value={departureDate} min={getCurrentDate()} onChange={(e) => setDepartureDate(e.target.value)} ></Input>
          
        </FlexBoxRow>

        <Button disabled={!connected} style={{ marginTop: 18 }}
          onClick={async () => {
            sender.send({
              to: Address.parse(tonRecipient),
              value: toNano(tonAmount),
            });
          }}
        >Search</Button>
      </FlexBoxCol>
    </Card>
  );
}
