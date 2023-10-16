// single page application
import { redirectToAuthCodeFlow, getAccessToken } from "./authCodeWithPkce";

const clientId = "..."; //this needs to be changed for each person 
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
let token: string;
let topTracksIds: Array<string>;

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    token = accessToken;
    topTracksIds = await getTopTracks();

    console.log(topTracksIds);

}

async function fetchWebApi(endpoint: string, method: string, body?: JSON) {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method,
      body:JSON.stringify(body)
    });

    console.log(res);

    return await res.json();
  }
  
  async function getTopTracks(){
    // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
    return (await fetchWebApi(
      'v1/me/top/tracks?time_range=short_term&limit=4', 'GET'
    )).items;
  }

const activeCountries = new Map<string, string>([
    ["China","mandopop"],["Brazil","brazil"],["Japan","j-pop"],["United Kingdom","british"],["France","french"],["Germany","german"],["India","indian"], ["Iran","iranian"], ["South Korea (Republic of Korea)","k-pop"], ["Malaysia","malay"], ["Philippines","philippines-opm"], ["Spain","spanish"], ["Sweden","swedish"], ["Turkey","turkish"], ["Nigeria", ""], ["South Africa", ""]
]);

const countrySongs = new Map<string, string>([
    ["China",""],["Brazil",""],["Japan",""],["United Kingdom",""],["France",""],["Germany",""],["India",""], ["Iran",""], ["South Korea (Republic of Korea)",""], ["Malaysia",""], ["Philippines",""], ["Spain",""], ["Sweden",""], ["Turkey",""], ["Nigeria", ""], ["South Africa", ""]
]);

async function getRecommendation(country: string){
    // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-recommendations
    let rtn: string[];

    rtn = (await fetchWebApi(
      `v1/recommendations?limit=1&seed_tracks=${topTracksIds.join(',')}&seed_genres=${activeCountries.get(country)}&min-popularity=50`, 'GET'
    )).tracks;

    return rtn[0];
}

for (let country of activeCountries.keys()){
    let id: string;
    //id = getRecommendation(country);

    //countrySongs.set(country, id);
}