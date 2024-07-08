import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import logo from './kinetika_team_logo.png';
import wifiIcon from './icons/wifi.png';
import robotIcon from './icons/haberleşme.png';
import speedIcon from './icons/hız.png';
import batteryIcon from './icons/akü.png';
import currentIcon from './icons/akım.png';
import weightIcon from './icons/ağırlık.png';
import obstacleIcon from './icons/engel.png';
import heatIcon from './icons/sıcaklık.png';
import gasIcon from './icons/gaz.png';
import liftingIcon from './icons/kaldırma.png';
import './App.css';
import Clock from './Clock';

const DialButton = ({ onScenarioSelect, selectedScenario }) => {
  const [checked, setChecked] = useState(false);

  const handleCheckboxChange = () => {
    setChecked(!checked);
  };

  const handleButtonClick = (index) => {
    onScenarioSelect(index + 1);
  };

  return (
    <div className="dial-button-container">
      <input type="checkbox" id="dial" onChange={handleCheckboxChange} />
      {checked && (
        <div className="dial-buttons">
          {new Array(8).fill().map((_, index) => (
            <button
              key={`dial-button-${index}`}
              className={`dial-child-button ${selectedScenario === index + 1 ? 'selected' : ''}`}
              onClick={() => handleButtonClick(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
      <label htmlFor="dial" className="dial-toggle">
        <svg viewBox="0 0 24 24">
          <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
        </svg>
      </label>
      <label className="dial-button__cloak" htmlFor="dial" />
    </div>
  );
};

const DataDisplay = ({ label, value, icon }) => (
  <div className="data-display">
    <img src={icon} className="data-icon" alt={`${label} icon`} />
    <span className="data-label">{label}:</span>
    <span className="data-value">{value}</span>
  </div>
);

function App() {
  const [isConnected, setIsConnected] = useState({ robot: true, wifi: true });
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [robotData, setRobotData] = useState({
    speed: 0,
    battery: 100,
    current: 0,
    weight: 0,
    obstacle: false,
    heat: 25,
    gas: false,
    lifting: false,
  });

  useEffect(() => {
    const client = mqtt.connect('wss://eb9d3f26886e4180adf738f3425f8e19.s1.eu.hivemq.cloud:8884/mqtt', {
      username: 'bugraozcan',
      password: 'bugra123',
    });

    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      client.subscribe('encyclopedia/robot_state', (err) => {
        if (!err) {
          console.log('Subscribed to robot_state topic');
        } else {
          console.error('Failed to subscribe to robot_state topic:', err);
        }
      });
    });

    client.on('error', (err) => {
      console.error('Connection error:', err);
    });

    client.on('message', (topic, message) => {
      if (topic === 'encyclopedia/robot_state') {
        const data = JSON.parse(message.toString());
        console.log('Received data:', data);
        setRobotData({
          speed: data.Speed,
          battery: data.Battery_Status,
          current: data.Current,
          weight: data.Carried_Weight,
          obstacle: data.Barrier_Information,
          heat: data.Temperature,
          gas: data.Dangerous_Gas_Quantity,
          lifting: data.Weight_Lifting_Status,
        });
      }
    });

    return () => {
      client.end();
    };
  }, []);

  const isConnectedFunction = async () => {
    const robotConnection = Math.random() > 0.01; 
    let wifiConnection = navigator.onLine;

    if (wifiConnection) {
      try {
        const response = await fetch('https://www.google.com/', { mode: 'no-cors' });
        wifiConnection = response.ok;
      } catch (error) {
        wifiConnection = false;
      }
    }

    setIsConnected({ robot: robotConnection, wifi: wifiConnection });
  };

  useEffect(() => {
    const connectionCheckInterval = setInterval(() => {
      isConnectedFunction();
    }, 5000);
    return () => clearInterval(connectionCheckInterval);
  }, []);

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
  };

  const handleStartClick = () => {
    if (selectedScenario) {
      alert(`Robot senaryo ${selectedScenario} ile başlatılıyor`);
    } else {
      alert('Senaryo seçilmedi!');
    }
  };

  const handleStopClick = () => {
    setSelectedScenario(null);
  };

  const handleBattery = () => {
    if (robotData.battery <= 10) {
      alert('Akü bitmek üzere! Kalan güç 10%');
    } else if (robotData.battery <= 25) {
      alert('Akünün kalan şarjı 25%');
    }
  };

  useEffect(() => {
    handleBattery();
  }, [robotData.battery]);

  return (
    <div className="App">
      <div className="left-panel">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="Kinetika logo" />
          <span className="App-title">KİNETİKA</span>
          <Clock />
          <div className="connection-icons">
            {isConnected.robot ? <img src={robotIcon} className="App-icon" alt="Robot connected" /> : <div className="cloaked-icon" />}
            {isConnected.wifi ? <img src={wifiIcon} className="App-icon" alt="WiFi connected" /> : <div className="cloaked-icon" />}
          </div>
        </header>
        <div className="scenario-section">
          <h2>SENARYO</h2>
          <DialButton onScenarioSelect={handleScenarioSelect} selectedScenario={selectedScenario} />
        </div>
        <div className="control-buttons">
          <button className="start-button" onClick={handleStartClick}>BAŞLAT</button>
          <button className="stop-button" onClick={handleStopClick}>DURDUR</button>
        </div>
      </div>
      <div className="right-panel">
        <div className="data-section">
          <h2>ROBOT VERİLERİ</h2>
          <div className="data-grid">
            <DataDisplay label="Hız" value={`${robotData.speed.toFixed(2)} m/s`} icon={speedIcon} />
            <DataDisplay label="Akü" value={`${robotData.battery.toFixed(2)}%`} icon={batteryIcon} />
            <DataDisplay label="Akım" value={`${robotData.current.toFixed(2)} A`} icon={currentIcon} />
            <DataDisplay label="Kaldırılan Ağırlık" value={`${robotData.weight} kg`} icon={weightIcon} />
            <DataDisplay label="Engel Durumu" value={robotData.obstacle ? 'Var' : 'Yok'} icon={obstacleIcon} />
            <DataDisplay label="Sıcaklık" value={`${robotData.heat.toFixed(2)} °C`} icon={heatIcon} />
            <DataDisplay label="Tehlikeli Gaz" value={robotData.gas ? 'Var' : 'Yok'} icon={gasIcon} />
            <DataDisplay label="Kaldırma Durumu" value={robotData.lifting ? 'Evet' : 'Hayır'} icon={liftingIcon} />
          </div>
        </div>
        <div className="map-section">
          <h4>HARİTA</h4>
          <div className="map-placeholder">
            <div className="map-placeholder-content">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
