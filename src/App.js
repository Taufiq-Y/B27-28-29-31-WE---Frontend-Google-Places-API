import ReactMapGL, { Marker, Popup } from "react-map-gl";
import RoomIcon from "@material-ui/icons/Room";
import StarIcon from "@material-ui/icons/Star";
import { format } from "timeago.js";
import { useEffect, useState } from "react";
import Register from "./components/Register"
import Login from "./components/Login"
import axios from "axios";
import "./App.css";

function App() {
  const myStorage = window.localStorage;
  const [currentUsername, setCurrentUsername] = useState(myStorage.getItem("user"));
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [star, setStar] = useState(null);
  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    latitude: 46,
    longitude: 17,
    zoom: 4,
  });

  const [showRegister, setShowRegister] = useState(false)
  const [showLogin, setShowLogin] = useState(false)


  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewport({ ...viewport, latitude: lat, longitude: long });
  };

  const handleAddClick = (e) => {
    const [longitude, latitude] = e.lnglat;
    setNewPlace({
      lat: latitude,
      long: longitude,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUsername,
      title,
      desc,
      rating: star,
      lat: newPlace.lat,
      long: newPlace.long
    };

    try {
      const res = await axios.post("/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const getPins = async () => {
      try {
        const allPins = await axios.get("/pins");
        setPins(allPins.data);
      } catch (error) {
        console.log(error);
      }
    };
    getPins();
  }, []);

  const handleLogout = () => {
    setCurrentUsername(null);
    myStorage.removeItem("user")
  }


  return (
    <>
      <div className="App">
        <ReactMapGL
          {...viewport}
          mapboxApiAccessToken="pk.eyJ1IjoibXVoYW1tZWQtdGF1ZmlxIiwiYSI6ImNsNGI3dmx1dTAxNGwzbG11a3M0am9pMW8ifQ.xiV0_L7A3ZvjlHn5dDVuug"
          // width="100%"
          // height="100%"
          onViewportChange={(viewport) => setViewport(viewport)}
          mapStyle="mapbox://styles/muhammed-taufiq/cl4bep3ka000a16qs3kk5u6rj"
          onDblClick={currentUsername && handleAddClick}
        >
          {pins.map((p) => (
            <>
              <Marker
                longitude={p.lat}
                latitude={p.long}
                offsetLeft={-3.5 * viewport.zoom}
                offsetTop={-7 * viewport.zoom}
                anchor="bottom"
              >
                <RoomIcon
                  style={{ fontSize: 7 * viewport.zoom,
                  color: currentUsername === p.username ? "tomato" : "slateblue",
                  cursor: "pointer"
                }}
                  onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
                />
              </Marker>
              {p._id === currentPlaceId && (
                <Popup
                  key={p._id}
                  longitude={p.long}
                  latitude={p.lat}
                  closeButton={true}
                  closeOnClick={false}
                  onClose={() => setCurrentPlaceId(null)}
                  anchor="left"
                >
  
                  <div className="card">
                    <label>Place</label>
                    <h4 className="place">{p.title}</h4>
                    <label>Review</label>
                    <p className="desc">{p.desc}</p>
                    <label>Rating</label>
                    <div className="stars">
                    {Array(p.rating).fill(<StarIcon className="star" />)}
                    </div>
                    <label>Information</label>
                    <span className="username">
                      Created by <b>{p.username}</b>
                    </span>
                    <span className="date">{format(p.createdAt)}</span>
                  </div>
                </Popup>
              )}
            </>
          ))}
          {newPlace && (
            <>
            <Marker 
            latitude={newPlace.lat}
            longitude={newPlace.long}
            offsetLeft={-3.5 * viewport.zoom}
            offsetTop={-7 * viewport.zoom}
            >
              <RoomIcon
                style={{
                  fontSize: 7 * viewport.zoom,
                  color: "tomato",
                  cursor: "pointer",
                }}
              />
            </Marker>
            <Popup 
            latitude={newPlace.lat}
            longitude={newPlace.long}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setNewPlace(null)}
            anchor="left"
            >  
                <div>
                    <form onSubmit={handleSubmit}>
                      <label>Title</label>
                      <input
                        placeholder="Enter a title here"
                        autoFocus
                        onChange={(e) => setTitle(e.target.value)}
                      />
                      <label>Description</label>
                      <input
                        placeholder="Say us something about this place."
                        autoFocus
                        onChange={(e) => setDesc(e.target.value)}
                      />
                      <label>Rating</label>
                      <select onChange={(e) => setStar(e.target.value)}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                      <button type="submit" className="submitbutton">Add Pin</button>
                    </form>
                  </div>  
                  </Popup>
                  </>
          )}
          {currentUsername ? (
            <button className="button logout" onClick={handleLogout}>Log Out</button>
          ) : (
            <div className="buttons">
               <button className="button login" onClick={() => setShowLogin(true)}>Log in</button>
               <button className="button register" onClick={() => setShowRegister}>Registert</button>
            </div>
          )}
          {showRegister && <Register setShowregister={setShowRegister} />}
          {showLogin && <Login setShowLogin={setShowLogin} myStorage={myStorage} setCurrentUsername={setCurrentUsername} />}
       
        </ReactMapGL>
      </div>
    </>
  );
}

export default App;
