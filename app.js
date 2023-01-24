import Goth from './gothic.js';


const CLI_ID = '764306262696-esbdj8daoee741d44fdhrh5fehjtjjm5.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBG5YxMTiBdvxD5-xxVp0LA1M8IXz8Xtbo';
// const SCOPES = 'https://www.googleapis.com/auth/drive.metadata'; // Space delimited if more than one
// const DISCOVERY = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly'; // Space delimited if more than one
const DISCOVERY =   [
                    "https://sheets.googleapis.com/$discovery/rest?version=v4", 
                    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
                    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
                    ];

/**
 * The google libraries are loaded, and ready for action!
 */
function proceedAsLoaded() {
  if (Goth.recognize()) {
    Goth.onetap();
  } else {
    forceSignin();
  }
}

/**
 * They have to correctly get through the button click / sign up flow to proceed.
 */
function forceSignin() {
  Goth.button('signin', {type: 'standard', size: 'large', text: 'signup_with'});
}

function signoutEvent() {
  document.getElementById('content').innerHTML = '';
  document.getElementById('signout').style.display = 'none';
  document.getElementById('signin').style.display = 'block';
  forceSignin();
}

function proceedAsSignedIn() {
  document.getElementById('signin').style.display = 'none';
  document.getElementById('signout').style.display = 'block';
  list_files();
}
/**
 * Just to demonstrate that the APIs *can* successfully be called.
 */
async function list_files() {

  let params = {
    'pageSize': 5,
    'fields': 'files(id, name)',
  }

  console.log('before gapi')

  let response = await window.gapi.client.drive.files.list(params)
    .then(response => {
        console.log('gapi first try', JSON.stringify(response))
        return response})
    .catch(err  => {
        console.log('gapi error', err)
        token(err) })  // for authorization errors obtain an access token
    .then(retry => {
        console.log('gapi retry', retry)
        window.gapi.client.drive.files.list(params)
        return retry})
    .catch(err  => console.log(err));   // cancelled by user, timeout, etc.

    console.log('after gapi')

//   try {
//     response = await window.gapi.client.drive.files.list({
//       'pageSize': 5,
//       'fields': 'files(id, name)',
//     });
//   } catch (err) {
//     document.getElementById('content').innerText = err.message;
//     return;
//   }
console.log('before res', response)

const res = async () => {
    const rtn = await response;
    console.log(rtn);
  };
  console.log('after res', res)

  const files = res.result.files;
  if (!files || files.length == 0) {
    document.getElementById('content').innerText = 'No files found.';
    return;
  }
  // Flatten to string to display
  const output = files.reduce(
      (str, file) => `${str}${file.name} (${file.id}\n`,
      'Files:\n');
  document.getElementById('content').innerText = output + '\n' + new Date();
}

/**
 * Handle the lifecycle of authenticated status
 */
function gothWatch(event) {
  switch (event) {
    case 'signin':
      proceedAsSignedIn();
      break;
    case 'revoke':
    case 'signout': 
      signoutEvent();
      break;
    case 'loaded':
      proceedAsLoaded();
      break;
    case 'onetap_suppressed':
      forceSignin();  // If a user bypasses onetap flows, we land them with a button.
      break;
    default: 
      console.log("Well, this is a surprise!");
      console.log(event);
  }
}

/**
 * Wire up the main ux machinery.
 */
function main() {
  Goth.observe(gothWatch);
  Goth.load(CLI_ID, API_KEY, SCOPES, DISCOVERY);
  const signout = document.getElementById('signout');
  signout.style.display = 'none';
  const signout_btn = document.getElementById('signout_button');
  const revoke_btn = document.getElementById('revoke_button');
  const readDrive_btn = document.getElementById('readDrive_button');
  signout_btn.onclick = Goth.signout;
  revoke_btn.onclick = Goth.revoke;
  readDrive_btn.onclick = list_files;
}

main();
