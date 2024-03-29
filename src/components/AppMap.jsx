import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  withScriptjs,
  withGoogleMap,
  Marker,
  DirectionsRenderer
} from "react-google-maps";
import { SearchBox } from "react-google-maps/lib/components/places/SearchBox";
import _ from "lodash";

const Map = React.memo(props => {
  const myWayPoints = props.markers.map(m => {
    const str = m.position.lat + "," + m.position.lng;
    return { location: str };
  });

  useEffect(() => {
    if (props.markers.length <= 1) return;
    const DirectionsService = new window.google.maps.DirectionsService();
    DirectionsService.route(
      {
        origin:
          props.markers[0].position.lat + "," + props.markers[0].position.lng,
        waypoints: myWayPoints,
        destination:
          props.markers[0].position.lat + "," + props.markers[0].position.lng,
        travelMode: window.google.maps.TravelMode.WALKING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          props.handleDirections(result);
        } else {
          console.error(`error fetching directions ${JSON.stringify(result)}`);
        }
      }
    );
  }, [props.markers]);

  return (
    <GoogleMap
      onClick={props.handleMapClicked}
      ref={props.onMapMounted}
      onBoundsChanged={props.onBoundsChanged}
      defaultZoom={12}
      center={props.center}
      defaultCenter={{ lat: 48.866667, lng: 2.333333 }}
    >
      <SearchBox
        ref={props.onSearchBoxMounted}
        onPlacesChanged={props.onPlacesChanged}
        controlPosition={window.google.maps.ControlPosition.TOP_LEFT}
      >
        <input
          type="text"
          style={{
            boxSizing: `border-box`,
            backgroundColor: "black",
            color: "white",
            border: `1px solid transparent`,
            width: `240px`,
            height: `32px`,
            marginTop: `27px`,
            padding: `0 12px`,
            borderRadius: `3px`,
            boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
            fontSize: `14px`,
            outline: `none`,
            textOverflow: `ellipses`
          }}
        />
      </SearchBox>
      {props.markers.map((marker, i) => (
        <Marker
          onClick={props.handleMarkerClick}
          icon={{
            url: "https://image.flaticon.com/icons/svg/1241/1241771.svg",
            scaledSize: new window.google.maps.Size(16, 16)
          }}
          key={i}
          position={marker.position}
        />
      ))}
      <DirectionsRenderer directions={props.directions} />
    </GoogleMap>
  );
});

const WrapperMap = withScriptjs(withGoogleMap(Map));

const AppMap = props => {
  const [state, setState] = useState({});
  const refs = {};

  useEffect(() => {
    setState({
      ...state,
      bounds: null,
      center: {
        lat: 48.866667,
        lng: 2.333333
      },
      markers: []
    });
    /* eslint-disable */
  }, []);

  const onSearchBoxMounted = ref => (refs.searchBox = ref);
  const onMapMounted = ref => (refs.map = ref);
  const onBoundsChanged = () => {
    setState({
      ...state,
      bounds: refs.map.getBounds(),
      center: refs.map.getCenter()
    });
  };

  const onPlacesChanged = () => {
    const places = refs.searchBox.getPlaces();
    const bounds = new window.google.maps.LatLngBounds();
    places.forEach(place => {
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    const nextMarkers = places.map(place => ({
      position: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }
    }));

    const nextCenter = _.get(nextMarkers, "0.position", state.center);
    setState({
      ...state,
      center: nextCenter,
      markers: [...state.markers, ...nextMarkers]
    });
  };

  const handleDirections = result => {
    setState({ ...state, directions: result });
  };
  const handleMarkerClick = props => {
    console.log(props);
    console.log(props.latLng.lat());
    console.log(props.latLng.lng());
  };
  const handleMapClicked = e => {
    setState({
      ...state,
      markers: [
        ...state.markers,
        { position: { lat: e.latLng.lat(), lng: e.latLng.lng() } }
      ]
    });
  };
  return (
    <div style={{ height: "50vh" }}>
      <WrapperMap
        handleMapClicked={handleMapClicked}
        handleMarkerClick={handleMarkerClick}
        directions={state.directions}
        onBoundsChanged={onBoundsChanged}
        center={state.center}
        onMapMounted={onMapMounted}
        markers={state.markers}
        onSearchBoxMounted={onSearchBoxMounted}
        onPlacesChanged={onPlacesChanged}
        handleDirections={handleDirections}
        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&v=3.exp&libraries=geometry,drawing,places&key=${process.env.REACT_APP_GOOGLE_APIKEY}`}
        loadingElement={<div style={{ height: "100%" }} />}
        containerElement={<div style={{ height: "100%" }} />}
        mapElement={<div style={{ height: "100%" }} />}
      />
    </div>
  );
};

export default AppMap;
