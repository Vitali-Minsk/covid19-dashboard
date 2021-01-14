import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import elements from '../nls/pageLayoutElements';
import createElem from '../utils/createElement';
import getSizeFromCount from './mapMarkerSizeCounter';
import clearContainer from '../utils/clearContainer';
import mapPopupBuild from './mapPopupBuilder';

const API_KEY = 'pk.eyJ1Ijoidml0YWxpYnVyYWtvdSIsImEiOiJja2lzd2hhZTYwcDBuMnFzYzNhazFnbmJiIn0.mfrcB7xDMdW2jJSJqOqnUQ';

export default class Map {
  constructor() {
    this.map = '';
    this.data = '';
    this.markers = [];
    this.indicator = '';
  }

  createMap = (data) => {
    mapboxgl.accessToken = API_KEY;
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v10',
      zoom: 0.5,
      center: [0, 0],
    });
    this.data = data;
    data.forEach((dataElement) => {
      const countryId = dataElement.countryInfo.iso3;
      const { cases } = dataElement;
      const el = this.renderMarker(countryId, cases);
      new mapboxgl.Marker(el)
        .setLngLat([dataElement.countryInfo.long, dataElement.countryInfo.lat])
        .addTo(this.map);
    });
    this.createLegendIcon();
    this.renderLegend();
  }

  createLegendIcon = () => {
    const map = document.getElementById('map');
    const legendIcon = createElem('button', 'map-legend-icon', 'L');
    map.prepend(legendIcon);
  }

  renderMarker = (countryCode, count) => {
    const el = createElem('div', 'marker');
    el.setAttribute('data-code', countryCode);
    this.markerSizeControl(el, count, 'big');
    this.markers.push(el);
    return el;
  }

  renderLegend = (markingList) => {
    const legend = document.querySelector('.map-legend');
    clearContainer(legend);
    if (markingList === 'big' || !markingList) { legend.insertAdjacentHTML('afterbegin', elements.mapLegend.markingBig); }
    if (markingList === 'middle') { legend.insertAdjacentHTML('afterbegin', elements.mapLegend.markingMiddle); }
    if (markingList === 'small') { legend.insertAdjacentHTML('afterbegin', elements.mapLegend.markingSmall); }
  }

  renderPopup = (country, indicator, indicatorCount) => {
    const popup = document.querySelector('.mapboxgl-popup');
    clearContainer(popup);
    popup.insertAdjacentHTML('afterbegin', mapPopupBuild(country, indicator, indicatorCount));
  }

  mapFlyToCountry = (currentCountry) => {
    const dataElement = this.data.find((e) => e.country === currentCountry);
    this.map.flyTo({
      center: [dataElement.countryInfo.long, dataElement.countryInfo.lat],
      zoom: 4,
      essential: true,
    });
  }

  mapFlyOut = () => {
    this.map.flyTo({
      center: [0, 0],
      zoom: 1,
      essential: true,
    });
  }

  markerResize = (indicator, isPer100k) => {
    let isLegendRendered = false;
    for (let i = 0; i < this.markers.length; i += 1) {
      const currentIndicatorCount = this.data[i][indicator];
      const currentMarker = this.markers[i];
      if ((indicator === 'cases' || indicator === 'deaths' || indicator === 'recovered') && !isPer100k) {
        this.markerSizeControl(currentMarker, currentIndicatorCount, 'big');
        if (!isLegendRendered) {
          this.renderLegend('big');
          isLegendRendered = true;
        }
      } else if ((indicator === 'todayCases' || indicator === 'todayDeaths' || indicator === 'todayRecovered') && isPer100k) {
        this.markerSizeControl(currentMarker, currentIndicatorCount, 'small');
        if (!isLegendRendered) {
          this.renderLegend('small');
          isLegendRendered = true;
        }
      } else {
        this.markerSizeControl(currentMarker, currentIndicatorCount, 'middle');
        if (!isLegendRendered) {
          this.renderLegend('middle');
          isLegendRendered = true;
        }
      }
    }
  }

  markerSizeControl = (marker, count, sizeNumbers) => {
    const size = getSizeFromCount(count, sizeNumbers);
    const currentMarker = marker.style;
    currentMarker.width = `${size}px`;
    currentMarker.height = `${size}px`;
  }
}
